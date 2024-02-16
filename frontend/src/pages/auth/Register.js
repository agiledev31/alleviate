import Cookies from "js-cookie";
import jwt_decode from "jwt-decode";
import React, { useCallback, useEffect, useState } from "react";
import PhoneInput from "react-phone-number-input";
import "react-phone-number-input/style.css";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import Select from "../../components/Select";
import { benchmarksSectorType } from "../../data/constants";
import { login } from "../../redux/auth/actions";
import { store } from "../../redux/store";
import AuthService from "../../service/AuthService";

const Login = () => {
  let [searchParams] = useSearchParams();
  const [pasVisible, setPasVisible] = useState(false);
  const [role, setRole] = useState("ngo-company");
  const [phone, setPhone] = useState();
  const [sector, setSector] = useState("education");
  const [tokenData, setTokenData] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    const token = searchParams.get("token");
    if (token) {
      const tokenData = jwt_decode(token);
      setTokenData(tokenData);
      if (tokenData && tokenData.userRole) {
        setRole(tokenData.userRole);
      }
    }
  }, [searchParams]);

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();

      const [firstName, lastName, email, a, b, password] = new Array(6)
        .fill(0)
        .map((_, i) => e.target[i].value);

      await AuthService.register({
        firstName,
        lastName,
        email,
        phone,
        password,
        role: role,
        roleSelected: !!tokenData,
        sector,
      });

      const result = await AuthService.login({
        email,
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
    [navigate, role, phone, sector]
  );

  return (
    <>
      <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-sm">
          <img
            className="mx-auto h-10 w-auto"
            src="/logo-long-black.png"
            alt="Your Company"
          />
          <h2 className="mt-10 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900">
            Create your account
          </h2>
        </div>

        <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
          <form
            className="space-y-6"
            action="#"
            method="POST"
            onSubmit={handleSubmit}
          >
            {/* <div>
              <div className="flex items-center justify-between">
                <label
                  htmlFor="password"
                  className="block text-sm font-medium leading-6 text-gray-900"
                >
                  Role
                </label>
              </div>
              <div className="mt-0">
                <Select
                  options={[
                    { value: "ngo-company", label: "NGO Company" },
                    { value: "ngo-beneficiary", label: "NGO Beneficiary" },
                    { value: "expert", label: "Expert" },
                    { value: "donor", label: "Donor" },
                  ]}
                  value={role}
                  onChange={setRole}
                />
              </div>
            </div> */}

            <div class="flex space-x-4">
              <div class="w-1/2">
                <label
                  htmlFor="firstname"
                  className="block text-sm font-medium leading-6 text-gray-900"
                >
                  Firstname
                </label>
                <div className="mt-2">
                  <input
                    name="firstname"
                    type="text"
                    required
                    className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                  />
                </div>
              </div>
              <div class="w-1/2">
                <label
                  htmlFor="lastname"
                  className="block text-sm font-medium leading-6 text-gray-900"
                >
                  Lastname
                </label>
                <div className="mt-2">
                  <input
                    name="lastname"
                    type="text"
                    required
                    className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                  />
                </div>
              </div>
            </div>

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium leading-6 text-gray-900"
              >
                Email address
              </label>
              <div className="mt-2">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium leading-6 text-gray-900"
              >
                Mobile
              </label>
              <div className="mt-2">
                <PhoneInput
                  placeholder="Enter phone number"
                  defaultCountry="US"
                  value={phone}
                  onChange={setPhone}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label
                  htmlFor="password"
                  className="block text-sm font-medium leading-6 text-gray-900"
                >
                  Password
                </label>
              </div>
              <div className="mt-0">
                <input
                  type={pasVisible ? "text" : "password"}
                  id="password"
                  name="password"
                  autoComplete="current-password"
                  required
                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                />
                {pasVisible ? (
                  <img
                    src="/images/eye-closed.svg"
                    loading="lazy"
                    data-w-id="4174893b-87a0-cbe1-4392-8b22ea8df3c1"
                    id="eye-close"
                    alt=""
                    className="eye-icon"
                    onClick={() => setPasVisible(false)}
                  />
                ) : (
                  <img
                    src="/images/eye.svg"
                    loading="lazy"
                    data-w-id="a9272237-7e19-a365-72eb-10c9197bb5be"
                    id="eye-open"
                    alt=""
                    className="eye-icon"
                    onClick={() => setPasVisible(true)}
                  />
                )}
              </div>
            </div>

            <div className="mt-0">
              <label
                htmlFor="sector"
                className="block text-sm font-medium leading-6 text-gray-900"
              >
                Sector
              </label>
              <div className="mt-2">
                <Select
                  options={benchmarksSectorType}
                  value={sector}
                  onChange={setSector}
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              >
                Sign up
              </button>
            </div>
          </form>

          <p className="mt-10 text-center text-sm text-gray-500">
            Already member?{" "}
            <Link
              to="/auth/login"
              className="font-semibold leading-6 text-indigo-600 hover:text-indigo-500"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </>
  );
};

export default Login;
