"use client";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";
import { useRouter } from "next/navigation";
import { saveToken } from "../utils/tokenUtils";
import { apiClient } from "../lib/api-client";
import { API_ENDPOINTS } from "../lib/config";

/**
 * Interface: Google OAuth JWT payload
 * Contains user data returned from Google after authentication
 */
interface GooglePayload {
	email: string; // User's email from Google account
	name: string; // User's display name
	sub: string; // Google's unique user identifier (subject)
}

/**
 * Type: Component props for GoogleAuth button
 * Determines whether to use login or signup flow
 */
type GoogleAuthButtonProps = {
	mode: "login" | "signup"; // Restricts to only valid authentication modes
};

/**
 * Google OAuth Component
 * Provides "Sign in with Google" functionality
 *
 * Features:
 * - Integrates Google OAuth 2.0 authentication
 * - Supports both login and signup modes
 * - Decodes JWT tokens from Google
 * - Saves access tokens to localStorage
 * - Redirects after successful authentication
 * - Handles authentication errors
 */
export default function Auth({ mode }: GoogleAuthButtonProps) {
	const router = useRouter();

	/**
	 * Handler: Process Google OAuth response
	 * Decodes JWT token, sends to backend, saves access token, and redirects
	 *
	 * Flow:
	 * 1. Decode Google JWT to extract user info
	 * 2. Send user data to backend (login or signup endpoint)
	 * 3. Save returned access token to localStorage
	 * 4. Redirect to appropriate page based on mode
	 *
	 * @param credentialResponse - Response from Google OAuth containing JWT
	 */
	const handleGoogleResponse = async (credentialResponse: any) => {
		let data;
		// Decode JWT token to extract user information
		const decoded: GooglePayload = jwtDecode(credentialResponse.credential);

		// Send user data to backend for authentication
		// Backend handles: user creation (signup) or validation (login)
		try {
			if (mode === "signup") {
				// Signup flow: Create new user account
				data = await apiClient.post(API_ENDPOINTS.signup, {
					type: `google`,
					email: `${decoded.email}`,
					sub: `${decoded.sub}`, // Google's unique user ID
				});
			} else {
				// Login flow: Authenticate existing user
				data = await apiClient.post(API_ENDPOINTS.login, {
					type: `google`,
					email: `${decoded.email}`,
					sub: `${decoded.sub}`,
				});
			}

			// Save access token to localStorage for subsequent API requests
			if (data?.access_token) {
				saveToken(data.access_token);
			}

			// Redirect based on authentication mode and result
			if (mode === "signup" && data?.type === "normal") {
				// After signup, redirect to login page
				router.push("/login");
			} else {
				// After successful login, redirect to dashboard
				router.push("/");
			}
		} catch (error) {
			console.error("Error during authentication:", error);
		}
	};

	return (
		<GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!}>
			<div className="flex flex-col gap-4">
				<GoogleLogin
					onSuccess={handleGoogleResponse}
					onError={() => {
						// Intentionally left blank to avoid noisy logs
					}}
				/>
			</div>
		</GoogleOAuthProvider>
	);
}
