import axios from "axios";

const api = axios.create({
  baseURL: "/api",
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  // Skip wallet address for verify endpoint during testing
  if (config.url?.includes("/credentials/verify")) {
    return config;
  }

  const walletAddress = localStorage.getItem("walletAddress");
  if (walletAddress) {
    config.headers = config.headers || {};
    (config.headers as Record<string, string>)["x-wallet-address"] =
      walletAddress;
  }
  return config;
});
export default api;
