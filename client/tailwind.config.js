export default {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#3B82F6",
        secondary: "#10B981",
        danger: "#EF4444",
        warning: "#F59E0B",
      },
      boxShadow: {
        "sm-bottom": "0 2px 8px rgba(0, 0, 0, 0.1)",
        "lg-top": "0 -2px 12px rgba(0, 0, 0, 0.1)",
      },
    },
  },
  plugins: [],
};
