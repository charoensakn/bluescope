import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter } from 'react-router';
import App from './App.tsx';
import { getLocale, setLocale } from './paraglide/runtime';

import '@fontsource-variable/noto-sans-mono/wght.css';
import '@fontsource-variable/noto-sans-thai-looped/wght.css';
import '@fontsource-variable/noto-sans-thai/wght.css';

import 'prosemirror-view/style/prosemirror.css';

if (window.config.getUiLocale() !== getLocale()) {
  setLocale(window.config.getUiLocale(), { reload: false });
}

const root = document.getElementById('root');
if (root) {
  createRoot(root).render(
    <StrictMode>
      <HashRouter>
        <App />
      </HashRouter>
    </StrictMode>,
  );
}
