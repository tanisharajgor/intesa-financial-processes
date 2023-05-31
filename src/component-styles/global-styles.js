import { createGlobalStyle } from "styled-components";

export const GlobalStyles = createGlobalStyle`
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

  #Filter-Process {
    width: 100%;
  }

  input[type="checkbox"] {
    appearance: none;
    cursor: pointer;
    margin: 0;
    width: 1.15rem;
    height: 1.15rem;
    border: 0.15em solid ${props =>  props.theme.color.secondary };
    border-radius: 0.15rem;
    transform: translateY(-0.075rem);
    background-color: ${props =>  props.theme.backgroundColor.main };
    margin-right: 0.5rem;
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