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
import { createTheme, ThemeProvider } from '@material-ui/core';
import "./utils/styles/styles.scss";

const theme = createTheme({
  typography: {
    fontFamily: "Plex, Verdana, Geneva, Tahoma, sans-serif",
    fontSize: 12
  },
  palette: {
    type: "dark",
    background: {
      paper: "#21252b"
    },
    primary: {
      main: "#03afbf"
    },
    secondary: {
      main: "#919295"
    }
  },
  overrides: {
    MuiPaper: {
      root: {
        elevation: 0,
        square: true,
        padding: 0,
        marginBottom: 0
      },
    }
  },
  shape: {
    borderRadius: 0
  }
});

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

