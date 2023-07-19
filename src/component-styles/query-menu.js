import { QueryMenu } from "cfd-react-components";
import styled from "styled-components";
import * as Theme from "../component-styles/theme";

export const Menu = styled.div`
    resize: vertical;
    z-index: +9;
    position: absolute;
    top: 15vh;
    left: ${props => props.isFullscreen ? "-30vw;" : "0vw;"};
    transition: left 0.25s cubic-bezier(0.4, 0, 0.2, 1) 0ms;
    background-color: ${props => props.theme.backgroundColor.main};
`;

export const DragBar = styled.div`
    background-color: #21252a;
    cursor: grab;
    width: 18vw;
    margin: 2%;
`;

export const MenuControls = styled.div`
    display: flex;
    align-items: center;
    margin: auto;
`;

export const StyledFilteredData = styled('p')`
    padding-top: 0; 
    padding-right: ${props =>  props.theme.padding };
    padding-bottom: ${props =>  props.theme.padding };
    padding-left: ${props =>  props.theme.padding };
    font-size: 14px;
    text-color: ${props => props.theme.color.secondary};
`

export const StyledFilter = styled('div')`
    display: flex;
    flex-direction: column;
`

export const StyledHeader = styled('div')`
    display: flex;
    padding: ${props =>  props.theme.padding };
`

export const StyledLabel = styled('span')`
    color: ${Theme.labelStyles.fontColor};
    font-family: ${Theme.labelStyles.fontFamily};
    font-size: ${Theme.labelStyles.fontSize};
    margin-bottom: 5px;
    margin-left: 3px;
`
