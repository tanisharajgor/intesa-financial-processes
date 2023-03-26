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

const theme = {
  main: '#ffffff',
  secondary: '#919295',
  mainDark: '#08090b',
  colorFocus: '#03afbf',
  background: '#21252b',
  font: {
    family: 'Plex, Verdana, Geneva, Tahoma, sans-serif',
    primaryColor: '',
    secondaryColor: '',
  },
  headerWeight: "48px",
  baseFontSize: "14px"

}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <ThemeProvider theme={theme}>
    <HashRouter>
      <Routes>
        <Route path="/" element={<CirclePacking />} />
        <Route path="/Network" element={<Network />} />
      </Routes>
    </HashRouter>
  </ThemeProvider>
);

