"use client";
import "./globals.css";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Link from "next/link";
import store from "./store/store";
import { Provider } from "react-redux";

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en">
			<body className="bg-slate-200 min-h-full">
				<Provider store={store}>
					<div className="flex flex-col min-h-screen gap-6 justify-center items-center">
						<Header />
						<main className="flex-grow">{children}</main>
						<Footer />
					</div>
				</Provider>
			</body>
		</html>
	);
}
