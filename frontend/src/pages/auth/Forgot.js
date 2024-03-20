import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { selectLoading } from "../../redux/auth/selectors";
import AuthService from "../../service/AuthService";

const Forgot = () => {
  const { t } = useTranslation();

  const loading = useSelector(selectLoading);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await AuthService.requestPasswordReset({ email: e.target[0].value });
  };
  return (
    <>
      <div data-ms-form="signup" className="form-block w-form">
        <h2 className="mb-30">{t("Reset Password")}</h2>
        <form
          id="email-form"
          name="email-form"
          data-name="Email Form"
          method="get"
          className="form"
          data-wf-page-id="6492c37d2445934a3c757945"
          data-wf-element-id="e157851a-5777-2ea0-896e-b0173d1f6693"
          onSubmit={handleSubmit}
        >
          <div className="form-field">
            <label htmlFor="email" className="label">
              {t("Email")}
            </label>
            <input
              type="email"
              className="dark:bg-gray-900 field w-input"
              maxLength={256}
              name="email"
              data-name="email"
              placeholder={t("Enter email")}
              id="email"
              data-ms-member="email"
            />
          </div>
          <button
            type="submit"
            class="text-white [&>*]:hover:stroke-[#294895] [&>*]:hover:text-[#294895] button w-button focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded text-sm px-5 py-2.5 text-center mr-2 inline-flex items-center"
          >
            {loading && (
              <svg
                aria-hidden="true"
                role="status"
                class="inline mr-3 w-4 h-4 text-white animate-spin"
                viewBox="0 0 100 101"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                  fill="#E5E7EB"
                ></path>
                <path
                  d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                  fill="currentColor"
                ></path>
              </svg>
            )}
            Submit
          </button>
          {/* <a
            data-ms-auth-provider="google"
            href="#"
            className="button-google w-inline-block"
          >
            <img src="/images/google.svg" loading="lazy" alt="" />
            <p>Sign up with Google</p>
          </a> */}
          <p className="label-p mt-10">
            <Link to="/auth/login" className="link">
              {t("Login")}
            </Link>
          </p>
        </form>
      </div>
    </>
  );
};

export default Forgot;
