// tailwind.config.js
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Pastikan struktur ini benar
        blue: {
          800: '#1e40af', // contoh warna
        }
      }
    }
  },
  plugins: [],
}