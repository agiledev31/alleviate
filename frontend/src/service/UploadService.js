import { message } from "antd";
import axios from "axios";
import CloudinaryService from "./CloudinaryService";

function bytesToMB(bytes) {
  return bytes / (1024 * 1024);
}

class ImageUploadService {
  constructor() {
    this.baseURL = `https://api.cloudinary.com/v1_1/${process.env.REACT_APP_CLOUDINARY_CLOUD_NAME}/auto/upload`;
    this.api = axios.create({
      baseURL: this.baseURL,
    });
  }

  upload(file) {
    if (bytesToMB(file.size) > 15) return message.info("Maximum size: 15MB");
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", process.env.REACT_APP_CLOUDINARY_PRESET);
    formData.append("api_key", process.env.REACT_APP_CLOUDINARY_API_KEY);

    return this.api.post("", formData);
  }

  async uploadSigned(file) {
    if (bytesToMB(file.size) > 15) {
      return message.info("Maximum size: 15MB");
    }

    // Generate a signature for the upload
    const timestamp = Math.round(new Date().getTime() / 1000);
    const signatureString = `timestamp=${timestamp}&upload_preset=${process.env.REACT_APP_CLOUDINARY_PRESET_SIGNED}`;

    const res = await CloudinaryService.generateSignature({ signatureString });
    const signature = res.data.signature;

    // Prepare the upload URL with authentication
    const uploadUrl = `https://api.cloudinary.com/v1_1/${process.env.REACT_APP_CLOUDINARY_CLOUD_NAME}/auto/upload`;

    const formData = new FormData();
    formData.append("file", file);
    formData.append(
      "upload_preset",
      process.env.REACT_APP_CLOUDINARY_PRESET_SIGNED
    );
    formData.append("api_key", process.env.REACT_APP_CLOUDINARY_API_KEY);
    formData.append("timestamp", timestamp);
    formData.append("signature", signature);

    try {
      const response = await axios.post(uploadUrl, formData);
      return response.data;
    } catch (error) {
      console.error("Error uploading image:", error);
      throw error;
    }
  }
}

export default new ImageUploadService();
