import { createGlobalStyle } from "styled-components";
import styled from 'styled-components';

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
    transform: translateY(-0.075rem);
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
`

export const StyledFilteredData = styled('p')`
    text-color: ${props => props.theme.color.secondary};
    opacity: 75%;
    margin-bottom: 0.5rem;
    font-size: 12px;
`

export const StyledFilter = styled('div')`
    display: flex;
    flex-direction: column;
`

export const StyledHeader = styled('div')`
    display: flex;
`
