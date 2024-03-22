import { PlusIcon, XCircleIcon } from "@heroicons/react/20/solid";
import { Divider } from "antd";
import Cookies from "js-cookie";
import { useEffect, useState } from "react";
import AuthService from "../../service/AuthService";

export default function Example() {
  const [me, setMe] = useState(null);

  useEffect(() => {
    AuthService.me().then((data) => setMe(data.data.me));
  }, []);

  const handleStart = async () => {
    const res = await AuthService.requestKyc();
    window.location.href = res.data.follow;
  };

  return (
    <>
      {me?.KYCProcess?.status && (
        <div className="rounded-md bg-indigo-50 p-4 ">
          <div className="flex ">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-indigo-800">
                Welcome back! Your current status is:{" "}
                {me?.KYCProcess?.status?.replace?.(/\_/g, " ")}
              </h3>
              {me?.KYCProcess?.last_error?.reason && (
                <div className="mt-2 text-sm text-indigo-700">
                  <h4>Following error was reported:</h4>
                  <ul role="list" className="list-disc space-y-1 pl-5">
                    <li> {me?.KYCProcess?.last_error?.reason}</li>
                  </ul>
                  <p>
                    You can try reinitiating the KYC process. If the issue
                    persists, please contact our{" "}
                    <a href="mailto:info@alleviate.global">customer support</a>.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="text-center mt-10">
        <svg
          className="mx-auto h-16 w-16 dark:text-white text-gray-400"
          stroke="currentColor"
          fill="currentColor"
          stroke-width="0"
          viewBox="0 0 512 512"
          height="1em"
          width="1em"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M139.2 17.98L100.9 251.1l65.7-227.83.2-.75zm96.7 15.9l166.5 47.94 3.3-20.02zm-54.5 3.02L71.17 419.2 330.6 494l110.2-382.4zm9.4 50.55L406 149.5l-5 17.2-215.2-62zm23.9 90.15l123 35.4-5 17.2-123-35.4zm19.5 59.8c9.5 0 19.1 1.3 28.7 4.1 55.6 16 87.9 74.3 71.8 129.9-16 55.7-74.3 87.9-129.9 71.8-55.7-16-87.9-74.3-71.9-129.9 13.3-46.1 55.6-76.1 101.3-75.9zm-.1 17.9c-23.8-.1-46.4 9.6-62.7 26.3l35.4 10.2c8-13.8 18.2-26.3 30.1-36.5h-2.8zm22.6 7.7c-12.5 8.6-23.3 20.4-31.9 34l40.8 11.8c-.1-16.1-2.9-31.9-8.9-45.8zm20.8 4c4.7 15 6.6 31 6.1 47l35.4 10.2c-5.1-23.8-20-44.7-41.5-57.2zm-117.9 29.9c-4 6.5-7.2 13.7-9.4 21.4-2.2 7.6-3.3 15.3-3.4 22.8l38.9 11.2c1.1-7.6 2.8-15.1 4.9-22.5 2.1-7.4 4.8-14.7 7.9-21.7zm56.4 16.2c-3.3 7-6 14.3-8.1 21.7-2.1 7.4-3.7 15-4.6 22.6l48.4 14c3.2-7 6-14.2 8.1-21.7 2.1-7.4 3.7-15 4.6-22.6zm66 19c-1.1 7.6-2.8 15.2-4.9 22.6-2.1 7.4-4.8 14.7-7.9 21.8l38.9 11.2c3.9-6.5 7.1-13.6 9.3-21.3 2.2-7.7 3.3-15.4 3.5-23.1zm-133.4 28.2c5 23.9 20 45 41.8 57.5-4.8-15.1-6.8-31.1-6.3-47.3zm53.5 15.4c.1 16.2 2.9 31.9 8.9 45.9 12.5-8.7 23.3-20.5 32-34.1zm58.8 17c-8.1 13.9-18.3 26.4-30.3 36.6 25 1 48.8-8.9 65.8-26.4z"></path>
        </svg>

        <h3 className="mt-2 text-sm font-semibold dark:text-white text-gray-900">
          KYC
        </h3>
        <p className="mt-1 text-sm dark:text-white text-gray-500">
          Since you are signing up as an NGO company, we need to verify your
          identify.
        </p>

        <div className="mt-6">
          <button
            type="button"
            className="inline-flex items-center bg-gradient-to-r from-indigo-100 to-indigo-500 hover:from-indigo-300 hover:to-indigo-700 text-white font-bold py-1 px-4 rounded"
            onClick={handleStart}
          >
            Get started
          </button>
        </div>

        <Divider />

        <div
          className="flex flex-row items-center justify-center text-center text-sm font-medium space-x-1 dark:text-white text-gray-500 cursor-pointer"
          onClick={() => {
            Cookies.remove("accessToken");
            Cookies.remove("refreshToken");
            window.location.href = "/";
          }}
        >
          Sign out
        </div>
      </div>
    </>
  );
}
