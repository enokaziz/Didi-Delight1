import { Alert } from "react-native";
import { MAX_FILE_SIZE, ALLOWED_FILE_TYPES } from "./constants";

export const handleFileUpload = async ({
  pickerFunction,
  chatId,
  userId,
  maxSize,
  allowedTypes,
  onError,
}: {
  pickerFunction: any;
  chatId: string;
  userId: string;
  maxSize: number;
  allowedTypes: string[];
  onError: (message: string) => void;
}) => {
  const result = await pickerFunction.launchAsync();
  // Validation du fichier
  if (result.assets?.[0]?.size > maxSize) {
    onError("Fichier trop volumineux (max 5MB)");
    return;
  }
  if (!allowedTypes.includes(result.assets?.[0]?.mimeType)) {
    onError("Type de fichier non supporté");
    return;
  }
  // ... logique d'upload
};