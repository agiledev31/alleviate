import { Button, Upload } from "antd";
import axios from "axios";
import React from "react";

const CloudinaryUpload = ({ onChange }) => {
  const customRequest = async ({ file, onSuccess, onError }) => {
    try {
      const cloudinaryUploadUrl = `https://api.cloudinary.com/v1_1/${process.env.REACT_APP_CLOUDINARY_CLOUD_NAME}/auto/upload`;
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", process.env.REACT_APP_CLOUDINARY_PRESET);
      const response = await axios.post(cloudinaryUploadUrl, formData);
      const secureUrl = response.data.secure_url;
      onChange(secureUrl);
      onSuccess(response, file);
    } catch (error) {
      console.error("Error uploading file to Cloudinary", error);
      onError(error);
    }
  };

  return (
    <Upload customRequest={customRequest}>
      <Button>Upload</Button>
    </Upload>
  );
};

export default CloudinaryUpload;
