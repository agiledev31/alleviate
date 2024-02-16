export const getBackendUrl = () =>
  process.env.NODE_ENV !== "production"
    ? "http://localhost:5055/api"
    : "https://alleviate-backend.vercel.app/api";
