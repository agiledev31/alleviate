import { DARK_MODE, LOADING, LOGIN, LOGOUT } from "./constants";

export const login = (user) => ({
  type: LOGIN,
  payload: user,
});

export const logout = () => ({
  type: LOGOUT,
});

export const setLoading = (loading) => ({
  type: LOADING,
  payload: loading,
});

export const setDarkMode = (mode) => ({
  type: DARK_MODE,
  payload: mode,
});
