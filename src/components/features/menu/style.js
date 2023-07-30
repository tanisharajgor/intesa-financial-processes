import styled from "styled-components";
import * as Theme from "../../../utils/theme";

export const QueryMenu = styled.div`
    resize: vertical;
    z-index: +9;
    position: absolute;
    top: 4rem;
    left: ${props => props.isFullscreen ? '-100vw;' : '0vw;'};
    width: 20rem;
    padding: ${props => props.theme.padding};
    background-color: ${props => props.theme.backgroundColor.main};
    transition: left 0.25s cubic-bezier(0.4, 0, 0.2, 1) 0ms;
    overflow-y: auto;
`;

export const StatusMenu = styled('div')`
    position: fixed;
    top: 5rem;
    right: ${props => props.isFullscreen ? '-100vw;' : '1rem;'};
    cursor: grab;
    background-color: rgba(0,0,0,0.6);
    width: ${props => props.theme.viewColWidth};
    padding: ${props => props.theme.padding};
    transition: right 0.25s cubic-bezier(0.4, 0, 0.2, 1) 0ms;
    border: 1px solid ${Theme.extraDarkGreyHex};
    border-radius: 5px;
    overflow-y: auto;
    z-index: +9;
`;


export const StyledMenuHeader = styled('div')`
    display: flex;
    padding: ${props => props.theme.padding};
`;

export const StyledMenuBody = styled('div')`

`;

export const StyledFilteredData = styled('p')`
    padding-top: 0; 
    padding-right: ${props => props.theme.padding};
    padding-bottom: ${props => props.theme.padding};
    padding-left: ${props => props.theme.padding};
    font-size: 14px
    text-color: ${props => props.theme.color.secondary};
`;

export const StyledFilter = styled('div')`
    display: flex;
    flex-direction: column;
`;

export const StyledLabel = styled('span')`
    color: ${Theme.labelStyles.fontColor};
    font-family: ${Theme.labelStyles.fontFamily};
    font-size: ${Theme.labelStyles.fontSize};
    margin-bottom: 5px;
    margin-left: 3px;
`;
