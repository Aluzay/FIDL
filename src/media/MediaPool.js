export class MediaPool {
    constructor(mediaResolver) {
        if (!mediaResolver) {
            throw new Error("mediaResolver is required");
        }

        this.mediaResolver = mediaResolver;
        this.cache = new Map();
    }

    async resolve(source) {
        const key = this.mediaResolver.getCacheKey(source);

        if (this.cache.has(key)) {
            return this.cache.get(key);
        }

        const pending = this.mediaResolver.resolve(source);
        this.cache.set(key, pending);

        try {
            return await pending;
        } catch (error) {
            this.cache.delete(key);
            throw error;
        }
    }

    async resolveMany(sources) {
        return Promise.all(
            sources.map(source => this.resolve(source))
        );
    }

    async cleanup() {
        const uniqueMedia = new Set();

        for (const pending of this.cache.values()) {
            try {
                uniqueMedia.add(await pending);
            } catch {
                // Failed resolutions have nothing to clean up.
            }
        }

        const results = await Promise.allSettled(
            [...uniqueMedia].map(media =>
                this.mediaResolver.cleanup(media)
            )
        );

        this.cache.clear();
        return results;
    }
}
