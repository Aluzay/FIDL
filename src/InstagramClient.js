import {
    MediaResolver
} from "./media/MediaResolver.js";

export class InstagramClient {
    constructor({
        accessToken,
        userId,
        mediaProvider = null
    }) {
        if (!accessToken) {
            throw new Error(
                "accessToken is required"
            );
        }

        if (!userId) {
            throw new Error(
                "userId is required"
            );
        }

        this.accessToken = accessToken;
        this.userId = userId;

        this.baseUrl =
            "https://graph.instagram.com/v26.0";

        this.mediaResolver =
            new MediaResolver(mediaProvider);
    }

    async request(path, options = {}) {
        const {
            method = "GET",
            params = {},
            body = null
        } = options;

        const url =
            new URL(`${this.baseUrl}${path}`);

        for (
            const [key, value]
            of Object.entries(params)
        ) {
            url.searchParams.set(
                key,
                value
            );
        }

        const response = await fetch(
            url,
            {
                method,

                headers: {
                    Authorization:
                        `Bearer ${this.accessToken}`,

                    ...(body && {
                        "Content-Type":
                            "application/json"
                    })
                },

                ...(body && {
                    body: JSON.stringify(body)
                })
            }
        );

        const data =
            await response.json();

        if (!response.ok) {
            throw new Error(
                `Instagram API error ${response.status}: ${JSON.stringify(data)}`
            );
        }

        return data;
    }

    async getAccount() {
        return this.request(
            "/me",
            {
                params: {
                    fields:
                        "id,username,account_type,media_count"
                }
            }
        );
    }

    async getMedia() {
        return this.request(
            "/me/media",
            {
                params: {
                    fields:
                        "id,caption,media_type,media_url,permalink,timestamp"
                }
            }
        );
    }

    async getContainerStatus(
        containerId
    ) {
        return this.request(
            `/${containerId}`,
            {
                params: {
                    fields:
                        "status_code,status"
                }
            }
        );
    }

    async waitForContainer(
        containerId,
        {
            interval = 2000,
            timeout = 60000
        } = {}
    ) {
        const startedAt =
            Date.now();

        while (
            Date.now() - startedAt
            < timeout
        ) {
            const container =
                await this.getContainerStatus(
                    containerId
                );

            if (
                container.status_code
                === "FINISHED"
            ) {
                return container;
            }

            if (
                container.status_code
                === "ERROR"
            ) {
                throw new Error(
                    `Instagram media processing failed: ${container.status}`
                );
            }

            if (
                container.status_code
                === "EXPIRED"
            ) {
                throw new Error(
                    "Instagram media container expired"
                );
            }

            await new Promise(
                resolve =>
                    setTimeout(
                        resolve,
                        interval
                    )
            );
        }

        throw new Error(
            "Instagram media processing timed out"
        );
    }

    async publishContainer(
        containerId
    ) {
        return this.request(
            `/${this.userId}/media_publish`,
            {
                method: "POST",

                body: {
                    creation_id:
                        containerId
                }
            }
        );
    }

    async createPhotoContainer({
        imageUrl,
        caption = ""
    }) {
        const result =
            await this.request(
                `/${this.userId}/media`,
                {
                    method: "POST",

                    body: {
                        image_url:
                            imageUrl,

                        caption
                    }
                }
            );

        return result.id;
    }

    async createCarouselItem(
        imageUrl
    ) {
        const result =
            await this.request(
                `/${this.userId}/media`,
                {
                    method: "POST",

                    body: {
                        image_url:
                            imageUrl,

                        is_carousel_item:
                            true
                    }
                }
            );

        return result.id;
    }

    async createCarouselContainer({
        children,
        caption = ""
    }) {
        const result =
            await this.request(
                `/${this.userId}/media`,
                {
                    method: "POST",

                    body: {
                        media_type:
                            "CAROUSEL",

                        children:
                            children.join(","),

                        caption
                    }
                }
            );

        return result.id;
    }

    async publishPhoto({
        image,
        imageUrl,
        caption = ""
    }) {
        // imageUrl gardé pour compatibilité
        // avec ton ancien code
        const source =
            image ?? imageUrl;

        if (!source) {
            throw new Error(
                "image is required"
            );
        }

        const media =
            await this.mediaResolver.resolve(
                source
            );

        try {
            const containerId =
                await this.createPhotoContainer({
                    imageUrl: media.url,
                    caption
                });

            await this.waitForContainer(
                containerId
            );

            return await this.publishContainer(
                containerId
            );
        } finally {
            await Promise.allSettled([
                this.mediaResolver.cleanup(
                    media
                )
            ]);
        }
    }

    async publishPhotos({
        images,
        imageUrls,
        caption = ""
    }) {
        // Compatibilité avec l'ancien nom
        const sources =
            images ?? imageUrls;

        if (!Array.isArray(sources)) {
            throw new Error(
                "images must be an array"
            );
        }

        if (sources.length < 2) {
            throw new Error(
                "publishPhotos requires at least 2 images"
            );
        }

        const resolvedMedia = [];
        const childIds = [];

        try {
            for (
                const source
                of sources
            ) {
                const media =
                    await this.mediaResolver.resolve(
                        source
                    );

                resolvedMedia.push(
                    media
                );

                const childId =
                    await this.createCarouselItem(
                        media.url
                    );

                await this.waitForContainer(
                    childId
                );

                childIds.push(
                    childId
                );
            }

            const carouselId =
                await this.createCarouselContainer({
                    children: childIds,
                    caption
                });

            await this.waitForContainer(
                carouselId
            );

            return await this.publishContainer(
                carouselId
            );
        } finally {
            await Promise.allSettled(
                resolvedMedia.map(
                    media =>
                        this.mediaResolver.cleanup(
                            media
                        )
                )
            );
        }
    }
}