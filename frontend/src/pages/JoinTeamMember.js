import { Button, Checkbox, Skeleton } from "antd";
import Cookies from "js-cookie";
import jwtDecode from "jwt-decode";
import React, { useCallback, useEffect, useId, useState } from "react";
import { useSelector } from "react-redux";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { login } from "../redux/auth/actions";
import { selectLoading } from "../redux/auth/selectors";
import { store } from "../redux/store";
import AuthService from "../service/AuthService";

const formClasses =
  "dark:bg-gray-900 block w-full appearance-none rounded-md border border-gray-200 dark:border-gray-600  bg-gray-50 px-3 py-2 dark:text-white text-gray-900 dark:text-gray-400  placeholder-gray-400 focus:border-blue-500 focus:bg-white dark:bg-gray-900 dark:bg-gray-900 focus:outline-none focus:ring-blue-500 sm:text-sm dark:bg-gray-900";
function Label({ id, children }) {
  return (
    <label
      htmlFor={id}
      className="mb-3 block text-sm font-medium dark:text-white text-gray-700 dark:text-gray-300 "
    >
      {children}
    </label>
  );
}
export function TextField({ label, type = "text", className, ...props }) {
  let id = useId();

  return (
    <div className={className}>
      {label && <Label id={id}>{label}</Label>}
      <input id={id} type={type} {...props} className={formClasses} />
    </div>
  );
}

export function SlimLayout({ children }) {
  return (
    <>
      <div className="relative flex min-h-full justify-center md:px-12 lg:px-0">
        <div className="relative z-10 flex flex-1 flex-col bg-white dark:bg-gray-900 dark:bg-gray-900 px-4 py-10  sm:justify-center md:flex-none ">
          <main className="mx-auto w-full  pb-10">{children}</main>
        </div>
      </div>
    </>
  );
}

const JoinTeamMember = () => {
  let [searchParams] = useSearchParams();
  const [tokenData, setTokenData] = useState(null);

  const navigate = useNavigate();
  const loading = useSelector(selectLoading);

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      if (!tokenData) return;

      const password = e.target[3].value;

      await AuthService.registerTeam({
        ...tokenData,
        password,
      });

      const result = await AuthService.login({
        ...tokenData,
        password,
      });
      if (!result?.data?.accessToken)
        return message.error("Could not load user data");

      Cookies.set("accessToken", result?.data?.accessToken);
      Cookies.set("refreshToken", result?.data?.refreshToken);

      const me = await AuthService.me();
      if (!me?.data) return message.error("Could not load user data");

      store.dispatch(login(me.data));

      navigate("/auth/otpemail");
    },
    [navigate, tokenData]
  );

  useEffect(() => {
    const token = searchParams.get("token");
    if (!token) return;

    const tokenData = jwtDecode(token);
    if (tokenData) setTokenData(tokenData);
  }, [searchParams]);

  if (!tokenData) return <Skeleton active />;

  return (
    <>
      <div className="flex h-[100vh] flex-col">
        <SlimLayout>
          <h2 className="mt-20 text-lg font-semibold dark:text-white text-gray-900 dark:text-gray-400 ">
            Get started
          </h2>
          <p className="mt-2 text-sm dark:text-white text-gray-700 dark:text-gray-300 ">
            Already registered?{" "}
            <Link
              to="/auth/login"
              className="font-medium text-blue-600 hover:underline"
            >
              Sign in
            </Link>{" "}
            to your account.
          </p>
          <form
            action="#"
            className="mt-10 grid grid-cols-1 gap-y-8"
            onSubmit={handleSubmit}
          >
            <TextField
              label="First name"
              name="first_name"
              type="text"
              autoComplete="given-name"
              value={tokenData?.firstName ?? ""}
              readOnly
            />
            <TextField
              label="Last name"
              name="last_name"
              type="text"
              autoComplete="family-name"
              value={tokenData?.lastName ?? ""}
              readOnly
            />
            <TextField
              className="col-span-full"
              label="Email address"
              name="email"
              type="email"
              autoComplete="email"
              value={tokenData?.email ?? ""}
              readOnly
            />
            <TextField
              className="col-span-full"
              label="Password"
              name="password"
              type="password"
              autoComplete="new-password"
              required
            />

            {
              <div className="flex gap-2">
                <Checkbox className="col-span-full" required />
                <label>
                  I accept the{" "}
                  <a href="/legal/privacy" target="_blank">
                    privacy policy
                  </a>{" "}
                  and{" "}
                  <a href="/legal/terms" target="_blank">
                    terms of service
                  </a>
                </label>
              </div>
            }
            <div>
              <Button
                htmlType="submit"
                type="primary"
                className="w-full"
                loading={loading}
              >
                <span>
                  Sign up <span aria-hidden="true">&rarr;</span>
                </span>
              </Button>
            </div>
          </form>
        </SlimLayout>
      </div>
    </>
  );
};

export default JoinTeamMember;
