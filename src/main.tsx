import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { registerSW } from 'virtual:pwa-register';

// Register service worker with auto-update
registerSW({
  immediate: true,
  onOfflineReady() {
    console.log('RestoERP is ready to work offline');
  },
});

createRoot(document.getElementById('root')!).render(<App />);

