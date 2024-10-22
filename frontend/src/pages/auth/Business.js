import { Alert, Button, Divider, Space } from "antd";
import React, { useCallback, useEffect, useState } from "react";
import { IoMdArrowBack } from "react-icons/io";
import { USER_TESTING_MODE } from "../../data/constants";
import AuthService from "../../service/AuthService";
import GarbageService from "../../service/GarbageService";
import UploadService from "../../service/UploadService";

const Business = () => {
  const [softValue, setSoftValue] = useState(null);
  const [me, setMe] = useState(null);
  const [step, setStep] = useState(0);

  useEffect(() => {
    setSoftValue(me);
  }, [me]);

  useEffect(() => {
    AuthService.me().then((data) => setMe(data.data.me));
  }, []);

  useEffect(() => {
    if (!me) return;
    if (!me.businessId) return setStep(0);
    if (!me.businessIdDocument && me.role != "ngo-company") return setStep(1);
    if (me.role != "ngo-company") setStep(2);
  }, [me]);

  const handleUpdate = useCallback(async () => {
    await AuthService.updateMe(softValue);
    const res = await AuthService.me();

    if (res.data.me.role == "ngo-company" && res.data.me.businessId) {
      await GarbageService.approveCompanyApplication();
      window.location.reload();
    }
    setMe(res.data.me);
    document.dispatchEvent(new CustomEvent("REFRESH.PROFILE"));
  }, [softValue]);

  const getProps = (fieldKey) => ({
    value: softValue?.[fieldKey],
    onChange: (e) =>
      setSoftValue((current) => ({
        ...current,
        [fieldKey]: e?.target?.value ?? e,
      })),
  });

  return (
    <div className="mx-20 py-20">
      {step === 0 ? (
        <div className="relative block w-full  ">
          <div className="col-span-full">
            <label
              htmlFor="street-address"
              className="block text-sm font-medium leading-6 dark:text-white text-gray-900"
            >
              Business ID
            </label>
            <div className="mt-2">
              <input
                type="text"
                placeholder="Please provide the business ID of your organization"
                className="dark:bg-gray-900 block w-full rounded-md border-0 py-1.5 dark:text-white text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                {...getProps("businessId")}
              />
            </div>
          </div>

          <button
            onClick={handleUpdate}
            className="mt-4 bg-gradient-to-r from-indigo-100 to-indigo-500 hover:from-indigo-300 hover:to-indigo-700 text-white font-bold py-1 px-4 rounded"
          >
            Update
          </button>
        </div>
      ) : step === 1 ? (
        <>
          {me?.businessIdDocumentRejected?.reason && (
            <Alert
              type="error"
              className="mb-4"
              message={`The document you provided earlier has been rejected. The rejection reason: ${me?.businessIdDocumentRejected?.reason}`}
            />
          )}
          <label
            htmlFor="file-upload"
            className="relative block w-full rounded-lg border-2 border-dashed border-gray-300 p-12 text-center hover:border-gray-400 cursor-pointer"
          >
            <input
              id="file-upload"
              name="file-upload"
              type="file"
              className="dark:bg-gray-900 sr-only w-full h-full left-0 top-0"
              onChange={async (e) => {
                const selectedFile = e.target.files?.[0];
                if (selectedFile) {
                  const result = await UploadService.upload(selectedFile);
                  await AuthService.updateMe({
                    businessIdDocument: result.data.secure_url,
                  });
                  const res = await AuthService.me();
                  setMe(res.data.me);
                  message.info(
                    "Your document is received and pending review. Please revisit in 1-3 business days."
                  );
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
              Upload your business ID supporting document
            </span>
          </label>

          <button
            className="cursor-pointer mt-4 text-center bg-gradient-to-r from-indigo-100 to-indigo-500 hover:from-indigo-300 hover:to-indigo-700 text-white font-bold py-1 px-4 rounded"
            onClick={() => setStep(0)}
          >
            « Update Business ID
          </button>
        </>
      ) : (
        <>
          <Alert
            type="info"
            message="Your business document is awaiting approval. Please revisit in 1-3 business days."
            className="mb-4"
          />
          <label
            className="relative block w-full rounded-lg border-2 border-dashed border-gray-300 p-12 text-center hover:border-gray-400 cursor-pointer"
            onClick={() => window.open(me.businessIdDocument)}
          >
            <span className="mt-2 block text-sm font-semibold dark:text-white text-gray-900">
              Click here to view your document
            </span>
          </label>

          <button
            className="cursor-pointer mt-4 bg-gradient-to-r from-indigo-100 to-indigo-500 hover:from-indigo-300 hover:to-indigo-700 text-white font-bold py-1 px-4 rounded"
            onClick={() => setStep(1)}
          >
            « Reupload Business Document
          </button>

          {USER_TESTING_MODE && (
            <>
              <Divider />
              <Alert
                type="info"
                message="In order to facilitate User Acceptance Testing during development, we have added the functionality to simulate rejection / approval of the business documentation on this page."
                className="mb-4"
              />

              <Space>
                <Button
                  danger
                  className="bg-gradient-to-r from-red-400 to-red-600 hover:from-red-500 hover:to-red-700 text-white font-bold py-1 px-4 rounded font-bold py-1 px-4 rounded !text-white hover:!text-white"
                  onClick={async () => {
                    await GarbageService.rejectCompanyApplication();
                    AuthService.me().then((data) => setMe(data.data.me));
                  }}
                >
                  Reject
                </Button>
                <Button
                  type="primary"
                  className="bg-gradient-to-r from-indigo-100 to-indigo-500 hover:from-indigo-300 hover:to-indigo-700 text-white font-bold py-1 px-4 rounded !text-white hover:!text-white"
                  onClick={async () => {
                    await GarbageService.approveCompanyApplication();
                    window.location.reload();
                  }}
                >
                  Approve
                </Button>
              </Space>
            </>
          )}
        </>
      )}
    </div>
  );
};

export default Business;
