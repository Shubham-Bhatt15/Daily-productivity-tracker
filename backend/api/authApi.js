const API = axios.create({
  baseURL: "http://localhost:5000/api/auth", // Note: /api/auth prefix
  withCredentials: true, // For cookies
});

export const register = (data) => API.post("/register", data);
export const login = (data) => API.post("/login", data);
export const logout = () => API.post("/logout");