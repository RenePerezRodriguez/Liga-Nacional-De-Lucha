import { storage } from "@/lib/firebase";
import { ref, deleteObject } from "firebase/storage";

/**
 * Deletes an image from Firebase Storage given its URL.
 * Handles both firebasestorage.googleapis.com and storage.googleapis.com URLs.
 * @param imageUrl - The full URL of the image to delete
 */
export async function deleteImageFromStorage(imageUrl: string | undefined): Promise<void> {
    if (!imageUrl) return;

    try {
        // Only process Firebase Storage URLs
        if (!imageUrl.includes("firebasestorage.googleapis.com") &&
            !imageUrl.includes("storage.googleapis.com")) {
            return; // Not a Firebase Storage URL, skip
        }

        // Extract the file path from the URL
        // URL format: https://firebasestorage.googleapis.com/v0/b/{bucket}/o/{encodedPath}?alt=media&token=...
        const urlObj = new URL(imageUrl);
        const pathMatch = urlObj.pathname.match(/\/o\/(.+?)\?/) || urlObj.pathname.match(/\/o\/(.+)$/);

        if (!pathMatch || !pathMatch[1]) {
            console.warn("Could not extract path from URL:", imageUrl);
            return;
        }

        const filePath = decodeURIComponent(pathMatch[1]);
        const fileRef = ref(storage, filePath);

        await deleteObject(fileRef);
        console.log("Successfully deleted image from Storage:", filePath);
    } catch (error) {
        // Don't throw - just log. File might not exist or already deleted.
        console.warn("Could not delete image from Storage:", error);
    }
}
