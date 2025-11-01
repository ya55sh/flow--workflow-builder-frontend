/** @type {import('next').NextConfig} */
const nextConfig = {
	reactStrictMode: true,
	output: "standalone",
	typescript: { ignoreBuildErrors: true },

	// Maintenance mode redirects - disabled for now
	// async redirects() {
	// 	// only redirect in production
	// 	if (process.env.NODE_ENV === "production") {
	// 		return [
	// 			{
	// 				source: "/:path*",
	// 				destination: "/maintenance.html",
	// 				permanent: false,
	// 			},
	// 		];
	// 	}

	// 	// in development: no redirect
	// 	return [];
	// },
};

export default nextConfig;
