import { v2 as cloudinary } from "cloudinary";

import { MediaProvider } from "./MediaProvider.js";

export class CloudinaryMediaProvider extends MediaProvider {
    constructor({
        cloudName,
        apiKey,
        apiSecret
    }) {
        super();

        if (!cloudName) {
            throw new Error(
                "Cloudinary cloudName is required"
            );
        }

        if (!apiKey) {
            throw new Error(
                "Cloudinary apiKey is required"
            );
        }

        if (!apiSecret) {
            throw new Error(
                "Cloudinary apiSecret is required"
            );
        }

        cloudinary.config({
            cloud_name: cloudName,
            api_key: apiKey,
            api_secret: apiSecret,
            secure: true
        });
    }

    async upload(filePath) {
        const result =
            await cloudinary.uploader.upload(
                filePath,
                {
                    resource_type: "auto",
                    folder: "fidl-temp"
                }
            );

        if (!result.secure_url) {
            throw new Error(
                "Cloudinary upload failed: no secure URL returned"
            );
        }

        return {
            id: result.public_id,
            url: result.secure_url,
            resourceType:
                result.resource_type
        };
    }

    async remove(media) {
        if (!media?.id) {
            return;
        }

        await cloudinary.uploader.destroy(
            media.id,
            {
                resource_type:
                    media.resourceType ?? "image",
                invalidate: true
            }
        );
    }
}