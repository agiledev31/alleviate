import { Alert } from "antd";
import React, { useCallback, useEffect, useState } from "react";
import AuthService from "../service/AuthService";
import UploadService from "../service/UploadService";

const MyDocuments = () => {

    const [me, setMe] = useState(null);

    useEffect(() => {
        AuthService.me().then((data) => setMe(data.data.me));
    }, []);

    return (
        <div className="col-span-12 mx-20 py-5">
            <>
                <label
                    htmlFor="file-upload"
                    className="relative block rounded-lg border-2 border-dashed border-gray-300 p-12 text-center hover:border-gray-400 cursor-pointer"
                >
                    <input
                        id="file-upload"
                        name="file-upload"
                        type="file"
                        className="dark:bg-gray-900 sr-only left-0 top-0"
                        onChange={async (e) => {
                            const selectedFile = e.target.files?.[0];
                            if (selectedFile) {
                                const result = await UploadService.upload(selectedFile);
                                const data = result.data;
                                console.log("upload", data)
                                await AuthService.updateMe({
                                    myDocuments: [
                                        ...me.myDocuments,
                                        {
                                            name: data.original_filename + "."
                                                + (data?.original_extension && data?.original_extension !== undefined ? data?.original_extension : data?.format),
                                            url: data.secure_url
                                        }
                                    ],
                                });
                                const res = await AuthService.me();
                                setMe(res.data.me);
                            }
                        }}
                    />

                    <svg
                        className="mx-auto h-12 w-12 dark:text-white text-gray-400"
                        stroke="currentColor"
                        fill="currentColor"
                        stroke-width="0"
                        viewBox="0 0 512 512"
                        height="200px"
                        width="200px"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path d="M288 48H136c-22.092 0-40 17.908-40 40v336c0 22.092 17.908 40 40 40h240c22.092 0 40-17.908 40-40V176L288 48zm-16 144V80l112 112H272z"></path>
                    </svg>
                    <span className="mt-2 block text-sm font-semibold dark:text-white text-gray-900">
                        Upload your document
                    </span>
                </label>
            </>
            <>
                <div
                    className={"col-span-12 shadow-sm bg-white dark:bg-gray-900 p-8"}
                >
                    <h2
                        className={
                            "dark:text-white dark:text-white text-gray-900 text-2xl font-bold pb-4"
                        }
                    >
                        My Documents
                    </h2>
                    <div
                        className={
                            "col-span-12 rounded-sm border border-stroke bg-white dark:bg-gray-900 pt-7.5 shadow-default sm:px-7.5 xl:col-span-8"
                        }
                    >
                        <div className="relative overflow-x-auto">
                            {me?.myDocuments?.map((document, index) => (
                                <div
                                    key={index}
                                    className="m-3 p-1 block cursor-pointer text-md font-bold hover:opacity-80 hover:underline"
                                    onClick={() => window.open(document.url)}
                                >
                                    {document.name}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </>
        </div>
    );
};

export default MyDocuments;
