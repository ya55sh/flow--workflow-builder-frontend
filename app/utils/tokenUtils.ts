/**
 * Utility functions for managing access tokens in localStorage
 */

const TOKEN_KEY = "accessToken";

/**
 * Save access token to localStorage
 * @param token - The access token to save
 */
export const saveToken = (token: string): void => {
	if (typeof window !== "undefined") {
		localStorage.setItem(TOKEN_KEY, token);
	}
};

/**
 * Get access token from localStorage
 * @returns The access token or null if not found
 */
export const getToken = (): string | null => {
	if (typeof window !== "undefined") {
		return localStorage.getItem(TOKEN_KEY);
	}
	return null;
};

/**
 * Check if access token exists in localStorage
 * @returns True if token exists, false otherwise
 */
export const hasToken = (): boolean => {
	return getToken() !== null;
};

/**
 * Remove access token from localStorage
 */
export const removeToken = (): void => {
	if (typeof window !== "undefined") {
		localStorage.removeItem(TOKEN_KEY);
	}
};

/**
 * Get token with Bearer prefix for API requests
 * @returns Bearer token string or null if no token
 */
export const getBearerToken = (): string | null => {
	const token = getToken();
	return token ? `Bearer ${token}` : null;
};

/**
 * Check if token is expired (basic JWT expiration check)
 * @returns True if token is expired or invalid, false if valid
 */
export const isTokenExpired = (): boolean => {
	const token = getToken();
	if (!token) return true;

	try {
		// Decode JWT payload (without verification)
		const payload = JSON.parse(atob(token.split(".")[1]));
		const currentTime = Math.floor(Date.now() / 1000);

		// Check if token is expired
		return payload.exp < currentTime;
	} catch (error) {
		// If token is malformed, consider it expired
		return true;
	}
};
