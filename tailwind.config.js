import defaultTheme from 'tailwindcss/defaultTheme';
import forms from '@tailwindcss/forms';

/** @type {import('tailwindcss').Config} */
export default {
    content: [
        './vendor/laravel/framework/src/Illuminate/Pagination/resources/views/*.blade.php',
        './storage/framework/views/*.php',
        './resources/views/**/*.blade.php',
        './resources/js/**/*.jsx',
    ],

    theme: {
        extend: {
            fontFamily: {
                sans: ['Cambria', 'serif', ...defaultTheme.fontFamily.serif],
            },
            colors: {
                'recents': '#73FBFD',
                'rts': '#375FA6',
                'payment': '#B00DD6',
                'engas': '#EA3680',
                'cdj': '#784315',
                'lddap': '#000000',
                'lddap-light': '#f3f4f6',
                'lddap-dark': '#1f2937',
            },
            borderColor: {
                'recents': '#73FBFD',
                'rts': '#dc2626', // red-600 for RTS
                'payment': '#B00DD6',
                'engas': '#EA3680',
                'cdj': '#784315',
                'lddap': '#000000',
            },
            animation: {
                float1: 'float1 15s ease-in-out infinite alternate',
                float2: 'float2 18s ease-in-out infinite alternate',
                float3: 'float3 20s ease-in-out infinite alternate',
                pulseGlow: 'pulseGlow 8s infinite alternate'
            },
            keyframes: {
                float1: {
                    '0%': { transform: 'translate(0, 0) scale(1)' },
                    '100%': { transform: 'translate(10%, 10%) scale(1.1)' }
                },
                float2: {
                    '0%': { transform: 'translate(0, 0) scale(1)' },
                    '100%': { transform: 'translate(-10%, -5%) scale(1.15)' }
                },
                float3: {
                    '0%': { transform: 'translate(0, 0) scale(1)', opacity: '0.3' },
                    '100%': { transform: 'translate(-5%, 10%) scale(1.05)', opacity: '0.6' }
                },
                pulseGlow: {
                    '0%': { opacity: '0.3', transform: 'translate(-50%, -50%) scale(0.9)' },
                    '100%': { opacity: '0.7', transform: 'translate(-50%, -50%) scale(1.1)' }
                }
            }
        },
    },

    plugins: [forms],
};
