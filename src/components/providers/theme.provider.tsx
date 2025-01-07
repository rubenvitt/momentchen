import React, {createContext, useContext, useEffect, useState} from 'react';
import {ConfigProvider, theme} from 'antd';
import {PiMoon, PiSun} from 'react-icons/pi';

interface ThemeContextType {
    isDark: boolean;
    toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType>({
    isDark: false,
    toggleTheme: () => {},
});

export const useTheme = () => useContext(ThemeContext);

interface ThemeProviderProps {
    children: React.ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
    const [isDark, setIsDark] = useState(() => {
        // Präferenz aus localStorage lesen oder System-Präferenz verwenden
        const stored = localStorage.getItem('theme');
        if (stored) return stored === 'dark';
        return window.matchMedia('(prefers-color-scheme: dark)').matches;
    });

    useEffect(() => {
        // Tailwind Dark Mode Toggle
        if (isDark) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
        // Theme in localStorage speichern
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
    }, [isDark]);

    // System Theme Changes beobachten
    useEffect(() => {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const handleChange = (e: MediaQueryListEvent) => {
            setIsDark(e.matches);
        };

        mediaQuery.addEventListener('change', handleChange);
        return () => mediaQuery.removeEventListener('change', handleChange);
    }, []);

    const toggleTheme = () => setIsDark(!isDark);

    return (
        <ThemeContext.Provider value={{ isDark, toggleTheme }}>
            <ConfigProvider
                theme={{
                    algorithm: isDark ? theme.darkAlgorithm : theme.defaultAlgorithm,
                    token: {
                        colorPrimary: '#ff6816',
                    },
                }}
            >
                {children}
            </ConfigProvider>
        </ThemeContext.Provider>
    );
};

// Theme Toggle Button Komponente
export const ThemeToggle: React.FC = () => {
    const { isDark, toggleTheme } = useTheme();

    return (
        <button
            onClick={toggleTheme}
            className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors dark:text-white text-gray-800"
            aria-label="Theme umschalten"
        >
            {isDark ? <PiSun className="w-5 h-5" /> : <PiMoon className="w-5 h-5" />}
        </button>
    );
};