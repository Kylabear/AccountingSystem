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
            },
            borderColor: {
                'recents': '#73FBFD',
                'rts': '#dc2626', // red-600 for RTS
                'payment': '#B00DD6',
                'engas': '#EA3680',
                'cdj': '#784315',
                'lddap': '#000000',
            },
        },
    },

    plugins: [forms],
};
