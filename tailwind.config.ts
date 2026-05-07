import type { Config } from "tailwindcss";

export default {
	// v3.4+: "class" uses legacy `&:is(.dark *)` and breaks many `dark:` utilities.
	// "selector" uses `&:where(.dark, .dark *)` — works with next-themes `class` on <html>.
	darkMode: ["selector", ".dark"],
	content: [
		"./pages/**/*.{js,ts,jsx,tsx,mdx}",
		"./components/**/*.{js,ts,jsx,tsx,mdx}",
		"./app/**/*.{js,ts,jsx,tsx,mdx}",
		"./src/**/*.{js,ts,jsx,tsx,mdx}",
	],
	theme: {
		extend: {
			/** Each step is default Tailwind size + 2px (16px root → rem). */
			fontSize: {
				xs: ["0.875rem", { lineHeight: "1.125rem" }],
				sm: ["1rem", { lineHeight: "1.375rem" }],
				base: ["1.125rem", { lineHeight: "1.625rem" }],
				lg: ["1.25rem", { lineHeight: "1.875rem" }],
				xl: ["1.375rem", { lineHeight: "1.875rem" }],
				"2xl": ["1.625rem", { lineHeight: "2.125rem" }],
				"3xl": ["2rem", { lineHeight: "2.375rem" }],
				"4xl": ["2.375rem", { lineHeight: "2.625rem" }],
				"5xl": ["3.125rem", { lineHeight: "1" }],
				"6xl": ["3.875rem", { lineHeight: "1" }],
				"7xl": ["4.625rem", { lineHeight: "1" }],
				"8xl": ["6.125rem", { lineHeight: "1" }],
				"9xl": ["8.125rem", { lineHeight: "1" }],
			},
			fontFamily: {
				comfortaa: ["var(--font-comfortaa)"], // Add this line
				nunito: ["var(--font-nunito)"], // Add this line
				quicksand: ["var(--font-quicksand)"], // Add this line
			},
			colors: {
				background: "hsl(var(--background))",
				foreground: "hsl(var(--foreground))",
				card: {
					DEFAULT: "hsl(var(--card))",
					foreground: "hsl(var(--card-foreground))",
				},
				popover: {
					DEFAULT: "hsl(var(--popover))",
					foreground: "hsl(var(--popover-foreground))",
				},
				primary: {
					DEFAULT: "hsl(var(--primary))",
					foreground: "hsl(var(--primary-foreground))",
				},
				secondary: {
					DEFAULT: "hsl(var(--secondary))",
					foreground: "hsl(var(--secondary-foreground))",
				},
				muted: {
					DEFAULT: "hsl(var(--muted))",
					foreground: "hsl(var(--muted-foreground))",
				},
				accent: {
					DEFAULT: "hsl(var(--accent))",
					foreground: "hsl(var(--accent-foreground))",
				},
				destructive: {
					DEFAULT: "hsl(var(--destructive))",
					foreground: "hsl(var(--destructive-foreground))",
				},
				border: "hsl(var(--border))",
				"nav-chrome": "hsl(var(--nav-chrome))",
				"nav-chrome-border": "hsl(var(--nav-chrome-border))",
				input: "hsl(var(--input))",
				ring: "hsl(var(--ring))",
				chart: {
					"1": "hsl(var(--chart-1))",
					"2": "hsl(var(--chart-2))",
					"3": "hsl(var(--chart-3))",
					"4": "hsl(var(--chart-4))",
					"5": "hsl(var(--chart-5))",
				},
			},
			borderRadius: {
				lg: "var(--radius)",
				md: "calc(var(--radius) - 2px)",
				sm: "calc(var(--radius) - 4px)",
			},
		},
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
