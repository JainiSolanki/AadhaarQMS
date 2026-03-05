import { Sun, Moon } from 'lucide-react';
import { motion } from 'framer-motion';
import useThemeStore from '@store/themeStore';

const ThemeToggle = ({ size = 18 }) => {
    const { theme, toggleTheme } = useThemeStore();

    return (
        <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={toggleTheme}
            className="p-2 transition-colors cursor-pointer"
            style={{
                borderRadius: 'var(--radius-md)',
                color: 'var(--text-secondary)',
            }}
            title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
        >
            <motion.div
                initial={false}
                animate={{ rotate: theme === 'dark' ? 0 : 180 }}
                transition={{ duration: 0.3 }}
            >
                {theme === 'dark' ? <Sun size={size} /> : <Moon size={size} />}
            </motion.div>
        </motion.button>
    );
};

export default ThemeToggle;
