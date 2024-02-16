import i18next from "i18next";
import Cookies from "js-cookie";
import React, { useEffect, useState } from "react";
import de from "./assets/img/de.svg";
import en from "./assets/img/us.svg";

const LanguageSwitcher = () => {
  const [lang, setLang] = useState("de");
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    const lang = Cookies.get("i18next");
    if (lang?.includes?.("en")) {
      setLang("en");
    } else {
      setLang(Cookies.get("i18next"));
    }
  }, []);

  const handleLanguageChange = (lang) => {
    Cookies.set("i18next", lang);
    i18next.changeLanguage(lang);
    setLang(lang);
    setDropdownOpen(false);
  };

  return (
    <div className="languageswitch-wrapper">
      <ul className="flex justify-end items-center flex-shrink-0 space-x-6">
        <li className="changeLanguage">
          <div className="dropdown">
            <button
              className="dropbtn focus:outline-none"
              onClick={() => setDropdownOpen((t) => !t)}
            >
              {lang === "de" ? (
                <img src={de} width={16} alt="lang" className="mx-2" />
              ) : (
                <img src={en} className="mx-2" alt="lang" width={16} />
              )}
              {lang === "de" ? "DE" : "EN"}
            </button>

            <div
              className="dropdown-content"
              style={{ display: dropdownOpen ? "block" : "none" }}
            >
              <div
                onClick={() => handleLanguageChange("en")}
                className="focus:outline-none cursor-pointer"
              >
                <img src={en} width={16} alt="lang" /> EN{" "}
              </div>
              <div
                onClick={() => handleLanguageChange("de")}
                className="focus:outline-none cursor-pointer"
              >
                <img src={de} width={16} alt="lang" /> DE
              </div>
            </div>
          </div>
        </li>
      </ul>
    </div>
  );
};

export default LanguageSwitcher;
