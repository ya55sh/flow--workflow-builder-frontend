"use client";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";
import { useRouter } from "next/navigation";

interface GooglePayload {
	email: string;
	name: string;
}

export default function Auth() {
	const router = useRouter();

	const handleGoogleResponse = (credentialResponse: any) => {
		console.log("JWT Credential:", credentialResponse.credential);

		const decoded: GooglePayload = jwtDecode(credentialResponse.credential);
		console.log("User info:", decoded);

		// Example: Redirect to dashboard after successful login
		router.push("/");
		// Send credentialResponse.credential to your backend
		// Backend decides: login existing user OR signup new user
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
