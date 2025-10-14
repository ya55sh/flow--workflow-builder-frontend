"use client";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";
import { useRouter } from "next/navigation";
import axios from "axios";
import { saveToken } from "../utils/tokenUtils";

interface GooglePayload {
	email: string;
	name: string;
	sub: string;
}

type GoogleAuthButtonProps = {
	mode: "login" | "signup"; // restricts allowed values
};

export default function Auth({ mode }: GoogleAuthButtonProps) {
	const router = useRouter();

	const handleGoogleResponse = async (credentialResponse: any) => {
		let data;
		const decoded: GooglePayload = jwtDecode(credentialResponse.credential);
		console.log("User info:", decoded);

		// Send credentialResponse.credential to your backend
		// Backend decides: login existing user OR signup new user
		if (mode === "signup") {
			console.log("SIGNUP FLOW");
			data = await axios.post(
				`${process.env.NEXT_PUBLIC_URI}${process.env.NEXT_PUBLIC_SIGNUP_URI}`,
				{ type: `google`, email: `${decoded.email}`, sub: `${decoded.sub}` },
				{
					headers: {
						"Content-Type": "application/json",
					},
				}
			);
		} else {
			console.log("LOGIN FLOW");
			data = await axios.post(
				`${process.env.NEXT_PUBLIC_URI}${process.env.NEXT_PUBLIC_LOGIN_URI}`,
				{ type: `google`, email: `${decoded.email}`, sub: `${decoded.sub}` },
				{
					headers: {
						"Content-Type": "application/json",
					},
				}
			);
		}

		console.log("Backend response:", data);

		// Save access token to localStorage if present in response
		if (data?.data?.access_token) {
			saveToken(data.data.access_token);
			console.log("Access token saved to localStorage");
		}

		// Example: Redirect to dashboard after successful login
		if (mode === "signup" && data?.data?.type === "normal") {
			router.push("/login");
		} else {
			router.push("/");
		}
	};

	return (
		<GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!}>
			<div className="flex flex-col gap-4">
				<GoogleLogin
					onSuccess={handleGoogleResponse}
					onError={() => {
						console.log("Google Sign-In Failed");
					}}
				/>
			</div>
		</GoogleOAuthProvider>
	);
}
