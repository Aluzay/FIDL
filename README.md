# FIDL

FIDL is a Node.js library for publishing content to Instagram through the official Instagram API.

It provides a simple interface for:

- reading Instagram account information;
- listing published media;
- publishing a single photo;
- publishing photo carousels;
- publishing from public image URLs;
- publishing local image files through interchangeable media providers.

> FIDL is currently focused on Instagram photo publishing. Video, Reels, Stories, and other platforms are not implemented yet.

## Requirements

- Node.js 18 or newer
- An Instagram **Creator** or **Business** account
- A Meta for Developers application configured for the Instagram API
- An Instagram access token with the required permissions

For the complete Instagram configuration guide, see:

[Instagram Setup](docs/INSTAGRAM_SETUP.md)

## Installation

Clone the repository:

```bash
git clone https://github.com/Aluzay/FIDL.git
cd FIDL
npm install
```

FIDL uses ES modules, so the project should use:

```json
{
  "type": "module"
}
```

## Environment variables

At minimum, Instagram requires:

```env
INSTAGRAM_ACCESS_TOKEN=
INSTAGRAM_USER_ID=
```

Do not commit your `.env` file.

```gitignore
.env
node_modules/
```

## Basic usage

```js
import "dotenv/config";

import { InstagramClient } from "./src/InstagramClient.js";

const instagram = new InstagramClient({
    accessToken: process.env.INSTAGRAM_ACCESS_TOKEN,
    userId: process.env.INSTAGRAM_USER_ID
});
```

## Get account information

```js
const account = await instagram.getAccount();

console.log(account);
```

Example response:

```js
{
    id: "27825619990450042",
    username: "your_username",
    account_type: "MEDIA_CREATOR",
    media_count: 4
}
```

## Get published media

```js
const media = await instagram.getMedia();

console.log(media);
```

## Publish a photo from a public URL

A media provider is not required when the image is already publicly accessible.

```js
const post = await instagram.publishPhoto({
    image: "https://example.com/photo.jpg",
    caption: "Published with FIDL"
});

console.log(post);
```

Instagram must be able to download the image directly from the provided URL.

## Publish multiple photos

Use `publishPhotos()` to create an Instagram carousel.

```js
const post = await instagram.publishPhotos({
    images: [
        "https://example.com/photo-1.jpg",
        "https://example.com/photo-2.jpg",
        "https://example.com/photo-3.jpg"
    ],
    caption: "Published with FIDL"
});

console.log(post);
```

## Publishing local files

Instagram cannot access files directly from your computer.

This will therefore require a media provider:

```js
image: "./photos/photo.jpg"
```

A provider temporarily uploads the file, gives Instagram a public URL, and removes the temporary copy after FIDL has finished processing the publication.

FIDL currently supports:

- Cloudinary
- GitHub
- custom media providers

### Cloudinary

Setup guide:

[Cloudinary Setup](docs/CLOUDINARY_SETUP.md)

Example:

```js
import "dotenv/config";

import { InstagramClient } from "./src/InstagramClient.js";
import { CloudinaryMediaProvider } from "./src/media/CloudinaryMediaProvider.js";

const mediaProvider = new CloudinaryMediaProvider({
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    apiKey: process.env.CLOUDINARY_API_KEY,
    apiSecret: process.env.CLOUDINARY_API_SECRET
});

const instagram = new InstagramClient({
    accessToken: process.env.INSTAGRAM_ACCESS_TOKEN,
    userId: process.env.INSTAGRAM_USER_ID,
    mediaProvider
});

await instagram.publishPhoto({
    image: "./photos/photo.jpg",
    caption: "Local image published with FIDL"
});
```

### GitHub

GitHub can be used as a simple media provider for development and testing.

Setup guide:

[GitHub Media Provider Setup](docs/GITHUB_MEDIA_PROVIDER_SETUP.md)

Example:

```js
import "dotenv/config";

import { InstagramClient } from "./src/InstagramClient.js";
import { GitHubMediaProvider } from "./src/media/GitHubMediaProvider.js";

const mediaProvider = new GitHubMediaProvider({
    token: process.env.GITHUB_TOKEN,
    owner: process.env.GITHUB_OWNER,
    repo: process.env.GITHUB_REPO,
    branch: process.env.GITHUB_BRANCH ?? "main"
});

const instagram = new InstagramClient({
    accessToken: process.env.INSTAGRAM_ACCESS_TOKEN,
    userId: process.env.INSTAGRAM_USER_ID,
    mediaProvider
});

await instagram.publishPhoto({
    image: "./photos/photo.jpg",
    caption: "Local image published with FIDL"
});
```

> GitHub is mainly intended as a development/testing provider. Deleted temporary files can remain in the repository's Git history, so it should not be used for sensitive media.

## Local carousels

Media providers also work with `publishPhotos()`:

```js
await instagram.publishPhotos({
    images: [
        "./photos/photo-1.jpg",
        "./photos/photo-2.jpg",
        "./photos/photo-3.jpg"
    ],
    caption: "Local carousel published with FIDL"
});
```

FIDL uploads each local file through the configured media provider before creating the Instagram carousel.

## Mixing URLs and local files

Because FIDL resolves every media source individually, a carousel can contain both public URLs and local files:

```js
await instagram.publishPhotos({
    images: [
        "./photos/local-photo.jpg",
        "https://example.com/remote-photo.jpg"
    ],
    caption: "Mixed media sources"
});
```

A media provider is only used for local files.

## Custom media providers

Media providers use a small common interface:

```js
export class MediaProvider {
    async upload(filePath) {
        throw new Error("MediaProvider.upload() must be implemented");
    }

    async remove(media) {
        throw new Error("MediaProvider.remove() must be implemented");
    }
}
```

`upload()` must return an object containing at least a public `url`.

Example:

```js
{
    id: "temporary-file-id",
    url: "https://example.com/temporary-photo.jpg"
}
```

`remove()` is called during cleanup after the media has been processed.

This allows FIDL to support other storage services without changing `InstagramClient`.

Possible future providers include:

- Amazon S3
- Cloudflare R2
- Supabase Storage
- custom HTTP storage

## Project structure

```text
FIDL/
├── docs/
│   ├── CLOUDINARY_SETUP.md
│   ├── GITHUB_MEDIA_PROVIDER_SETUP.md
│   └── INSTAGRAM_SETUP.md
│
├── src/
│   ├── InstagramClient.js
│   └── media/
│       ├── MediaProvider.js
│       ├── MediaResolver.js
│       ├── CloudinaryMediaProvider.js
│       └── GitHubMediaProvider.js
│
├── .env
├── .gitignore
├── package.json
└── index.js
```

## Documentation

- [Instagram Setup](docs/INSTAGRAM_SETUP.md)
- [Cloudinary Setup](docs/CLOUDINARY_SETUP.md)
- [GitHub Media Provider Setup](docs/GITHUB_MEDIA_PROVIDER_SETUP.md)

## Security

Never commit or publish:

- `INSTAGRAM_ACCESS_TOKEN`
- `CLOUDINARY_API_SECRET`
- `GITHUB_TOKEN`
- your `.env` file

If a secret is accidentally committed, revoke or rotate it immediately.

## Current API

### `InstagramClient`

```js
new InstagramClient({
    accessToken,
    userId,
    mediaProvider
});
```

### Account

```js
instagram.getAccount();
```

### Media

```js
instagram.getMedia();
```

### Single photo

```js
instagram.publishPhoto({
    image,
    caption
});
```

### Photo carousel

```js
instagram.publishPhotos({
    images,
    caption
});
```

## Status

FIDL is currently under development.

The current focus is keeping Instagram publishing simple while allowing media storage to remain completely interchangeable.
