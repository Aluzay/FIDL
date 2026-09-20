import { access } from "node:fs/promises";
import path from "node:path";

export class MediaResolver {
    constructor(mediaProvider = null) {
        this.mediaProvider = mediaProvider;
    }

    isRemoteUrl(source) {
        return (
            typeof source === "string" &&
            (source.startsWith("https://") || source.startsWith("http://"))
        );
    }

    getCacheKey(source) {
        if (typeof source !== "string") {
            return source;
        }

        if (this.isRemoteUrl(source)) {
            return `url:${source}`;
        }

        return `file:${path.resolve(source)}`;
    }

    async resolve(source) {
        if (typeof source !== "string" || source.trim() === "") {
            throw new Error("Media source must be a URL or local file path");
        }

        if (this.isRemoteUrl(source)) {
            return {
                source,
                url: source,
                temporary: false
            };
        }

        const filePath = path.resolve(source);

        try {
            await access(filePath);
        } catch {
            throw new Error(`Local media file not found: ${filePath}`);
        }

        if (!this.mediaProvider) {
            throw new Error(
                "A mediaProvider is required to publish local files"
            );
        }

        const uploaded = await this.mediaProvider.upload(filePath);

        if (!uploaded?.url) {
            throw new Error(
                "mediaProvider.upload() must return an object containing a url"
            );
        }

        return {
            source,
            url: uploaded.url,
            temporary: true,
            uploaded
        };
    }

    async cleanup(media) {
        if (!media?.temporary || !this.mediaProvider) {
            return;
        }

        await this.mediaProvider.remove(media.uploaded);
    }
}
