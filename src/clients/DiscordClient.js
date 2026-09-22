export class DiscordClient {
    constructor({
        token,
        channelId
    }) {
        if (!token) {
            throw new Error(
                "Discord bot token is required"
            );
        }

        if (!channelId) {
            throw new Error(
                "Discord channelId is required"
            );
        }

        this.token = token;
        this.channelId = channelId;

        this.baseUrl =
            "https://discord.com/api/v10";
    }

    async downloadImage(
        imageUrl,
        index
    ) {
        const response =
            await fetch(imageUrl);

        if (!response.ok) {
            throw new Error(
                `Failed to download Discord image ${imageUrl}: ${response.status}`
            );
        }

        const contentType =
            response.headers.get(
                "content-type"
            ) ?? "application/octet-stream";

        const extension =
            this.getExtension(contentType);

        const blob =
            new Blob(
                [
                    await response.arrayBuffer()
                ],
                {
                    type: contentType
                }
            );

        return {
            blob,
            filename:
                `image-${index}${extension}`
        };
    }

    getExtension(contentType) {
        switch (
            contentType
                .split(";")[0]
                .trim()
                .toLowerCase()
        ) {
            case "image/jpeg":
                return ".jpg";

            case "image/png":
                return ".png";

            case "image/gif":
                return ".gif";

            case "image/webp":
                return ".webp";

            default:
                return "";
        }
    }

    async publish({
        content = "",
        imageUrls = [],
        allowedMentions = {
            parse: []
        }
    } = {}) {
        if (imageUrls.length > 10) {
            throw new Error(
                "Discord supports up to 10 files per message"
            );
        }

        const form =
            new FormData();

        const attachments = [];

        for (
            let index = 0;
            index < imageUrls.length;
            index++
        ) {
            const file =
                await this.downloadImage(
                    imageUrls[index],
                    index
                );

            attachments.push({
                id: index,
                filename: file.filename
            });

            form.append(
                `files[${index}]`,
                file.blob,
                file.filename
            );
        }

        const payload = {
            content,

            allowed_mentions:
                allowedMentions,

            attachments
        };

        form.append(
            "payload_json",
            JSON.stringify(payload)
        );

        const response =
            await fetch(
                `${this.baseUrl}/channels/${this.channelId}/messages`,
                {
                    method: "POST",

                    headers: {
                        Authorization:
                            `Bot ${this.token}`
                    },

                    body: form
                }
            );

        const data =
            await response.json();

        if (!response.ok) {
            throw new Error(
                `Discord API error ${response.status}: ${JSON.stringify(data)}`
            );
        }

        return data;
    }
}