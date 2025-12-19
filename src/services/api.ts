import axios from "axios";
import { getToken, updateToken } from "./keycloak";

const apiClient = axios.create({
    baseURL: "http://localhost:8080/api",
    headers: {
        "Content-Type": "application/json",
    },
});

// Add a request interceptor to include the token if we implement auth later
// For now, we'll assume we might need to handle auth headers here
apiClient.interceptors.request.use(
    async (config) => {
        try {
            await updateToken(30);
            const token = getToken();
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        } catch (error) {
            console.error("Failed to refresh token", error);
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    },
);

export default apiClient;
