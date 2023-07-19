import { QueryMenu } from "cfd-react-components";
import styled from "styled-components";

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
    border: 2px solid #1d8693;
    background-color: #21252a;
    text-align: center; 
    cursor: grab;
    width: 18vw;
    margin: 2%;
`;

export const MenuControls = styled.div`
    display: flex;
    align-items: center;
    margin: auto;
`;