import Cookies from "js-cookie";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import AuthService from "../../service/AuthService";

const OTP = () => {
  const [me, setMe] = useState(null);
  const [minutes, setMinutes] = useState(5);
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    AuthService.me().then((data) => setMe(data.data.me));
  }, []);

  useEffect(() => {
    let interval;

    if (isActive && (minutes > 0 || seconds > 0)) {
      interval = setInterval(() => {
        if (seconds === 0) {
          if (minutes === 0) {
            setIsActive(false);
            clearInterval(interval);
          } else {
            setMinutes((prevMinutes) => prevMinutes - 1);
            setSeconds(59);
          }
        } else {
          setSeconds((prevSeconds) => prevSeconds - 1);
        }

        if (seconds === 1 && minutes === 0) {
          setIsActive(false);
          clearInterval(interval);
        }
      }, 1000);
    }

    return () => {
      clearInterval(interval);
    };
  }, [isActive, minutes, seconds]);

  const resetTimer = () => {
    setIsActive(true);
    setMinutes(1);
    setSeconds(0);
  };

  const formRef = useRef(null);
  const inputRef1 = useRef(null);
  const inputRef2 = useRef(null);
  const inputRef3 = useRef(null);
  const inputRef4 = useRef(null);

  const focusNextInput = (currentRef, nextRef) => {
    if (currentRef.current.value.length >= currentRef.current.maxLength) {
      nextRef.current && nextRef.current.focus();
    }
  };
  const focusPrevInput = (currentRef, prevRef) => {
    if (currentRef.current.value.length === 0) {
      prevRef.current && prevRef.current.focus();
    }
  };

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      await AuthService.otpVerify({
        OTP: `${e.target[0].value}${e.target[1].value}${e.target[2].value}${e.target[3].value}`,
      });
      navigate("/dashboard");
    },
    [navigate]
  );

  const handleResend = useCallback(async () => {
    await AuthService.otpRequest({ purpose: "phone" });
    if (isActive) return;
    resetTimer();
  }, [isActive]);

  useEffect(() => {
    AuthService.otpRequest({ purpose: "phone" });
  }, []);

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
          <div className="mx-auto flex w-full max-w-md flex-col space-y-16">
            <div className="flex flex-col items-center justify-center text-center space-y-2">
              <div className="font-semibold text-3xl">
                <p>Phone Verification</p>
              </div>
              <div className="flex flex-row text-sm font-medium dark:text-white text-gray-400">
                <p>
                  We have sent a code via SMS to{" "}
                  {me?.phone?.slice(0, 4) + "**" + me?.phone?.slice(-3)}
                </p>
              </div>
            </div>
            <div>
              <form
                onSubmit={handleSubmit}
                ref={formRef}
                onKeyDown={(e) => {
                  if (e.key !== "Enter") return;
                  e.target.submit();
                }}
              >
                <div className="flex flex-col space-y-16">
                  <div className="flex flex-row items-center justify-between mx-auto w-full max-w-xs">
                    <div className="w-16 h-16 ">
                      <input
                        ref={inputRef1}
                        className="dark:bg-gray-900 w-full h-full flex flex-col items-center justify-center text-center px-5 outline-none rounded-xl border border-gray-200 text-lg bg-white dark:bg-gray-900 focus:bg-gray-50 focus:ring-1 ring-blue-700"
                        type="text"
                        autoFocus
                        maxLength={1}
                        onChange={() => focusNextInput(inputRef1, inputRef2)}
                      />
                    </div>
                    <div className="w-16 h-16 ">
                      <input
                        ref={inputRef2}
                        className="dark:bg-gray-900 w-full h-full flex flex-col items-center justify-center text-center px-5 outline-none rounded-xl border border-gray-200 text-lg bg-white dark:bg-gray-900 focus:bg-gray-50 focus:ring-1 ring-blue-700"
                        type="text"
                        maxLength={1}
                        onKeyDown={(e) => {
                          if (e.key === "Backspace")
                            focusPrevInput(inputRef2, inputRef1);
                        }}
                        onChange={() => focusNextInput(inputRef2, inputRef3)}
                      />
                    </div>
                    <div className="w-16 h-16 ">
                      <input
                        ref={inputRef3}
                        className="dark:bg-gray-900 w-full h-full flex flex-col items-center justify-center text-center px-5 outline-none rounded-xl border border-gray-200 text-lg bg-white dark:bg-gray-900 focus:bg-gray-50 focus:ring-1 ring-blue-700"
                        type="text"
                        maxLength={1}
                        onKeyDown={(e) => {
                          if (e.key === "Backspace")
                            focusPrevInput(inputRef3, inputRef2);
                        }}
                        onChange={() => focusNextInput(inputRef3, inputRef4)}
                      />
                    </div>
                    <div className="w-16 h-16 ">
                      <input
                        ref={inputRef4}
                        className="dark:bg-gray-900 w-full h-full flex flex-col items-center justify-center text-center px-5 outline-none rounded-xl border border-gray-200 text-lg bg-white dark:bg-gray-900 focus:bg-gray-50 focus:ring-1 ring-blue-700"
                        type="text"
                        maxLength={1}
                        onKeyDown={(e) => {
                          if (e.key === "Backspace")
                            focusPrevInput(inputRef4, inputRef3);
                        }}
                      />
                    </div>
                  </div>
                  <div className="flex flex-col space-y-5">
                    <div>
                      <button
                        type="submit"
                        className="flex w-full justify-center bg-gradient-to-r from-indigo-100 to-indigo-500 hover:from-indigo-300 hover:to-indigo-700 text-white font-bold py-1 px-4 rounded"
                      >
                        Verify
                      </button>
                    </div>
                    <div className="flex flex-row items-center justify-center text-center text-sm font-medium space-x-1 dark:text-white text-gray-500">
                      <p>Didn't receive the code?</p>{" "}
                      <a
                        className="flex flex-row items-center text-blue-600"
                        href="#"
                        rel="noopener noreferrer"
                        onClick={handleResend}
                      >
                        Resend{" "}
                        {isActive && (
                          <>
                            (
                            {`${String(minutes).padStart(2, "0")}:${String(
                              seconds
                            ).padStart(2, "0")}`}
                            )
                          </>
                        )}
                      </a>
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

export default OTP;
