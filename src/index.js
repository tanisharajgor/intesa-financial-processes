// React dependencies
import React from 'react';
import ReactDOM from 'react-dom/client';
import {
  Routes,
  Route,
  HashRouter,
} from "react-router-dom";

// Pages
import CirclePacking from "./pages/CirclePacking";
import Network from "./pages/Network";

// Styles
import { ThemeProvider } from 'styled-components';
import { GlobalStyles } from './utils/global-styles';
import { GlobalTheme } from './utils/theme';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <ThemeProvider theme={GlobalTheme}>
    <GlobalStyles />
    <HashRouter>
      <Routes>
        <Route path="/" element={<CirclePacking />} />
        <Route path="/Network" element={<Network />} />
      </Routes>
    </HashRouter>
  </ThemeProvider>
);

