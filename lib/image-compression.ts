
/**
 * Compresses an image file and converts it to WebP format.
 * 
 * @param file - The original File object.
 * @param quality - The quality of the output WebP image (0.0 to 1.0). Default is 0.8.
 * @param maxWidth - The maximum width of the output image. Default is 1920px.
 * @returns A Promise that resolves to the compressed File object.
 */
export async function compressImage(file: File, quality: number = 0.85, maxWidth: number = 1920): Promise<File> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target?.result as string;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;

                // Resize if width is greater than maxWidth
                if (width > maxWidth) {
                    height = (height * maxWidth) / width;
                    width = maxWidth;
                }

                canvas.width = width;
                canvas.height = height;

                const ctx = canvas.getContext('2d');
                if (!ctx) {
                    reject(new Error('Failed to get canvas context'));
                    return;
                }

                ctx.drawImage(img, 0, 0, width, height);

                canvas.toBlob((blob) => {
                    if (!blob) {
                        reject(new Error('Failed to compress image'));
                        return;
                    }

                    // Create a new File object with the .webp extension
                    const newFileName = file.name.replace(/\.[^/.]+$/, "") + ".webp";
                    const compressedFile = new File([blob], newFileName, {
                        type: "image/webp",
                        lastModified: Date.now(),
                    });

                    resolve(compressedFile);
                }, 'image/webp', quality);
            };
            img.onerror = () => reject(new Error('Failed to load image for compression'));
        };
        reader.onerror = (error) => reject(error);
    });
}
