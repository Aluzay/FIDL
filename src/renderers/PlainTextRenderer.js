import {
    dedent
} from "./dedent.js";

export class PlainTextRenderer {
    render(message = "") {
        return dedent(message)
            .replace(/\{\{everyone\}\}/gi, "")
            .replace(/\{\{here\}\}/gi, "")
            .replace(/\{\{user:\d+\}\}/gi, "")
            .replace(/\{\{role:\d+\}\}/gi, "")
            .replace(/```[a-zA-Z0-9_-]*\n?([\s\S]*?)```/g, "$1")
            .replace(
                /\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g,
                "$1 ($2)"
            )
            .replace(/^[ \t]{0,3}#{1,6}[ \t]+/gm,"")
            .replace(/^[ \t]*>[ \t]?/gm,"")
            .replace(/\*\*\*([\s\S]*?)\*\*\*/g, "$1")
            .replace(/___([\s\S]*?)___/g, "$1")
            .replace(/\*\*([\s\S]*?)\*\*/g, "$1")
            .replace(/__([\s\S]*?)__/g, "$1")
            .replace(/~~([\s\S]*?)~~/g, "$1")
            .replace(/\|\|([\s\S]*?)\|\|/g, "$1")
            .replace(/`([^`]+)`/g, "$1")
            .replace(/\*([^*\n]+)\*/g, "$1")
            .replace(/_([^_\n]+)_/g, "$1")
            .replace(/[ \t]+\n/g, "\n")
            .replace(/\n{3,}/g, "\n\n")
            .trim();
    }
}