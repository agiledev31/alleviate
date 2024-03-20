import { DARK_MODE, LOADING, LOGIN, LOGOUT } from "./constants";

const initialState = {
  user: null,
};

const authReducer = (state = initialState, action) => {
  switch (action.type) {
    case LOGIN:
      return {
        ...state,
        user: action.payload,
      };
    case LOGOUT:
      return {
        ...state,
        user: null,
      };
    case LOADING:
      return {
        ...state,
        loading: action.payload,
      };
    case DARK_MODE:
      return {
        ...state,
        darkMode: action.payload,
      };
    default:
      return state;
  }
};

export default authReducer;
