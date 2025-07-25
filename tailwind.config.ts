import type { Config } from "tailwindcss"

const config = {
  darkMode: ["class"],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}", "./node_modules/@tremor/**/*.{js,ts,jsx,tsx}", "*.{js,ts,jsx,tsx,mdx}"],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
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
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        // Custom sidebar colors
        "sidebar-background": "hsl(var(--sidebar-background))",
        "sidebar-foreground": "hsl(var(--sidebar-foreground))",
        "sidebar-primary": {
          DEFAULT: "hsl(var(--sidebar-primary))",
          foreground: "hsl(var(--sidebar-primary-foreground))",
        },
        "sidebar-accent": {
          DEFAULT: "hsl(var(--sidebar-accent))",
          foreground: "hsl(var(--sidebar-accent-foreground))",
        },
        "sidebar-border": "hsl(var(--sidebar-border))",
        "sidebar-ring": "hsl(var(--sidebar-ring))",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "collapsible-down": {
          from: { height: "0" },
          to: { height: "var(--radix-collapsible-content-height)" },
        },
        "collapsible-up": {
          from: { height: "var(--radix-collapsible-content-height)" },
          to: { height: "0" },
        },
        // Custom animations for flying characters
        fly1: {
          "0%": { transform: "translate(-100px, 20vh) rotate(0deg)" },
          "25%": { transform: "translate(25vw, 10vh) rotate(90deg)" },
          "50%": { transform: "translate(50vw, 30vh) rotate(180deg)" },
          "75%": { transform: "translate(75vw, 15vh) rotate(270deg)" },
          "100%": { transform: "translate(calc(100vw + 100px), 25vh) rotate(360deg)" },
        },
        fly2: {
          "0%": { transform: "translate(-100px, 60vh) rotate(0deg)" },
          "30%": { transform: "translate(30vw, 70vh) rotate(120deg)" },
          "60%": { transform: "translate(60vw, 40vh) rotate(240deg)" },
          "100%": { transform: "translate(calc(100vw + 100px), 50vh) rotate(360deg)" },
        },
        fly3: {
          "0%": { transform: "translate(-100px, 80vh) rotate(0deg)" },
          "20%": { transform: "translate(20vw, 85vh) rotate(72deg)" },
          "40%": { transform: "translate(40vw, 60vh) rotate(144deg)" },
          "60%": { transform: "translate(60vw, 75vh) rotate(216deg)" },
          "80%": { transform: "translate(80vw, 65vh) rotate(288deg)" },
          "100%": { transform: "translate(calc(100vw + 100px), 70vh) rotate(360deg)" },
        },
        float1: {
          "0%, 100%": { transform: "translate(10vw, 30vh) translateY(0px)" },
          "50%": { transform: "translate(15vw, 35vh) translateY(-20px)" },
        },
        float2: {
          "0%, 100%": { transform: "translate(80vw, 60vh) translateY(0px)" },
          "50%": { transform: "translate(85vw, 55vh) translateY(-15px)" },
        },
        float3: {
          "0%, 100%": { transform: "translate(60vw, 80vh) translateY(0px)" },
          "50%": { transform: "translate(65vw, 75vh) translateY(-25px)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "collapsible-down": "collapsible-down 0.2s ease-out",
        "collapsible-up": "collapsible-up 0.2s ease-out",
        fly1: "fly1 20s linear infinite",
        fly2: "fly2 25s linear infinite",
        fly3: "fly3 30s linear infinite",
        float1: "float1 15s ease-in-out infinite",
        float2: "float2 18s ease-in-out infinite",
        float3: "float3 22s ease-in-out infinite",
      },
      fontFamily: {
        "sf-mono": ["SF Mono", "monospace"],
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config

export default config
