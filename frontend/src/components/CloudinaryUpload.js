import { Button, Space, Upload } from "antd";
import axios from "axios";
import React from "react";
import { MdDelete } from "react-icons/md";

const CloudinaryUpload = ({ onChange, value }) => {
  const customRequest = async ({ file, onSuccess, onError }) => {
    try {
      const cloudinaryUploadUrl = `https://api.cloudinary.com/v1_1/${process.env.REACT_APP_CLOUDINARY_CLOUD_NAME}/auto/upload`;
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", process.env.REACT_APP_CLOUDINARY_PRESET);
      const response = await axios.post(cloudinaryUploadUrl, formData);
      const secureUrl = response.data.secure_url;
      onChange([...(value ?? []), secureUrl]);
      onSuccess(response, file);
    } catch (error) {
      console.error("Error uploading file to Cloudinary", error);
      onError(error);
    }
  };

  return (
    <div>
      <Upload customRequest={customRequest} showUploadList={false}>
        <Button className="bg-gradient-to-r from-indigo-100 to-indigo-500 hover:from-indigo-300 hover:to-indigo-700 text-white font-bold py-1 px-4 rounded !text-white">
          Upload
        </Button>
      </Upload>
      <div className="mt-2">
        {(value ?? [])?.map?.((file) => (
          <Space>
            <a href={file} target="_blank">
              {file}
            </a>
            <MdDelete
              className="cursor-pointer text-red-500"
              onClick={() => {
                onChange((value ?? []).filter((a) => a !== file));
              }}
            />
          </Space>
        ))}
      </div>
    </div>
  );
};

export default CloudinaryUpload;
