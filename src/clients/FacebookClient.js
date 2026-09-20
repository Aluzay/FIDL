import {
    MediaResolver
} from "../media/MediaResolver.js";

export class FacebookClient {
    constructor({
        pageId,
        accessToken,
        mediaProvider = null,
        apiVersion = "v26.0"
    }) {
        if (!pageId) {
            throw new Error("pageId is required");
        }

        if (!accessToken) {
            throw new Error("accessToken is required");
        }

        this.pageId = pageId;
        this.accessToken = accessToken;
        this.baseUrl =
            `https://graph.facebook.com/${apiVersion}`;

        this.mediaResolver =
            new MediaResolver(mediaProvider);
    }

    async request(
        path,
        {
            method = "GET",
            params = {},
            body = null
        } = {}
    ) {
        const url = new URL(`${this.baseUrl}${path}`);

        for (const [key, value] of Object.entries(params)) {
            url.searchParams.set(key, value);
        }

        const options = {
            method,
            headers: {
                Authorization:
                    `Bearer ${this.accessToken}`
            }
        };

        if (body) {
            const form = new URLSearchParams();

            for (const [key, value] of Object.entries(body)) {
                form.set(key, value);
            }

            options.headers["Content-Type"] =
                "application/x-www-form-urlencoded";

            options.body = form;
        }

        const response = await fetch(url, options);
        const data = await response.json();

        if (!response.ok) {
            throw new Error(
                `Facebook API error ${response.status}: ${JSON.stringify(data)}`
            );
        }

        return data;
    }

    async getPage() {
        return this.request(
            `/${this.pageId}`,
            {
                params: {
                    fields: "id,name"
                }
            }
        );
    }

    async publishPost({
        message
    }) {
        if (!message) {
            throw new Error("message is required");
        }

        return this.request(
            `/${this.pageId}/feed`,
            {
                method: "POST",
                body: {
                    message
                }
            }
        );
    }

    async publishPhoto({
        image,
        imageUrl,
        caption = ""
    }) {
        const source = image ?? imageUrl;

        if (!source) {
            throw new Error("image is required");
        }

        const media =
            await this.mediaResolver.resolve(source);

        try {
            return await this.request(
                `/${this.pageId}/photos`,
                {
                    method: "POST",
                    body: {
                        url: media.url,
                        caption
                    }
                }
            );
        } finally {
            await Promise.allSettled([
                this.mediaResolver.cleanup(media)
            ]);
        }
    }

    async uploadUnpublishedPhoto(imageUrl) {
        const result = await this.request(
            `/${this.pageId}/photos`,
            {
                method: "POST",
                body: {
                    url: imageUrl,
                    published: "false"
                }
            }
        );

        return result.id;
    }

    async publishPhotos({
        images,
        imageUrls,
        message = ""
    }) {
        const sources = images ?? imageUrls;

        if (!Array.isArray(sources)) {
            throw new Error("images must be an array");
        }

        if (sources.length < 2) {
            throw new Error(
                "publishPhotos requires at least 2 images"
            );
        }

        const resolvedMedia = [];
        const photoIds = [];

        try {
            for (const source of sources) {
                const media =
                    await this.mediaResolver.resolve(
                        source
                    );

                resolvedMedia.push(media);

                const photoId =
                    await this.uploadUnpublishedPhoto(
                        media.url
                    );

                photoIds.push(photoId);
            }

            const body = {
                message
            };

            photoIds.forEach(
                (photoId, index) => {
                    body[`attached_media[${index}]`] =
                        JSON.stringify({
                            media_fbid: photoId
                        });
                }
            );

            return await this.request(
                `/${this.pageId}/feed`,
                {
                    method: "POST",
                    body
                }
            );
        } finally {
            await Promise.allSettled(
                resolvedMedia.map(media =>
                    this.mediaResolver.cleanup(media)
                )
            );
        }
    }
}
