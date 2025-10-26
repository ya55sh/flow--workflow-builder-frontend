"use client";
import "./globals.css";
import Header from "./components/Header";
import Footer from "./components/Footer";
import store from "./store/store";
import { Provider } from "react-redux";

/**
 * Root Layout Component
 * Main layout wrapper for the entire Next.js application
 *
 * Features:
 * - Wraps entire app with Redux Provider for state management
 * - Consistent Header and Footer across all pages
 * - Flex layout with centered content
 * - Global styles imported from globals.css
 *
 * Structure:
 * - Header (navigation)
 * - Main content area (children - page content)
 * - Footer (copyright)
 */
export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en">
			<body className="bg-slate-200 min-h-full">
				{/* Redux Provider wraps entire app for global state access */}
				<Provider store={store}>
					<div className="flex flex-col min-h-screen gap-6 justify-center items-center">
						<Header />
						{/* Main content area where page components render */}
						<main className="flex-grow max-w-6xl min-w-5xl">{children}</main>
						<Footer />
					</div>
				</Provider>
			</body>
		</html>
	);
}
