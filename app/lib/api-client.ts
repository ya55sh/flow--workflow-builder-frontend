/**
 * API Client Module
 * Centralized HTTP client for making API requests to the backend
 *
 * Features:
 * - Automatic authentication token injection
 * - Request/response interceptors
 * - Error handling and token expiration detection
 * - Typed response handling
 * - Automatic redirect to login on 401 errors
 */
import axios, { AxiosRequestConfig, AxiosResponse } from "axios";
import { API_URL } from "./config";

/**
 * Helper: Get authentication token from localStorage
 * Only runs on client side (checks for window object)
 * @returns Access token or null if not found
 */
const getAuthToken = (): string | null => {
	if (typeof window !== "undefined") {
		return localStorage.getItem("accessToken");
	}
	return null;
};

/**
 * Create configured axios instance
 * Base configuration applied to all requests
 */
const axiosInstance = axios.create({
	baseURL: API_URL, // Base URL from config
	headers: {
		"Content-Type": "application/json", // Default content type
	},
});

/**
 * Request Interceptor
 * Automatically adds authentication token to all requests
 */
axiosInstance.interceptors.request.use(
	(config) => {
		const token = getAuthToken();
		if (token) {
			config.headers.Authorization = `Bearer ${token}`;
		}
		return config;
	},
	(error) => {
		return Promise.reject(error);
	}
);

/**
 * Response Interceptor
 * Handles global error cases and authentication failures
 */
axiosInstance.interceptors.response.use(
	(response) => response, // Pass through successful responses
	(error) => {
		// Handle 401 Unauthorized errors globally
		if (error.response?.status === 401) {
			// Token expired or invalid - redirect to login
			console.error("Unauthorized - redirecting to login");
			if (typeof window !== "undefined") {
				localStorage.removeItem("accessToken"); // Clear invalid token
				window.location.href = "/login"; // Force redirect to login
			}
		}
		return Promise.reject(error); // Re-throw for specific handling
	}
);

/**
 * API Client Object
 * Provides typed HTTP methods for API calls
 * All methods automatically include auth token and handle errors
 */
export const apiClient = {
	// GET request
	get: async <T = any>(path: string, config?: AxiosRequestConfig): Promise<T> => {
		try {
			const response: AxiosResponse<T> = await axiosInstance.get(path, config);
			return response.data;
		} catch (error: any) {
			console.error(`GET ${path} failed:`, error.response?.data || error.message);
			throw error;
		}
	},

	// POST request
	post: async <T = any>(path: string, data?: any, config?: AxiosRequestConfig): Promise<T> => {
		try {
			const response: AxiosResponse<T> = await axiosInstance.post(path, data, config);
			return response.data;
		} catch (error: any) {
			console.error(`POST ${path} failed:`, error.response?.data || error.message);
			throw error;
		}
	},

	// PUT request
	put: async <T = any>(path: string, data?: any, config?: AxiosRequestConfig): Promise<T> => {
		try {
			const response: AxiosResponse<T> = await axiosInstance.put(path, data, config);
			return response.data;
		} catch (error: any) {
			console.error(`PUT ${path} failed:`, error.response?.data || error.message);
			throw error;
		}
	},

	// PATCH request
	patch: async <T = any>(path: string, data?: any, config?: AxiosRequestConfig): Promise<T> => {
		try {
			const response: AxiosResponse<T> = await axiosInstance.patch(path, data, config);
			return response.data;
		} catch (error: any) {
			console.error(`PATCH ${path} failed:`, error.response?.data || error.message);
			throw error;
		}
	},

	// DELETE request
	delete: async <T = any>(path: string, config?: AxiosRequestConfig): Promise<T> => {
		try {
			const response: AxiosResponse<T> = await axiosInstance.delete(path, config);
			return response.data;
		} catch (error: any) {
			console.error(`DELETE ${path} failed:`, error.response?.data || error.message);
			throw error;
		}
	},
};

// Export axios instance for direct use if needed
export { axiosInstance };
