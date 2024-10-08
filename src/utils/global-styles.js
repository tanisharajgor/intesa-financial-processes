import styled, { createGlobalStyle } from 'styled-components';
import * as Theme from './theme';
import { Select } from 'cfd-react-components';

const fontPath = `${process.env.PUBLIC_URL}/font/`;

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
    color: ${props => props.theme.color.main};
    background-color: ${props => props.theme.backgroundColor.main};
    font-family: ${props => props.theme.font.family};
    font-size: ${props => props.theme.font.baseSize};
    line-height: ${props => props.theme.font.lineHeight};
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

  .value {
    color: ${Theme.darkGreyColorHex}
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
    border: 0.15em solid ${props => props.theme.color.secondary};
    border-radius: 0.15rem;
    background-color: ${props => props.theme.backgroundColor.main};
    vertical-align: middle;
    display: grid;
  }
  
  input[type="checkbox"]::before {
    content: "";
    width: 0.9rem;
    transform: scale(1);
    transition: 120ms transform ease-in-out;
    box-shadow: inset 1rem 1rem ${props => props.theme.color.focus};
  }
  
  input[type="checkbox"]:checked::before {
    transform: scale(0);
  }

  input[type="checkbox"] + label {
    margin-left: 0.5em;
  }

  // Additions for enhanced scrolling bars.

  /* Works on Chrome, Edge, Safari. */

  *::-webkit-scrollbar {
    scrollbar-width: thin;
    width: 12px;
    scrollbar-color: ${Theme.darkGreyColorHex}; ${Theme.GlobalTheme.backgroundColor};
  }

  *::-webkit-scrollbar-track {
    background: ${Theme.GlobalTheme.backgroundColor};
  }

  *::-webkit-scrollbar-thumb {
    background-color: ${Theme.darkGreyColorHex};
    border-radius: 20px;
    border: 3px solid ${Theme.GlobalTheme.backgroundColor};
    z-index: 13;
  }

  /* Works on Firefox. */
  
  @-moz-document {
    scrollbar-width: thin;
    scrollbar-color: ${Theme.darkGreyColorHex}; ${Theme.GlobalTheme.backgroundColor};
  }
`;

export const StyledSelect = styled(Select)`
  // A reset of styles, including removing the default dropdown arrow
  width: 100%;
  min-width: 15ch;
  max-width: 30ch;
  border: 1px solid ${props => props.theme.color.secondary};
  border-radius: 0.25em;
  padding: 0.25em 0.5em;
  cursor: pointer;
  line-height: 1.1;
  background-color: transparent;
  color: ${props => props.theme.color.secondary};
  display: grid;
  grid-template-areas: select;

  &:after {
    content: "";
    display: block;
    width: 0.8em;
    height: 0.5em;
    background-color: ${props => props.theme.color.secondary};
    clip-path: polygon(100% 0%, 0 0%, 50% 100%);
    grid-area: select;
  }
`;

export const LayoutGroup = styled('div')`
  padding-top: 0%;
  padding-right: ${props =>  props.theme.padding };
  padding-bottom: ${props =>  props.theme.padding };
  padding-left: ${props =>  props.theme.padding };
  width: 100%;
  
  &.inline {
    width: 100%;
    .layout_row {
      display: block;
      .layout_item {
        display: inline;
      }
    }
  }
`;

export const LayoutRow = styled('div')`
  display: flex;
  gap: ${props =>  props.theme.padding };
  flex-direction: row;
  align-items: center;
  width: 100%;
`;

export const LayoutItem = styled('div')`
  flex: 1;
  display: inline-block;

  &.label {
    flex: 0;
    min-width: 2.5rem;
  }

  &.icon {
    flex: 0;
    min-width: 2rem;
  }
  
  &.push {
    // margin-left: 3.125rem;
  }
`;

export const FilterList = styled('ul')`
  list-style: none;
`;

export const FormattedContent = styled('div')`

  h1, h2, h3, h4, h5, h6, p {
    font-weight: 300;
    margin-bottom: 1.4rem;
    margin-top: 0;
  }

  h2 {
    padding-top: 2rem;
    color: ${props => props.theme.color.focus};
  }

  h3 {
    color: purple;
    margin-top: calc(2 * ${props => props.theme.padding}); // offset when navigating page anchors
  }

  dl, ol, ul {
    list-style: none;
    list-style-position: outside;
    margin: ${props => props.theme.padding} 0 calc(2 * ${props => props.theme.padding}) calc(2 * ${props => props.theme.padding});
    padding-left: ${props => props.theme.padding};
  }
  
  dl dl, dl ol, dl ul, ol dl, ol ol, ol ul, ul dl, ul ol, ul ul {
    font-size: 90%;
    margin: ${props => props.theme.padding} 0 ${props => props.theme.padding} calc(2 * ${props => props.theme.padding});
    background-color: pink;
  }
  
  ol {
    list-style: decimal outside;
  }
  
  ul {
    list-style: circle outside;
  }
  
  dd, dt, li {
    margin-bottom: 0;
  }

  li + li {
    margin-top: ${props => props.theme.padding};
  }


  strong {
    color: lime;
  }
  
  section {
    clear: both;
    padding-right: 1rem;
    padding-bottom: calc(3 * ${props => props.theme.padding});
  }

  figure {
    margin: calc(2 * ${props => props.theme.padding}) 0;
    width: 100%;

    img {
      max-width: 100%;
    }
  }
  figcaption {
    margin-bottom: calc(2 * ${props => props.theme.padding});
    padding-top: ${props => props.theme.padding};
    color: ${props => props.theme.color.secondary};
    font-style: italic;
  }    

  @media (min-width: 1020px) {
    margin-right: 50%;
    max-width: 510px;

    figure {
      margin: 0 0;
      padding: 0 calc(2 * ${props => props.theme.padding});
      float: right;
      margin-right: calc(-100% - 2rem);
    }
  }

`;
