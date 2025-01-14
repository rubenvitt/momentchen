import React, {createContext, useContext, useEffect, useState} from 'react';
import {ConfigProvider, theme} from 'antd';
import {PiDeviceMobile, PiMoon, PiSun} from 'react-icons/pi';

interface ThemeContextType {
    isDark: boolean;
    syncWithSystem: boolean;
    toggleTheme: () => void;
    toggleSyncWithSystem: () => void;
}

const ThemeContext = createContext<ThemeContextType>({
    isDark: false,
    syncWithSystem: true,
    toggleTheme: () => {},
    toggleSyncWithSystem: () => {},
});

export const useTheme = () => useContext(ThemeContext);

interface ThemeProviderProps {
    children: React.ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({children}) => {
    const [isDark, setIsDark] = useState(() => {
        // Präferenz aus localStorage lesen oder System-Präferenz verwenden
        const stored = localStorage.getItem('theme');
        if (stored) return stored === 'dark';
        return window.matchMedia('(prefers-color-scheme: dark)').matches;
    });

    const [syncWithSystem, setSyncWithSystem] = useState(() => {
        const stored = localStorage.getItem('syncWithSystem');
        return stored === null ? true : stored === 'true';
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

    useEffect(() => {
        // Synchronisationseinstellung in localStorage speichern
        localStorage.setItem('syncWithSystem', syncWithSystem.toString());
    }, [syncWithSystem]);

    // System Theme Changes beobachten
    useEffect(() => {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const handleChange = (e: MediaQueryListEvent) => {
            if (syncWithSystem) setIsDark(e.matches);
        };

        mediaQuery.addEventListener('change', handleChange);
        return () => mediaQuery.removeEventListener('change', handleChange);
    }, [syncWithSystem]);

    // Toggle Funktionen
    const toggleTheme = () => {
        setIsDark(prev => !prev);
    };

    const toggleSyncWithSystem = () => {
        setSyncWithSystem(prev => !prev);
    };

    return (
        <ThemeContext.Provider value={{isDark, syncWithSystem, toggleTheme, toggleSyncWithSystem}}>
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

export const ThemeToggle: React.FC = () => {
    const {isDark, syncWithSystem, toggleTheme, toggleSyncWithSystem} = useTheme();

    const cycleMode = () => {
        if (syncWithSystem) {
            toggleSyncWithSystem();
            toggleTheme();
        } else if (isDark) {
            toggleTheme();
        } else {
            toggleSyncWithSystem();
        }
    };

    const getIcon = () => {
        if (syncWithSystem) return <PiDeviceMobile className="w-5 h-5" />;
        return isDark ? <PiMoon className="w-5 h-5"/> : <PiSun className="w-5 h-5"/>;
    };

    return (
        <button
            onClick={cycleMode}
            className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors dark:text-white text-gray-800"
            aria-label="Theme Modus wechseln"
        >
            {getIcon()}
        </button>
    );
};