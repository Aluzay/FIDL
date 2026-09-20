# FIDL

**FIDL** is a Node.js cross-posting library that lets you publish the same content to multiple platforms while still keeping platform-specific behavior.

Currently supported:

| Platform | Text-only | Single image | Multiple images | Platform-specific formatting |
|---|---:|---:|---:|---|
| Instagram | No | Yes | Yes | Plain text |
| Facebook Page | Yes | Yes | Yes | Plain text |
| Discord Webhook | Yes | Yes | Yes | Discord Markdown + mentions |

FIDL is designed around one main idea:

> Write the content once, then customize only what is different for each platform.

---

## Features

- Publish to Instagram, Facebook Pages, and Discord in one call
- Share one global message across every platform
- Keep Discord Markdown while automatically stripping it for Instagram and Facebook
- Add Discord-only mentions such as `@everyone`, `@here`, users, and roles
- Override the message for only one platform when needed
- Send different images to different platforms
- Upload a local file only once even when several platforms use it
- Clean up temporary uploaded media only after every platform has finished
- Continue publishing to the other platforms if one platform fails
- Use public URLs directly without a Media Provider
- Use interchangeable Media Providers for local files
- Use Instagram and Facebook clients independently if you do not need cross-posting

---

# Requirements

- Node.js 18+
- An Instagram **Creator** or **Business** account for Instagram publishing
- A Facebook **Page** for Facebook publishing
- A Discord webhook for Discord publishing
- A Media Provider if you want to publish files from your computer

Platform setup guides:

- [Instagram Setup](docs/INSTAGRAM_SETUP.md)
- [Facebook Page Setup](docs/FACEBOOK_SETUP.md)
- [Cloudinary Setup](docs/CLOUDINARY_SETUP.md)
- [GitHub Media Provider Setup](docs/GITHUB_MEDIA_PROVIDER_SETUP.md)

---

# Installation

Clone the repository:

```bash
git clone https://github.com/Aluzay/FIDL.git
cd FIDL
npm install
```

FIDL uses ES modules:

```json
{
  "type": "module"
}
```

---

# Environment variables

Create a `.env` file at the root of the project.

## Instagram

```env
INSTAGRAM_ACCESS_TOKEN=
INSTAGRAM_USER_ID=
```

Setup:

[Instagram Setup](docs/INSTAGRAM_SETUP.md)

## Facebook Page

```env
FACEBOOK_PAGE_ID=
FACEBOOK_PAGE_ACCESS_TOKEN=
```

Setup:

[Facebook Page Setup](docs/FACEBOOK_SETUP.md)

## Discord

```env
DISCORD_WEBHOOK_URL=
```

To create a webhook in Discord:

```text
Server Settings
→ Integrations
→ Webhooks
→ New Webhook
→ Copy Webhook URL
```

## Cloudinary

```env
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

Setup:

[Cloudinary Setup](docs/CLOUDINARY_SETUP.md)

## GitHub Media Provider

```env
GITHUB_TOKEN=
GITHUB_OWNER=
GITHUB_REPO=fidl-media-temp
GITHUB_BRANCH=main
```

Setup:

[GitHub Media Provider Setup](docs/GITHUB_MEDIA_PROVIDER_SETUP.md)

Never commit your `.env` file.

```gitignore
.env
node_modules/
```

---

# Quick start

This example configures Instagram, Facebook, Discord, and Cloudinary.

```js
import "dotenv/config";

import {
    FIDLClient,
    CloudinaryMediaProvider
} from "./src/index.js";

const mediaProvider = new CloudinaryMediaProvider({
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    apiKey: process.env.CLOUDINARY_API_KEY,
    apiSecret: process.env.CLOUDINARY_API_SECRET
});

const fidl = new FIDLClient({
    mediaProvider,

    instagram: {
        accessToken: process.env.INSTAGRAM_ACCESS_TOKEN,
        userId: process.env.INSTAGRAM_USER_ID
    },

    facebook: {
        pageId: process.env.FACEBOOK_PAGE_ID,
        accessToken: process.env.FACEBOOK_PAGE_ACCESS_TOKEN
    },

    discord: {
        webhookUrl: process.env.DISCORD_WEBHOOK_URL
    }
});
```

Now publish:

```js
const results = await fidl.publish({
    message: "**Hello from FIDL!**",

    media: [
        "./photos/1.jpg"
    ],

    platforms: [
        "instagram",
        "facebook",
        "discord"
    ]
});

console.dir(results, { depth: null });
```

The message becomes:

```text
Instagram:
Hello from FIDL!

Facebook:
Hello from FIDL!

Discord:
**Hello from FIDL!**
```

Discord keeps the Markdown.

Instagram and Facebook receive clean plain text.

---

# Publishing to several platforms

## Same content everywhere

```js
await fidl.publish({
    message: "**New post!**",

    media: [
        "./photos/1.jpg",
        "./photos/2.jpg"
    ],

    platforms: [
        "instagram",
        "facebook",
        "discord"
    ]
});
```

FIDL resolves the two files once and reuses the same public URLs for every platform.

---

# Media is uploaded only once

When a local image is used by several platforms, FIDL does **not** upload it separately for each one.

Instead:

```text
./photo.jpg
      ↓
Media Provider
      ↓
temporary public URL
      ↓
┌───────────┬───────────┬───────────┐
│ Instagram │ Facebook  │ Discord   │
└───────────┴───────────┴───────────┘
      ↓
cleanup once
```

The `MediaPool` keeps track of resolved files during one `publish()` operation.

This means:

```js
media: [
    "./photo.jpg"
]
```

used by Instagram, Facebook, and Discord still produces only **one temporary upload**.

---

# Selecting different media per platform

The `media` array defines the available media.

Each platform can select the indexes it wants.

```js
await fidl.publish({
    message: "New photos!",

    media: [
        "./photos/1.jpg", // index 0
        "./photos/2.jpg", // index 1
        "./photos/3.jpg"  // index 2
    ],

    platforms: {
        instagram: {
            media: [0, 1]
        },

        facebook: {
            media: [0, 1, 2]
        },

        discord: {
            media: [2]
        }
    }
});
```

Result:

```text
Instagram
→ photo 1
→ photo 2

Facebook
→ photo 1
→ photo 2
→ photo 3

Discord
→ photo 3
```

The files are still uploaded only once each.

---

# Global messages and platform overrides

The top-level `message` is the default message.

```js
await fidl.publish({
    message: "New update!",

    platforms: {
        instagram: {},
        facebook: {},

        discord: {
            message: "# New update\n**Version 2.0 is live!**"
        }
    }
});
```

Result:

```text
Instagram:
New update!

Facebook:
New update!
```

Discord receives:

```md
# New update
**Version 2.0 is live!**
```

A platform-specific message always overrides the global message.

---

# Discord Markdown

FIDL intentionally keeps Discord Markdown for Discord.

For example:

```js
message: `
# Update

**Version 2.0**

*Available now!*

||Secret feature||
`
```

Discord receives the original Markdown.

Instagram and Facebook receive plain text:

```text
Update

Version 2.0

Available now!

Secret feature
```

The current plain-text renderer handles common Discord Markdown such as:

```md
**bold**
*italic*
__underline__
~~strikethrough~~
||spoiler||
`inline code`
# headings
> quotes
[links](https://example.com)
```

Code fences are also stripped to plain text on non-Discord platforms.

---

# Discord mentions

FIDL supports both structured mention options and FIDL message tokens.

## `@everyone`

```js
platforms: {
    discord: {
        everyone: true
    }
}
```

Discord receives:

```text
@everyone
<message>
```

Instagram and Facebook are unaffected.

## `@here`

```js
platforms: {
    discord: {
        here: true
    }
}
```

## Mention users

```js
platforms: {
    discord: {
        mentions: {
            users: [
                "123456789012345678"
            ]
        }
    }
}
```

## Mention roles

```js
platforms: {
    discord: {
        mentions: {
            roles: [
                "987654321098765432"
            ]
        }
    }
}
```

## FIDL mention tokens

You can also place special FIDL tokens directly inside the message.

```text
{{everyone}}
{{here}}
{{user:USER_ID}}
{{role:ROLE_ID}}
```

Example:

```js
await fidl.publish({
    message: `
{{everyone}}

# New event

Thanks {{user:123456789012345678}}!
`,

    platforms: [
        "instagram",
        "facebook",
        "discord"
    ]
});
```

Discord receives Discord-native mentions.

Instagram and Facebook automatically remove the Discord-only tokens.

---

# Public URLs

A Media Provider is not required when your images already have public URLs.

```js
await fidl.publish({
    message: "**Hello!**",

    media: [
        "https://example.com/photo.jpg"
    ],

    platforms: [
        "instagram",
        "facebook",
        "discord"
    ]
});
```

FIDL detects URLs automatically and uses them directly.

---

# Local files

Local files require a Media Provider because platform APIs cannot access a path on your computer such as:

```text
C:\Users\You\Pictures\photo.jpg
```

With a Media Provider:

```js
media: [
    "./photos/photo.jpg"
]
```

FIDL:

```text
local file
   ↓
Media Provider
   ↓
public temporary URL
   ↓
platform APIs
   ↓
cleanup
```

---

# Cloudinary Media Provider

Cloudinary is the recommended provider for normal use.

```js
import {
    CloudinaryMediaProvider
} from "./src/index.js";

const mediaProvider = new CloudinaryMediaProvider({
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    apiKey: process.env.CLOUDINARY_API_KEY,
    apiSecret: process.env.CLOUDINARY_API_SECRET
});
```

Then pass it to `FIDLClient`.

Setup guide:

[Cloudinary Setup](docs/CLOUDINARY_SETUP.md)

---

# GitHub Media Provider

GitHub can also be used as a simple provider for development and testing.

```js
import {
    GitHubMediaProvider
} from "./src/index.js";

const mediaProvider = new GitHubMediaProvider({
    token: process.env.GITHUB_TOKEN,
    owner: process.env.GITHUB_OWNER,
    repo: process.env.GITHUB_REPO,
    branch: process.env.GITHUB_BRANCH ?? "main"
});
```

Setup guide:

[GitHub Media Provider Setup](docs/GITHUB_MEDIA_PROVIDER_SETUP.md)

> GitHub is best treated as a development/testing provider. Deleted files can remain in Git history, so do not use it for sensitive media.

---

# Mixing local files and URLs

You can mix sources freely:

```js
await fidl.publish({
    message: "Mixed sources",

    media: [
        "./photos/local.jpg",
        "https://example.com/remote.jpg"
    ],

    platforms: [
        "instagram",
        "facebook",
        "discord"
    ]
});
```

Only the local file is uploaded through the Media Provider.

---

# Platform behavior

## Instagram

One image:

```js
media: [
    "./photo.jpg"
]
```

FIDL publishes a single-photo post.

Multiple images:

```js
media: [
    "./1.jpg",
    "./2.jpg"
]
```

FIDL creates a carousel.

Current behavior:

- requires at least one image
- supports up to 10 carousel media items
- receives plain text after Discord-specific formatting is removed

---

## Facebook Page

No images:

```js
media: []
```

FIDL publishes a text post.

One image:

```js
media: [
    "./photo.jpg"
]
```

FIDL publishes a photo post.

Multiple images:

```js
media: [
    "./1.jpg",
    "./2.jpg"
]
```

FIDL creates a multi-photo post.

FIDL currently publishes to **Facebook Pages**, not personal Facebook profiles.

---

## Discord

Discord uses a webhook.

Text-only:

```js
media: []
```

Images:

```js
media: [
    "./1.jpg",
    "./2.jpg"
]
```

The current Discord client publishes media URLs as image embeds.

Current behavior:

- keeps Discord Markdown
- supports FIDL mention tokens
- supports structured user/role/everyone/here mentions
- supports up to 10 image embeds per message

---

# Partial failures

Platforms are independent.

If:

```text
Instagram ✅
Facebook  ❌
Discord   ✅
```

FIDL does not cancel Instagram or Discord because Facebook failed.

`publish()` returns one result per platform using a `Promise.allSettled()`-style structure.

```js
const results = await fidl.publish({
    message: "Hello",

    media: [
        "./photo.jpg"
    ],

    platforms: [
        "instagram",
        "facebook",
        "discord"
    ]
});

console.dir(results, { depth: null });
```

Possible result:

```js
{
    instagram: {
        status: "fulfilled",
        value: {}
    },

    facebook: {
        status: "rejected",
        reason: Error(...)
    },

    discord: {
        status: "fulfilled",
        value: {}
    }
}
```

This makes it possible to identify exactly which platform failed without accidentally reposting content that already succeeded.

Temporary media cleanup still runs after all platform attempts are complete.

---

# Using only selected platforms

You do not have to configure every platform.

Example with Instagram and Facebook only:

```js
const fidl = new FIDLClient({
    mediaProvider,

    instagram: {
        accessToken: process.env.INSTAGRAM_ACCESS_TOKEN,
        userId: process.env.INSTAGRAM_USER_ID
    },

    facebook: {
        pageId: process.env.FACEBOOK_PAGE_ID,
        accessToken: process.env.FACEBOOK_PAGE_ACCESS_TOKEN
    }
});
```

Then:

```js
await fidl.publish({
    message: "Hello!",

    media: [
        "./photo.jpg"
    ],

    platforms: [
        "instagram",
        "facebook"
    ]
});
```

If `platforms` is omitted, FIDL publishes to every configured platform.

```js
await fidl.publish({
    message: "Publish everywhere configured",

    media: [
        "./photo.jpg"
    ]
});
```

---

# Advanced example

```js
await fidl.publish({
    message: "**Global message**",

    media: [
        "./1.jpg",
        "./2.jpg",
        "./3.jpg"
    ],

    platforms: {
        instagram: {
            media: [0, 1]
        },

        facebook: {
            message: "Facebook-specific message",
            media: [0, 1, 2]
        },

        discord: {
            message: "# Discord-specific message",
            everyone: true,

            mentions: {
                roles: [
                    "987654321098765432"
                ]
            },

            media: [2]
        }
    }
});
```

---

# Direct platform clients

`FIDLClient` is recommended for cross-posting, but platform clients can still be used independently.

## InstagramClient

```js
import {
    InstagramClient
} from "./src/index.js";

const instagram = new InstagramClient({
    accessToken: process.env.INSTAGRAM_ACCESS_TOKEN,
    userId: process.env.INSTAGRAM_USER_ID,
    mediaProvider
});

await instagram.publishPhoto({
    image: "./photo.jpg",
    caption: "Hello Instagram"
});
```

## FacebookClient

```js
import {
    FacebookClient
} from "./src/index.js";

const facebook = new FacebookClient({
    pageId: process.env.FACEBOOK_PAGE_ID,
    accessToken: process.env.FACEBOOK_PAGE_ACCESS_TOKEN,
    mediaProvider
});

await facebook.publishPhoto({
    image: "./photo.jpg",
    caption: "Hello Facebook"
});
```

## DiscordClient

```js
import {
    DiscordClient
} from "./src/index.js";

const discord = new DiscordClient({
    webhookUrl: process.env.DISCORD_WEBHOOK_URL
});

await discord.publish({
    content: "**Hello Discord**"
});
```

When clients are used directly, each client manages its own media resolution and cleanup.

When using `FIDLClient`, media is resolved centrally so the same upload can be shared across platforms.

---

# Custom Media Providers

A Media Provider only needs to implement two methods:

```js
export class MediaProvider {
    async upload(filePath) {
        throw new Error(
            "MediaProvider.upload() must be implemented"
        );
    }

    async remove(media) {
        throw new Error(
            "MediaProvider.remove() must be implemented"
        );
    }
}
```

`upload()` must return at least:

```js
{
    url: "https://public-url.example/photo.jpg"
}
```

It can also return cleanup metadata:

```js
{
    id: "temporary-file-id",
    url: "https://public-url.example/photo.jpg"
}
```

This allows additional providers to be added without changing the platform clients.

Possible future providers:

- Amazon S3
- Cloudflare R2
- Supabase Storage
- custom HTTP storage

---

# Project structure

```text
FIDL/
├── docs/
│   ├── CLOUDINARY_SETUP.md
│   ├── FACEBOOK_SETUP.md
│   ├── GITHUB_MEDIA_PROVIDER_SETUP.md
│   └── INSTAGRAM_SETUP.md
│
├── src/
│   ├── FIDLClient.js
│   ├── index.js
│   │
│   ├── clients/
│   │   ├── DiscordClient.js
│   │   ├── FacebookClient.js
│   │   └── InstagramClient.js
│   │
│   ├── media/
│   │   ├── CloudinaryMediaProvider.js
│   │   ├── GitHubMediaProvider.js
│   │   ├── MediaPool.js
│   │   ├── MediaProvider.js
│   │   └── MediaResolver.js
│   │
│   └── renderers/
│       ├── DiscordRenderer.js
│       └── PlainTextRenderer.js
│
├── .env
├── .env.example
├── .gitignore
├── index.js
├── package.json
└── package-lock.json
```

---

# API overview

Create FIDL:

```js
const fidl = new FIDLClient({
    mediaProvider,

    instagram: {
        accessToken,
        userId
    },

    facebook: {
        pageId,
        accessToken
    },

    discord: {
        webhookUrl
    }
});
```

Publish:

```js
await fidl.publish({
    message,
    media,
    platforms
});
```

Simple platform list:

```js
platforms: [
    "instagram",
    "facebook",
    "discord"
]
```

Platform options:

```js
platforms: {
    instagram: {
        message,
        media
    },

    facebook: {
        message,
        media
    },

    discord: {
        message,
        media,
        everyone,
        here,
        mentions
    }
}
```

Discord mentions:

```js
mentions: {
    users: [],
    roles: []
}
```

FIDL Discord tokens:

```text
{{everyone}}
{{here}}
{{user:USER_ID}}
{{role:ROLE_ID}}
```

---

# Security

Never commit or publish:

```text
INSTAGRAM_ACCESS_TOKEN
FACEBOOK_PAGE_ACCESS_TOKEN
DISCORD_WEBHOOK_URL
CLOUDINARY_API_SECRET
GITHUB_TOKEN
.env
```

If a token or secret is accidentally exposed, revoke or rotate it immediately.

---

# Current limitations

FIDL is still under development.

Current scope:

- images only
- Instagram photo posts and carousels
- Facebook Page text/photo/multi-photo posts
- Discord webhook messages with image embeds
- no Instagram Reels yet
- no Instagram Stories yet
- no video publishing yet
- no Facebook personal profile publishing
- no automatic retry system yet
- no persistent publication history yet

---

# Documentation

Platform setup:

- [Instagram Setup](docs/INSTAGRAM_SETUP.md)
- [Facebook Page Setup](docs/FACEBOOK_SETUP.md)

Media Providers:

- [Cloudinary Setup](docs/CLOUDINARY_SETUP.md)
- [GitHub Media Provider Setup](docs/GITHUB_MEDIA_PROVIDER_SETUP.md)

---

# License

ISC
