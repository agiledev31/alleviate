import { message } from "antd";
import Cookies from "js-cookie";
import jwt_decode from "jwt-decode";
import { logout, setLoading } from "../redux/auth/actions";
import { store } from "../redux/store";
import { getBackendUrl } from "./getBackendUrl";

export const middleField = (api) => {
  api.interceptors.response.use(
    (response) => {
      store.dispatch(setLoading(false));
      if (response?.data?.message) message.success(response.data.message);
      return response;
    },
    (error) => {
      store.dispatch(setLoading(false));
      const { response } = error;
      if (response) {
        const { data } = response;
        if (data && data.message) {
          if (data.message === "Invalid access_token") {
            store.dispatch(logout());
            window.location.href = "/";
            return;
          }

          if (!["jwt_expired", "jwt must be provided"].includes(data.message))
            message.error(data.message);
        }
      }
      return Promise.reject(error);
    }
  );

  api.interceptors.request.use(
    async (config) => {
      store.dispatch(setLoading(true));

      let access_token = Cookies.get("accessToken");
      let refresh_token = Cookies.get("refreshToken");

      if (access_token) {
        const decodedToken = jwt_decode(access_token);
        if (5000 + decodedToken.exp * 1000 <= new Date()) {
          var raw = JSON.stringify({
            accessToken: access_token,
            refreshToken: refresh_token,
          });

          var requestOptions = {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: raw,
          };

          const result = await fetch(
            getBackendUrl() + "/auth/refresh",
            requestOptions
          );
          const response = await result.json();

          if (!response?.accessToken) {
            store.dispatch(logout());
            window.location.href = "/";
            return;
          }

          Cookies.set("accessToken", response?.accessToken);
          Cookies.set("refreshToken", response?.refreshToken);

          access_token = response?.accessToken;
          refresh_token = response?.refreshToken;
        }
      }

      return {
        ...config,
        headers: {
          access_token,
          refresh_token,
        },
      };
    },
    (error) => {
      store.dispatch(setLoading(false));
      return Promise.reject(error);
    }
  );
};
