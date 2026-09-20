export class MediaProvider {
    async upload(filePath) {
        throw new Error("MediaProvider.upload() must be implemented");
    }

    async remove(media) {
        throw new Error("MediaProvider.remove() must be implemented");
    }
}
