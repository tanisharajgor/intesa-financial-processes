import styled from "styled-components";

export const ChevronButtonStyles = styled.div`
    flex: 0 0 auto;
    position: relative;
    margin-left: auto; 
    padding: 6px;
    width: 24px;
    height: 24px;
    transform:  ${props => props.shouldRotate ? "rotate(180deg)" : "rotate(0)"};
    transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1) 0ms;
    cursor: pointer;

    & > img {
        display: block;
        width: 12px;
        height: 12px;
        filter: invert(1);
    }
`;
