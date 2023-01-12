import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import reportWebVitals from './reportWebVitals';
import {
  Routes,
  Route,
  HashRouter,
} from "react-router-dom";

import CirclePacking from "./pages/CirclePacking";
import TreeMap from "./pages/TreeMap";
import Network from "./pages/Network";

import "./utils/styles/styles.scss";

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <HashRouter>
    <Routes>
      <Route path="/" element={<CirclePacking />} />
        <Route path="/TreeMap" element={<TreeMap />} />
        <Route path="/Network" element={<Network />} />
    </Routes>
  </HashRouter>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
