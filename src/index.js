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
    family: 'Geneva, Plex, Verdana, Tahoma, sans-serif',
    heading: '',
    subHeading: '',
    baseSize: '14px',
    lineHeight: '1.4rem',
  },
  headerWeight: "48px",
  padding: '0.625rem',
  viewColWidth: '16rem'

}

const GlobalStyles = createGlobalStyle`
  body {
    width: 100vw;
    height: 100vh;
    padding: 0;
    color: ${props =>  props.theme.color.main };
    background-color: ${props =>  props.theme.backgroundColor.main };
    font-family: ${props =>  props.theme.font.family };
    font-size: ${props =>  props.theme.font.baseSize };
    line-height: ${props =>  props.theme.font.lineHeight };
    margin: 0px;
  }

  .Card {
    border-bottom: 1px solid #4e5155;
    Cursor: pointer;
  }

  .Query {
    border-right: 1px solid #4e5155;
    padding-left: 8px;
    padding-right: 8px;
  }

  #process1-select {
    width: 100%;
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

