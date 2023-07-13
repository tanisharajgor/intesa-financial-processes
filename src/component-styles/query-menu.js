import { QueryMenu } from "cfd-react-components";
import styled from "styled-components";

export const Menu = styled.div`
    resize: vertical;
    overflow-y: scroll;
    height: 65vh;
    width: 22vw;
    z-index: +9;
    padding: 2%;
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
    margin-bottom: 2vh;
`;

export const CollapseButton = styled.div`
    border: 2px solid #1d8693;
    background-color: #21252a;
`;

