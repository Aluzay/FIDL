export class DiscordClient {
    constructor({
        webhookUrl
    }) {
        if (!webhookUrl) {
            throw new Error("webhookUrl is required");
        }

        this.webhookUrl = webhookUrl;
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
                "Discord webhook messages support up to 10 embeds"
            );
        }

        const url = new URL(this.webhookUrl);
        url.searchParams.set("wait", "true");

        const payload = {
            content,
            allowed_mentions: allowedMentions
        };

        if (imageUrls.length > 0) {
            payload.embeds = imageUrls.map(imageUrl => ({
                image: {
                    url: imageUrl
                }
            }));
        }

        const response = await fetch(
            url,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(payload)
            }
        );

        const data = await response.json();

        if (!response.ok) {
            throw new Error(
                `Discord API error ${response.status}: ${JSON.stringify(data)}`
            );
        }

        return data;
    }
}
