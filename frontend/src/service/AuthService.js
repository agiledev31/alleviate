import axios from "axios";
import { getBackendUrl } from "./getBackendUrl";
import { middleField } from "./middlefield";

class AuthService {
  constructor(baseURL) {
    this.baseURL = baseURL;
    this.api = axios.create({
      baseURL,
    });
    middleField(this.api);
  }

  register({
    role,
    email,
    phone,
    password,
    firstName,
    lastName,
    roleSelected,
    sector,
  }) {
    return this.api.post("/register", {
      role,
      email,
      phone,
      password,
      firstName,
      lastName,
      roleSelected,
      sector,
    });
  }

  login({ email, password }) {
    return this.api.post("/login", { email, password });
  }

  refresh({ accessToken, refreshToken }) {
    var raw = JSON.stringify({ accessToken, refreshToken });

    var requestOptions = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: raw,
    };

    return fetch(this.baseURL + "/refresh", requestOptions);
  }

  requestPasswordReset({ email }) {
    return this.api.post("/requestPasswordReset", { email });
  }

  resetPassword({ resetToken, newPassword }) {
    return this.api.post("/resetPassword", { resetToken, newPassword });
  }

  confirmEmail({ email }) {
    return this.api.post("/confirmEmail", { email });
  }
  me() {
    return this.api.get("/me");
  }
  updateMe(me) {
    return this.api.put("/updateMe", me);
  }
  otpRequest({ purpose }) {
    return this.api.post("/otpRequest", { purpose });
  }
  otpVerify({ OTP }) {
    return this.api.post("/otpVerify", { OTP });
  }
  requestKyc() {
    return this.api.post("/requestKyc", { origin: window.location.origin });
  }
  roleSelect(e) {
    return this.api.post("/roleSelect", e);
  }
  registerTeam(data) {
    return this.api.post("/registerTeam", data);
  }

  generateLinkToInviteUser({ program, invitePeopleEmails, type }) {
    return this.api.post("/generateLinkToInviteUser", {
      program,
      invitePeopleEmails,
      baseURL: window.location.origin,
      type,
    });
  }
}

export default new AuthService(`${getBackendUrl()}/auth`);
