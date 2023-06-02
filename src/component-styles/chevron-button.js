import styled from "styled-components";

export const ChevronButton = styled.div`
    position: relative;
    margin-block-start: 1.33em;
    margin-block-end: 1.33em;
    margin-inline-start: 0px;
    margin-inline-end: 0px;
    margin-left: auto; 
    margin-right: 0;
    width: fit-content;
    flex: 0 0 auto;
    width: 5%;
    transform:  ${props => props.shouldRotate ? "rotate(180deg)" : "rotate(0)"};
    transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1) 0ms;

    & > img {
        filter: invert(1);
        width: 90%;
    }
`;
