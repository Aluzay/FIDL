import {
    InstagramClient
} from "./clients/InstagramClient.js";

import {
    FacebookClient
} from "./clients/FacebookClient.js";

import {
    DiscordClient
} from "./clients/DiscordClient.js";

import {
    MediaResolver
} from "./media/MediaResolver.js";

import {
    MediaPool
} from "./media/MediaPool.js";

import {
    PlainTextRenderer
} from "./renderers/PlainTextRenderer.js";

import {
    DiscordRenderer
} from "./renderers/DiscordRenderer.js";

export class FIDLClient {
    constructor({
        mediaProvider = null,
        instagram = null,
        facebook = null,
        discord = null
    } = {}) {
        this.mediaResolver =
            new MediaResolver(mediaProvider);

        this.plainTextRenderer =
            new PlainTextRenderer();

        this.discordRenderer =
            new DiscordRenderer();

        this.clients = {};

        if (instagram) {
            this.clients.instagram =
                new InstagramClient({
                    ...instagram,
                    mediaProvider: null
                });
        }

        if (facebook) {
            this.clients.facebook =
                new FacebookClient({
                    ...facebook,
                    mediaProvider: null
                });
        }

        if (discord) {
            this.clients.discord =
                new DiscordClient(discord);
        }
    }

    getConfiguredPlatforms() {
        return Object.keys(this.clients);
    }

    normalizePlatforms(platforms) {
        if (platforms == null) {
            return Object.fromEntries(
                this.getConfiguredPlatforms().map(
                    platform => [platform, {}]
                )
            );
        }

        if (Array.isArray(platforms)) {
            return Object.fromEntries(
                platforms.map(platform => [
                    platform,
                    {}
                ])
            );
        }

        if (
            typeof platforms !== "object" ||
            Array.isArray(platforms)
        ) {
            throw new Error(
                "platforms must be an array or object"
            );
        }

        const normalized = {};

        for (const [platform, options] of Object.entries(platforms)) {
            if (options === false || options == null) {
                continue;
            }

            normalized[platform] =
                options === true ? {} : options;
        }

        return normalized;
    }

    validatePlatform(platform) {
        if (!this.clients[platform]) {
            throw new Error(
                `Platform "${platform}" is not configured`
            );
        }
    }

    getMediaIndexes({
        options,
        mediaCount
    }) {
        if (options.media == null) {
            return Array.from(
                { length: mediaCount },
                (_, index) => index
            );
        }

        if (!Array.isArray(options.media)) {
            throw new Error(
                "Platform media selection must be an array of indexes"
            );
        }

        for (const index of options.media) {
            if (
                !Number.isInteger(index) ||
                index < 0 ||
                index >= mediaCount
            ) {
                throw new Error(
                    `Invalid media index: ${index}`
                );
            }
        }

        return options.media;
    }

    async publish({
        message = "",
        media = [],
        platforms = null
    } = {}) {
        if (!Array.isArray(media)) {
            throw new Error("media must be an array");
        }

        const platformOptions =
            this.normalizePlatforms(platforms);

        const platformNames =
            Object.keys(platformOptions);

        if (platformNames.length === 0) {
            throw new Error(
                "At least one platform must be selected"
            );
        }

        for (const platform of platformNames) {
            this.validatePlatform(platform);
        }

        const mediaPool =
            new MediaPool(this.mediaResolver);

        const mediaByIndex = new Map();

        try {
            const neededIndexes = new Set();

            for (const platform of platformNames) {
                const indexes =
                    this.getMediaIndexes({
                        options:
                            platformOptions[platform],
                        mediaCount:
                            media.length
                    });

                for (const index of indexes) {
                    neededIndexes.add(index);
                }
            }

            await Promise.all(
                [...neededIndexes].map(
                    async index => {
                        mediaByIndex.set(
                            index,
                            await mediaPool.resolve(
                                media[index]
                            )
                        );
                    }
                )
            );

            const publications =
                platformNames.map(platform =>
                    this.publishToPlatform({
                        platform,
                        options:
                            platformOptions[platform],
                        globalMessage: message,
                        globalMedia: media,
                        mediaByIndex
                    })
                );

            const settled =
                await Promise.allSettled(
                    publications
                );

            const results = {};

            platformNames.forEach(
                (platform, index) => {
                    results[platform] =
                        settled[index];
                }
            );

            return results;
        } finally {
            await mediaPool.cleanup();
        }
    }

    async publishToPlatform({
        platform,
        options,
        globalMessage,
        globalMedia,
        mediaByIndex
    }) {
        const indexes =
            this.getMediaIndexes({
                options,
                mediaCount:
                    globalMedia.length
            });

        const imageUrls =
            indexes.map(
                index =>
                    mediaByIndex.get(index).url
            );

        const rawMessage =
            options.message ??
            globalMessage;

        switch (platform) {
            case "instagram":
                return this.publishInstagram({
                    message:
                        this.plainTextRenderer.render(
                            rawMessage
                        ),
                    imageUrls
                });

            case "facebook":
                return this.publishFacebook({
                    message:
                        this.plainTextRenderer.render(
                            rawMessage
                        ),
                    imageUrls
                });

            case "discord": {
                const rendered =
                    this.discordRenderer.render({
                        message: rawMessage,
                        everyone:
                            options.everyone,
                        here:
                            options.here,
                        mentions:
                            options.mentions
                    });

                return this.clients.discord.publish({
                    content:
                        rendered.content,
                    imageUrls,
                    allowedMentions:
                        rendered.allowedMentions
                });
            }

            default:
                throw new Error(
                    `Unsupported platform: ${platform}`
                );
        }
    }

    async publishInstagram({
        message,
        imageUrls
    }) {
        if (imageUrls.length === 0) {
            throw new Error(
                "Instagram requires at least one image"
            );
        }

        if (imageUrls.length === 1) {
            return this.clients.instagram.publishPhoto({
                image: imageUrls[0],
                caption: message
            });
        }

        return this.clients.instagram.publishPhotos({
            images: imageUrls,
            caption: message
        });
    }

    async publishFacebook({
        message,
        imageUrls
    }) {
        if (imageUrls.length === 0) {
            return this.clients.facebook.publishPost({
                message
            });
        }

        if (imageUrls.length === 1) {
            return this.clients.facebook.publishPhoto({
                image: imageUrls[0],
                caption: message
            });
        }

        return this.clients.facebook.publishPhotos({
            images: imageUrls,
            message
        });
    }
}
