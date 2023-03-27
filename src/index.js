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
import { createGlobalStyle } from 'styled-components'

const theme = {
  
  color: {
    main: '#ffffff',
    secondary: '#919295',
    mainDark: '#08090b',
    focus: '#03afbf',
    borer: '#4e5155'
  },
  backgroundColor: {
    main: '#21252b',
  },
  font: {
    family: 'Plex, Verdana, Geneva, Tahoma, sans-serif',
    primaryColor: '',
    secondaryColor: '',
  },
  headerWeight: "48px",
  baseFontSize: "14px"

}

const GlobalStyles = createGlobalStyle`
  body {
    width: 100vw;
    height: 100vh;
    padding: 0;
    color: ${props =>  props.theme.color.main };
    background-color: ${props =>  props.theme.backgroundColor.main };
  }
`

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <ThemeProvider theme={theme}>
    <GlobalStyles />
    <HashRouter>
      <Routes>
        <Route path="/" element={<CirclePacking />} />
        <Route path="/Network" element={<Network />} />
      </Routes>
    </HashRouter>
  </ThemeProvider>
);

