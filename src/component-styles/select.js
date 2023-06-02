import { Select } from "cfd-react-components";
import styled from "styled-components";

export const StyledSelect = styled(Select)`
    // A reset of styles, including removing the default dropdown arrow
    width: 100%;
    min-width: 15ch;
    max-width: 30ch;
    border: 1px solid ${props =>  props.theme.color.secondary };
    border-radius: 0.25em;
    padding: 0.25em 0.5em;
    cursor: pointer;
    line-height: 1.1;
    background-color: transparent;
    color: ${props =>  props.theme.color.secondary };
    display: grid;
    grid-template-areas: select;

    &:after {
        content: "";
        display: block;
        width: 0.8em;
        height: 0.5em;
        background-color: ${props =>  props.theme.color.secondary };
        clip-path: polygon(100% 0%, 0 0%, 50% 100%);
        grid-area: select;
      }
`;
