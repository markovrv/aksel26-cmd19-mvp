/** @type {import('tailwindcss').Config} */
export default {
	content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
	theme: {
		extend: {
			colors: {
				"primary-orange": "#E05A00",
				"industrial-blue": "#2E5FA3",
				"bg-main": "#F7F8FA",
				surface: "#FFFFFF",
				"text-dark": "#1A1A1A",
				"text-muted": "#666666",
			},
			fontFamily: {
				sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
			},
		},
	},
	plugins: [],
};
