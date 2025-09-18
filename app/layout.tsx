import "./globals.css";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Link from "next/link";

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en">
			<body className="bg-slate-200 flex flex-col min-h-screen justity-center items-center">
				<Header />
				<main className="flex-grow">{children}</main>
				<Footer />
			</body>
		</html>
	);
}
