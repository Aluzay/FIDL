import {
    dedent
} from "./dedent.js";

export class DiscordRenderer {
    render({
        message = "",
        everyone = false,
        here = false,
        mentions = {}
    } = {}) {
        let content = dedent(message);

        const users = new Set(
            (mentions.users ?? []).map(String)
        );

        const roles = new Set(
            (mentions.roles ?? []).map(String)
        );

        let allowEveryone = Boolean(everyone || here);

        content = content.replace(
            /\{\{everyone\}\}/gi,
            () => {
                allowEveryone = true;
                return "@everyone";
            }
        );

        content = content.replace(
            /\{\{here\}\}/gi,
            () => {
                allowEveryone = true;
                return "@here";
            }
        );

        content = content.replace(
            /\{\{user:(\d+)\}\}/gi,
            (_, id) => {
                users.add(id);
                return `<@${id}>`;
            }
        );

        content = content.replace(
            /\{\{role:(\d+)\}\}/gi,
            (_, id) => {
                roles.add(id);
                return `<@&${id}>`;
            }
        );

        const prefix = [];

        if (everyone && !content.includes("@everyone")) {
            prefix.push("@everyone");
        }

        if (here && !content.includes("@here")) {
            prefix.push("@here");
        }

        for (const userId of users) {
            const mention = `<@${userId}>`;

            if (!content.includes(mention)) {
                prefix.push(mention);
            }
        }

        for (const roleId of roles) {
            const mention = `<@&${roleId}>`;

            if (!content.includes(mention)) {
                prefix.push(mention);
            }
        }

        if (prefix.length > 0) {
            content =
                `${prefix.join(" ")}${content ? `\n${content}` : ""}`;
        }

        const allowedMentions = {
            parse: allowEveryone ? ["everyone"] : []
        };

        if (users.size > 0) {
            allowedMentions.users = [...users];
        }

        if (roles.size > 0) {
            allowedMentions.roles = [...roles];
        }

        return {
            content: content.trim(),
            allowedMentions
        };
    }
}
