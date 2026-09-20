import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";

import { MediaProvider } from "./MediaProvider.js";

export class GitHubMediaProvider extends MediaProvider {
    constructor({
        token,
        owner,
        repo,
        branch = "main",
        folder = "fidl-temp"
    }) {
        super();

        if (!token) {
            throw new Error("GitHub token is required");
        }

        if (!owner) {
            throw new Error("GitHub owner is required");
        }

        if (!repo) {
            throw new Error("GitHub repo is required");
        }

        this.token = token;
        this.owner = owner;
        this.repo = repo;
        this.branch = branch;
        this.folder = folder;

        this.baseUrl = "https://api.github.com";
    }

    async githubRequest(url, options = {}) {
        const response = await fetch(url, {
            ...options,
            headers: {
                Accept: "application/vnd.github+json",
                Authorization: `Bearer ${this.token}`,
                "X-GitHub-Api-Version": "2022-11-28",
                ...(options.headers ?? {})
            }
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(
                `GitHub API error ${response.status}: ${JSON.stringify(data)}`
            );
        }

        return data;
    }

    async upload(filePath) {
        const absolutePath = path.resolve(filePath);
        const file = await fs.readFile(absolutePath);

        const extension = path.extname(absolutePath);
        const fileName =
            `${Date.now()}-${crypto.randomUUID()}${extension}`;

        const repositoryPath =
            `${this.folder}/${fileName}`;

        const apiUrl =
            `${this.baseUrl}/repos/${this.owner}/${this.repo}/contents/${repositoryPath}`;

        const result = await this.githubRequest(
            apiUrl,
            {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    message:
                        `FIDL temporary media upload: ${fileName}`,
                    content: file.toString("base64"),
                    branch: this.branch
                })
            }
        );

        const sha = result.content?.sha;

        if (!sha) {
            throw new Error(
                "GitHub upload failed: no SHA returned"
            );
        }

        return {
            id: repositoryPath,
            sha,
            url:
                `https://raw.githubusercontent.com/${this.owner}/${this.repo}/${this.branch}/${repositoryPath}`
        };
    }

    async remove(media) {
        if (!media?.id || !media?.sha) {
            return;
        }

        const apiUrl =
            `${this.baseUrl}/repos/${this.owner}/${this.repo}/contents/${media.id}`;

        await this.githubRequest(
            apiUrl,
            {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    message:
                        `FIDL temporary media cleanup: ${media.id}`,
                    sha: media.sha,
                    branch: this.branch
                })
            }
        );
    }
}
