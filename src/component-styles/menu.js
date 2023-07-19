import styled from "styled-components";
import * as Theme from "../component-styles/theme";

export const QueryMenu = styled.div`
    resize: vertical;
    z-index: +9;
    position: absolute;
    top: 4rem;
    left: ${props => props.isFullscreen ? "-30vw;" : "0vw;"};
    width: 20rem;
    padding: ${props => props.theme.padding};
    background-color: ${props => props.theme.backgroundColor.main};
    transition: left 0.25s cubic-bezier(0.4, 0, 0.2, 1) 0ms;
`;

export const StatusMenu = styled('div')`
    position: fixed;
    top: 4rem;
    right: 0%;
    cursor: grab;
    visibility: ${props => props.isFullscreen ? "hidden" : "visible"};
    width: ${props => props.theme.viewColWidth};
    padding: ${props => props.theme.padding};
    background-color: ${props => props.theme.backgroundColor.main};
    transition: left 0.25s cubic-bezier(0.4, 0, 0.2, 1) 0ms;
`

export const StyledMenuHeader = styled('div')`
    display: flex;
    padding: ${props => props.theme.padding };
`

export const StyledMenuBody = styled('div')`

`

export const StyledFilteredData = styled('p')`
    padding-top: 0; 
    padding-right: ${props => props.theme.padding };
    padding-bottom: ${props => props.theme.padding };
    padding-left: ${props =>  props.theme.padding };
    font-size: 14px
    text-color: ${props => props.theme.color.secondary};
`

export const StyledFilter = styled('div')`
    display: flex;
    flex-direction: column;
`

export const StyledLabel = styled('span')`
    color: ${Theme.labelStyles.fontColor};
    font-family: ${Theme.labelStyles.fontFamily};
    font-size: ${Theme.labelStyles.fontSize};
    margin-bottom: 5px;
    margin-left: 3px;
`
