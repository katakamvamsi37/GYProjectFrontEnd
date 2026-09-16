import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import AppRouter from './routes/AppRouter';
import { ThemeProvider } from './context/ThemeContext';
import '@fontsource-variable/inter/wght.css';
import './styles.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ThemeProvider>
      <AppRouter />
    </ThemeProvider>
  </StrictMode>,
);
