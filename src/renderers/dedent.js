export function dedent(value = "") {
    const lines =
        String(value)
            .replace(/\r\n/g, "\n")
            .split("\n");

    while (
        lines.length > 0 &&
        lines[0].trim() === ""
    ) {
        lines.shift();
    }

    while (
        lines.length > 0 &&
        lines[lines.length - 1].trim() === ""
    ) {
        lines.pop();
    }

    const indents =
        lines
            .filter(line => line.trim() !== "")
            .map(
                line =>
                    line.match(/^[ \t]*/)?.[0].length ?? 0
            );

    const minIndent =
        indents.length > 0
            ? Math.min(...indents)
            : 0;

    return lines
        .map(line =>
            line.trim() === ""
                ? ""
                : line.slice(minIndent)
        )
        .join("\n");
}