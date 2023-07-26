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
import Help from "./pages/Help";

// Styles
import { ThemeProvider } from 'styled-components';
import { GlobalStyles } from './component-styles/global-styles';
import { GlobalTheme } from './component-styles/theme';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <ThemeProvider theme={GlobalTheme}>
    <GlobalStyles />
    <HashRouter>
      <Routes>
        <Route path="/" element={<CirclePacking />} />
        <Route path="/Network" element={<Network />} />
        <Route path="/Help" element={<Help />} />
      </Routes>
    </HashRouter>
  </ThemeProvider>
);

