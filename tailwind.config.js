/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: '#FF6B35',
                secondary: '#F7931E',
                gabon: {
                    green: '#009639',
                    yellow: '#FCD116',
                    blue: '#3A75C4',
                },
            },
        },
    },
    plugins: [],
}
