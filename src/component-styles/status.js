import styled from "styled-components";

export const StatusMenu = styled('div')`
    position: fixed;
    top: 5rem;
    right: 0%;
    visibility: ${props => props.isFullscreen ? "hidden" : "visible"};
    width: ${props => props.theme.viewColWidth};
    padding: ${props => props.theme.padding};
    background-color: ${props => props.theme.backgroundColor.main};
    transition: left 0.25s cubic-bezier(0.4, 0, 0.2, 1) 0ms;
`
