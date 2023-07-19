import { createGlobalStyle } from "styled-components";
import * as Theme from "../component-styles/theme";

const fontPath = `${process.env.PUBLIC_URL}/font/`

export const GlobalStyles = createGlobalStyle`

  // Imports for custom fonts
  @font-face {
    font-family: "Plex";
    src: url(${fontPath}/ibmplexsans-regular-webfont.woff2) format("woff2"),
      url(${fontPath}/ibmplexsans-regular-webfont.woff) format("woff");
    font-weight: normal;
    font-style: normal;
  }

  * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

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
    overflow: hidden;
  }

  .query-menu .description {
  }

  .Card {
    border-bottom: 1px solid ${Theme.extraDarkGreyHex};
    cursor: pointer;
  }

  .Card > div:last-child {
    padding-bottom: 0.5rem;
  }

  .Query {
    border-right: 1px solid ${Theme.extraDarkGreyHex};
  }

  #process1-select {
    width: 100%;
  }

  #Filter-Process {
    width: 100%;
  }

  input[type="checkbox"] {
    appearance: none;
    cursor: pointer;
    width: 1.15rem;
    height: 1.15rem;
    border: 0.15em solid ${props =>  props.theme.color.secondary };
    border-radius: 0.15rem;
    background-color: ${props =>  props.theme.backgroundColor.main };
    vertical-align: middle;
    display: grid;
  }
  
  input[type="checkbox"]::before {
    content: "";
    width: 0.9rem;
    transform: scale(1);
    transition: 120ms transform ease-in-out;
    box-shadow: inset 1rem 1rem ${props =>  props.theme.color.focus };
  }
  
  input[type="checkbox"]:checked::before {
    transform: scale(0);
  }

  input[type="checkbox"] + label {
    margin-left: 0.5em;
  }
`
