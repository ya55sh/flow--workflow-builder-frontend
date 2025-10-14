import Link from "next/link";

export default function Header() {
	return (
		<header className="grid grid-cols-3 items-center w-full p-2">
			<div className="p-2 m-2">
				<Link href="/">
					<img
						src="/icons-home-96.png"
						alt="Logo"
						className="h-6 w-6 cursor-pointer opacity-50 hover:opacity-100 transition"
					/>
				</Link>
			</div>
			<Link href="/">
				<h1 className="text-stone-900 font-bold text-center text-4xl whitespace-nowrap">Welcome to Flow</h1>
			</Link>
			<div className="flex justify-end items-center p-2 row-gap-4">
				<Link href="/profile" className="p-2 mr-4">
					<img
						src="/user-profile.svg"
						alt="Profile"
						className="h-12 w-12 rounded-full border-2 border-indigo-500/50 cursor-pointer hover:opacity-100 hover:border-indigo-500/90 transition"
					/>
				</Link>
				<Link
					href="/login"
					className="p-2 mr-4 text-indigo-600 font-semibold border-2 border-transparent rounded-lg hover:no-underline hover:border-2 hover:border-indigo-500/90 hover:rounded-lg transition delay-75 "
				>
					Login
				</Link>
			</div>
		</header>
	);
}
