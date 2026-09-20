import "dotenv/config";

import {
    InstagramClient
} from "./src/InstagramClient.js";

import {
    GitHubMediaProvider
} from "./src/media/GitHubMediaProvider.js";

const githubProvider =
    new GitHubMediaProvider({
        token:
            process.env.GITHUB_TOKEN,

        owner:
            process.env.GITHUB_OWNER,

        repo:
            process.env.GITHUB_REPO,

        branch:
            process.env.GITHUB_BRANCH ?? "main"
    });

const instagram =
    new InstagramClient({
        accessToken:
            process.env.INSTAGRAM_ACCESS_TOKEN,

        userId:
            process.env.INSTAGRAM_USER_ID,

        mediaProvider:
            githubProvider
    });

try {
    const post =
        await instagram.publishPhoto({
            image:
                "C:\\Users\\MiGHU\\Downloads\\Gengar\\pack_icon.png",

            caption:
                "Premier post local via GitHub + FIDL"
        });

    console.log(
        "Publication réussie:"
    );

    console.log(post);

} catch (error) {
    console.error(
        "Erreur:",
        error.message
    );
}