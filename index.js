import "dotenv/config";

import {
    FIDLClient,
    CloudinaryMediaProvider
} from "./src/index.js";

const mediaProvider =
    new CloudinaryMediaProvider({
        cloudName:
            process.env.CLOUDINARY_CLOUD_NAME,
        apiKey:
            process.env.CLOUDINARY_API_KEY,
        apiSecret:
            process.env.CLOUDINARY_API_SECRET
    });

const fidl =
    new FIDLClient({
        mediaProvider,

        instagram: {
            accessToken:
                process.env.INSTAGRAM_ACCESS_TOKEN,
            userId:
                process.env.INSTAGRAM_USER_ID
        },

        facebook: {
            pageId:
                process.env.FACEBOOK_PAGE_ID,
            accessToken:
                process.env.FACEBOOK_PAGE_ACCESS_TOKEN
        },

        discord: process.env.DISCORD_WEBHOOK_URL
            ? {
                webhookUrl:
                    process.env.DISCORD_WEBHOOK_URL
            }
            : null
    });

try {
    const results =
        await fidl.publish({
            message:
                "**Hello from FIDL!**",

            media: [
                "./photos/1.jpg",
                "./photos/2.jpg",
                "./photos/3.jpg"
            ],

            platforms: {
                instagram: {
                    media: [0, 1]
                },

                facebook: {
                    media: [0, 1, 2]
                },

                ...(process.env.DISCORD_WEBHOOK_URL
                    ? {
                        discord: {
                            everyone: true,
                            media: [2]
                        }
                    }
                    : {})
            }
        });

    console.dir(
        results,
        {
            depth: null
        }
    );
} catch (error) {
    console.error(
        "FIDL error:",
        error.message
    );
}
