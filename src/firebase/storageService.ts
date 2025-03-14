// src/firebase/storageService.ts
import { storage } from "./firebaseConfig";
import { ref, uploadBytesResumable, getDownloadURL, UploadTaskSnapshot } from "firebase/storage";

export const uploadImage = async (uri: string, p0: string, setUploadProgress?: (progress: number) => void): Promise<string> => {
    try {
        const response = await fetch(uri);
        const blob = await response.blob();
        const filename = uri.substring(uri.lastIndexOf('/') + 1);
        const storageRef = ref(storage, `images/${filename}`);

        const uploadTask = uploadBytesResumable(storageRef, blob);

        return new Promise<string>((resolve, reject) => {
            uploadTask.on('state_changed',
                (snapshot: UploadTaskSnapshot) => {
                    const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                    if (setUploadProgress) {
                        setUploadProgress(progress);
                    }
                },
                (error) => {
                    console.error("Upload error:", error);
                    reject(error);
                },
                async () => {
                    const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                    resolve(downloadURL);
                }
            );
        });
    } catch (error) {
        console.error("Error uploading image:", error);
        throw error;
    }
};