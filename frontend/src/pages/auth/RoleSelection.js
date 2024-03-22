import Cookies from "js-cookie";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { BiDonateBlood } from "react-icons/bi";
import { FaBuildingNgo } from "react-icons/fa6";
import { GrUserExpert } from "react-icons/gr";
import { RiServiceFill } from "react-icons/ri";
import { useNavigate } from "react-router-dom";
import AuthService from "../../service/AuthService";

const RoleSelection = () => {
  const [selected, setSelected] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      if (!selected) return;
      await AuthService.roleSelect({
        role: selected,
      });
      navigate("/dashboard");
    },
    [navigate, selected]
  );

  return (
    <>
      <div
        className="fixed left-0 top-0 w-[100vw] h-[100vh]"
        style={{
          backgroundSize: "cover",
          backgroundPosition: "center",
          zIndex: -1,
          backgroundImage: `url('/dashboard.png')`,
          filter: "blur(10px)",
        }}
      />
      <div className="relative flex min-h-screen flex-col justify-center overflow-hidden bg-transparent py-12">
        <div className="relative bg-white dark:bg-gray-900 px-6 pt-10 pb-9 shadow-xl mx-auto w-full max-w-lg rounded-2xl">
          <div className="mx-auto flex w-full max-w-md flex-col space-y-4">
            <div className="flex flex-col items-center justify-center text-center space-y-2">
              <div className="font-semibold text-3xl">
                <p>Select your role</p>
              </div>
              <div className="flex flex-row text-sm font-medium dark:text-white text-gray-400">
                <p>Which of the following describes you best?</p>
              </div>
            </div>
            <div>
              <form onSubmit={handleSubmit}>
                <div className="flex flex-col space-y-4">
                  <div className="flex flex-row items-center justify-between mx-auto w-full max-w-xs">
                    <div className="w-full max-w-sm p-2 bg-white dark:bg-gray-900  rounded-lg  sm:p-4 ">
                      <ul className="my-4 space-y-3">
                        <li>
                          <a
                            href="#"
                            className={`flex items-center p-3 text-base font-bold dark:text-white text-gray-900 rounded-lg bg-gray-50 group ${
                              selected === "ngo-company"
                                ? "shadow bg-gray-100 dark:bg-gray-500 bg-indigo-500 text-white"
                                : "hover:shadow hover:bg-gray-100"
                            } dark:bg-gray-600 dark:hover:bg-gray-500 dark:text-white`}
                            onClick={() => setSelected("ngo-company")}
                          >
                            <FaBuildingNgo />
                            <span className="flex-1 ms-3 whitespace-nowrap">
                              NGO Company
                            </span>
                            {/* <span className="inline-flex items-center justify-center px-2 py-0.5 ms-3 text-xs font-medium dark:text-white text-gray-500 bg-gray-200 rounded dark:bg-gray-700 dark:text-gray-400">
                              Popular
                            </span> */}
                          </a>
                        </li>
                        <li>
                          <a
                            href="#"
                            className={`flex items-center p-3 text-base font-bold dark:text-white text-gray-900 rounded-lg bg-gray-50 group ${
                              selected === "ngo-beneficiary"
                                ? "shadow bg-gray-100 dark:bg-gray-500 bg-indigo-500 text-white"
                                : "hover:shadow hover:bg-gray-100"
                            } dark:bg-gray-600 dark:hover:bg-gray-500 dark:text-white`}
                            onClick={() => setSelected("ngo-beneficiary")}
                          >
                            <RiServiceFill />
                            <span className="flex-1 ms-3 whitespace-nowrap">
                              NGO Beneficiary
                            </span>
                          </a>
                        </li>
                        <li>
                          <a
                            href="#"
                            className={`flex items-center p-3 text-base font-bold dark:text-white text-gray-900 rounded-lg bg-gray-50 group ${
                              selected === "donor"
                                ? "shadow bg-gray-100 dark:bg-gray-500 bg-indigo-500 text-white"
                                : "hover:shadow hover:bg-gray-100"
                            } dark:bg-gray-600 dark:hover:bg-gray-500 dark:text-white`}
                            onClick={() => setSelected("donor")}
                          >
                            <BiDonateBlood />
                            <span className="flex-1 ms-3 whitespace-nowrap">
                              Donor
                            </span>
                          </a>
                        </li>
                        <li>
                          <a
                            href="#"
                            className={`flex items-center p-3 text-base font-bold dark:text-white text-gray-900 rounded-lg bg-gray-50 group ${
                              selected === "expert"
                                ? "shadow bg-gray-100 dark:bg-gray-500 bg-indigo-500 text-white"
                                : "hover:shadow hover:bg-gray-100"
                            } dark:bg-gray-600 dark:hover:bg-gray-500 dark:text-white`}
                            onClick={() => setSelected("expert")}
                          >
                            <GrUserExpert />

                            <span className="flex-1 ms-3 whitespace-nowrap">
                              Expert
                            </span>
                          </a>
                        </li>
                      </ul>
                    </div>
                  </div>
                  <div className="flex flex-col space-y-5">
                    <div>
                      <button
                        type="submit"
                        className="flex w-full justify-center bg-gradient-to-r from-indigo-100 to-indigo-500 hover:from-indigo-300 hover:to-indigo-700 text-white font-bold py-1 px-4 rounded"
                      >
                        Submit
                      </button>
                    </div>

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
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default RoleSelection;
