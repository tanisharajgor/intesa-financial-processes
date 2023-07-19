import styled from "styled-components";

export const StyledStatus = styled('div')`
    position: fixed;
    top: 7rem;
    right: 2%;
    visibility: ${props => props.isFullscreen ? "hidden" : "visible"};
    background-color: rgba(0,0,0,0.7);
    width: ${props => props.theme.viewColWidth};
    padding: ${props => props.theme.padding};
    padding-top: 1%;
`

export const DragBar = styled.div`
    background-color: ${props =>  props.theme.backgroundColor.main };
    cursor: grab;
    width: 15vw;
    padding: ${props => props.theme.padding};
    display: flex;
`;

export const StatusControls = styled.div`
    display: flex;
    align-items: center;
    margin-bottom: 10px;
`;
