"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { hasToken, isTokenExpired, removeToken } from "../utils/tokenUtils";
import { useDispatch } from "react-redux";
import { setUser } from "../features/workflowSlice";
import { apiClient } from "../lib/api-client";
import { API_ENDPOINTS } from "../lib/config";

/**
 * Interface: User's connected app/integration
 * Represents an external service the user has authenticated with
 */
interface UserApp {
	appName: string; // Name of the integrated service (gmail, slack, github, etc.)
	expiresAt?: number | string | null; // OAuth token expiration timestamp
}

/**
 * Interface: User profile data
 * Contains user identification and connected integrations
 */
interface User {
	id: string; // Unique user identifier
	email: string; // User's email address
	userApp?: UserApp[]; // List of connected app integrations
}

/**
 * Profile Page Component
 * Displays user account information and connected app integrations
 *
 * Features:
 * - Display user email and ID
 * - List all connected app integrations
 * - Show OAuth token expiration status
 * - Visual indicators for expired connections
 * - Logout functionality
 */
export default function ProfilePage() {
	const router = useRouter();
	const dispatch = useDispatch();
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [user, setUserState] = useState<User | null>(null);
	const [isMounted, setIsMounted] = useState(false);

	// Ensure component is mounted on client side
	useEffect(() => {
		setIsMounted(true);
	}, []);

	// Check authentication on component mount
	useEffect(() => {
		if (!isMounted) return;

		if (!hasToken() || isTokenExpired()) {
			removeToken();
			router.push("/login");
			return;
		}
		loadUserDetails();
	}, [router, isMounted]);

	/**
	 * Loads user profile details from backend API
	 * Fetches user info and connected app integrations
	 * Updates both Redux store and local component state
	 */
	const loadUserDetails = async () => {
		setIsLoading(true);
		setError(null);

		try {
			const data = await apiClient.get(API_ENDPOINTS.getUser);
			console.log("User details fetched:", data);
			console.log("User object:", data?.user);
			console.log("User apps:", data?.userApp);

			// Backend returns { user: {...}, userApp: [...] }
			// Combine them into a single unified object for frontend use
			const userData: User = {
				id: data?.user?.id?.toString() || "",
				email: data?.user?.email || "",
				userApp: data?.userApp || [], // Array of connected integrations
			};
			console.log("Combined user data:", userData);

			// Update both Redux store (for global access) and local state (for UI rendering)
			dispatch(setUser(userData));
			setUserState(userData);
		} catch (error) {
			console.error("Error fetching user details:", error);
			setError("Failed to load user profile. Please try again.");
		} finally {
			setIsLoading(false);
		}
	};

	/**
	 * Handler: Log out user
	 * Removes authentication token and redirects to login page
	 * Prompts for confirmation before logging out
	 */
	const handleLogout = () => {
		if (confirm("Are you sure you want to logout?")) {
			removeToken(); // Clear access token from localStorage
			router.push("/login"); // Redirect to login page
		}
	};

	/**
	 * Helper: Check if an app integration's OAuth token is expired
	 * @param app - The app integration to check
	 * @returns true if token is expired, false otherwise
	 */
	const isAppExpired = (app: UserApp): boolean => {
		if (!app.expiresAt) return false; // No expiry date means it doesn't expire
		// Handle both string (ISO date) and number (timestamp) formats
		const expiryTime = typeof app.expiresAt === "string" ? new Date(app.expiresAt).getTime() : app.expiresAt;
		return expiryTime <= Date.now(); // Compare with current time
	};

	// Show loading state while checking auth or fetching data
	if (!isMounted || isLoading) {
		return (
			<div className="min-h-screen bg-gray-50 flex items-center justify-center">
				<div className="text-center">
					<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
					<p className="mt-4 text-gray-600">Loading profile...</p>
				</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="min-h-screen bg-gray-50 flex items-center justify-center">
				<div className="text-center">
					<div className="text-red-600 text-xl mb-4">{error}</div>
					<button
						onClick={loadUserDetails}
						className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
					>
						Retry
					</button>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-gray-50">
			<div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
				{/* Header Section */}
				<div className="bg-white rounded-lg shadow-md p-6 mb-8">
					<div className="flex justify-between items-start">
						<div>
							<h1 className="text-3xl font-bold text-gray-900 mb-2">Profile</h1>
							<p className="text-gray-600">Manage your account and connected apps</p>
						</div>
						<button
							onClick={handleLogout}
							className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg font-medium transition-colors duration-200"
						>
							Logout
						</button>
					</div>
				</div>

				{/* User Information Section */}
				<div className="bg-white rounded-lg shadow-md p-6 mb-8">
					<h2 className="text-2xl font-semibold text-gray-900 mb-4">User Information</h2>
					<div className="space-y-3">
						<div className="flex items-center">
							<span className="text-gray-600 font-medium w-24">Email:</span>
							<span className="text-gray-900">{user?.email || "Not available"}</span>
						</div>
						<div className="flex items-center">
							<span className="text-gray-600 font-medium w-24">User ID:</span>
							<span className="text-gray-500 text-sm">{user?.id || "Not available"}</span>
						</div>
					</div>
				</div>

				{/* Connected Apps Section */}
				<div className="bg-white rounded-lg shadow-md p-6">
					<h2 className="text-2xl font-semibold text-gray-900 mb-6">Connected Apps</h2>

					{!user?.userApp || user.userApp.length === 0 ? (
						<div className="text-center py-12">
							<svg
								className="mx-auto h-12 w-12 text-gray-400"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
								/>
							</svg>
							<h3 className="mt-2 text-sm font-medium text-gray-900">No connected apps</h3>
							<p className="mt-1 text-sm text-gray-500">Start by creating a workflow to connect your apps.</p>
						</div>
					) : (
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
							{user.userApp.map((app, index) => {
								// If app is in userApp array, it means it's connected
								// Check if the connection has expired
								const expired = isAppExpired(app);

								return (
									<div
										key={index}
										className="border-2 border-gray-200 rounded-lg p-4 hover:border-indigo-300 transition-colors duration-200"
									>
										<div className="flex items-center justify-between mb-2">
											<h3 className="text-lg font-semibold text-gray-900 capitalize">{app.appName}</h3>
											<div
												className={`w-3 h-3 rounded-full ${expired ? "bg-red-500" : "bg-green-500"}`}
												title={expired ? "Expired - Reconnection needed" : "Connected"}
											></div>
										</div>
										<div className="text-sm">
											<span
												className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
													expired ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"
												}`}
											>
												{expired ? "Expired" : "Connected"}
											</span>
										</div>
										{app.expiresAt && (
											<div className="mt-2 text-xs text-gray-500">
												{expired
													? "Expired"
													: `Expires: ${new Date(
															typeof app.expiresAt === "string" ? app.expiresAt : app.expiresAt
													  ).toLocaleDateString()}`}
											</div>
										)}
									</div>
								);
							})}
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
