"use client";
import Script from "next/script";
import Link from "next/link";
import { useEffect, useState } from "react";
import Auth from "../components/GoogleOauth";

export default function Login() {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");

	// useEffect(() => {
	// 	// Google callback: runs when user signs in
	// 	(window as any).handleCredentialResponse = (response: any) => {
	// 		console.log("Encoded JWT ID token:", response.credential);

	// 		// Optionally decode it client-side
	// 		const payload = JSON.parse(atob(response.credential.split(".")[1]));
	// 		console.log("Decoded payload:", payload);
	// 	};
	// }, []);

	const handleSubmit = (e: React.FormEvent) => {
		console.log("FORM CLICKED", email, password);
		e.preventDefault();
	};

	return (
		<>
			<Script src="https://accounts.google.com/gsi/client" async defer />
			<div className="min-h-screen flex items-center justify-center p-4 m-2">
				<div className="w-full max-w-sm flex flex-col items-center justify-center p-8 m-2 mb-12 bg-gray-900 text-white border-2 border-indigo-500/50 rounded-lg shadow-lg">
					<h3 className="mb-4 text-lg ">Login</h3>
					<form onSubmit={handleSubmit}>
						<div className="mb-4">
							<input
								id="email"
								type="email"
								name="email"
								placeholder="Email"
								value={email}
								required
								autoComplete="email"
								className="block w-full rounded-md bg-white/5 px-3 py-1.5 text-base text-white outline-1 -outline-offset-1 outline-white/10 placeholder:text-gray-500 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-500 sm:text-sm/6"
								onChange={(e) => setEmail(e.target.value)}
							/>
						</div>
						<div className="mb-4">
							<input
								id="password"
								type="password"
								name="password"
								placeholder="Password"
								value={password}
								required
								autoComplete="current-password"
								className="block w-full rounded-md bg-white/5 px-3 py-1.5 text-base text-white outline-1 -outline-offset-1 outline-white/10 placeholder:text-gray-500 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-500 sm:text-sm/6"
								onChange={(e) => setPassword(e.target.value)}
							/>
						</div>
						<div className="mb-4">
							<button
								type="submit"
								className="w-full rounded-md bg-indigo-500/90 px-3 py-1.5 text-base font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500/70 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 sm:text-sm/6"
							>
								Login
							</button>
						</div>
						<div className="mb-4">
							<p className="text-sm">
								<Link href="/resetpassword">Forgot Password?&nbsp;</Link>
							</p>
						</div>
						<div className="mb-4">
							<p className="text-sm">
								Don't have an account?&nbsp;
								<Link href="/signup">Signup</Link>
							</p>
						</div>
						<div>
							<Auth />
						</div>
					</form>
				</div>
			</div>
		</>
	);
}
