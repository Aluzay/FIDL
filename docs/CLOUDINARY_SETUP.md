# Cloudinary Setup for FIDL

This guide only covers how to get the Cloudinary credentials required by FIDL.

## 1. Create a Cloudinary account

Create a free account:

https://cloudinary.com/

Cloudinary documentation:

https://cloudinary.com/documentation/node_integration

## 2. Open your Cloudinary dashboard

After signing in, open the Cloudinary Console / Dashboard.

You need these three values:

```text
Cloud name
API Key
API Secret
```

Depending on the current Cloudinary interface, these may appear directly on the dashboard or under:

```text
Settings
→ API Keys
```

## 3. Copy the credentials into your `.env`

Add:

```env
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

Do not share or commit `CLOUDINARY_API_SECRET`.

## 4. Install the Cloudinary package

In your FIDL project:

```bash
npm install cloudinary
```

## 5. Keep secrets out of Git

Make sure your `.gitignore` contains:

```gitignore
.env
node_modules/
```

## Official links

Cloudinary:
https://cloudinary.com/

Node.js integration:
https://cloudinary.com/documentation/node_integration

Node.js uploads:
https://cloudinary.com/documentation/node_image_and_video_upload
