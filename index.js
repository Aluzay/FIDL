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

        discord: {
            token:
                process.env.DISCORD_BOT_TOKEN,

            channelId:
                process.env.DISCORD_CHANNEL_ID
        }
    });

try {
    const results =
        await fidl.publish({
            message:
            `
                {{everyone}}

                # FIDL Markdown Test

                **Bold text**

                *Italic text*

                __Underlined text__

                ~~Strikethrough~~

                ||Spoiler text||

                > This is a quote

                \`Inline code\`

                \`\`\`js
                console.log("Hello from FIDL");
                \`\`\`

                [OpenAI](https://openai.com)

                {{role:1551685444201218088}}

                Thanks {{user:428700127092408320}}!
            `,

            media: [
                "C:\\Users\\MiGHU\\Downloads\\Olivia Rodrigo Violet.jpg",
                "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ29NYnKPA5S32Zj2JADLc4RSKi6hDFR5xTQ7VlUCo0GA&s=10",
                "https://thumb.wikimedia.org/wikipedia/en/thumb/1/18/Olivia_Rodrigo_-_You_Seem_Pretty_Sad_for_a_Girl_So_in_Love.png/250px-Olivia_Rodrigo_-_You_Seem_Pretty_Sad_for_a_Girl_So_in_Love.png?utm_source=en.wikipedia.org&utm_campaign=parser&utm_content=thumbnail"
            ],

            platforms: {
                instagram: {
                    media: [0, 1, 2]
                },

                facebook: {
                    media: [0, 1]
                },

                discord: {
                            media: [0]
                        }
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
