import { QueryMenu } from "cfd-react-components";
import styled from "styled-components";

export const Menu = styled(QueryMenu)`
    height: 100vh;
    z-index: +9;
    position: absolute;
    left: ${props => props.isFullscreen ? "-30vw;" : "0vw;"};
    top: 10vh;
    transition: left 0.25s cubic-bezier(0.4, 0, 0.2, 1) 0ms;
    background-color: ${props =>  props.theme.backgroundColor.main };
`;
