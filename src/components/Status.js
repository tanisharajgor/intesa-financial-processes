import { useState } from "react";
import Draggable from 'react-draggable';
import View from "./View";
import styled from "styled-components";
import { ChevronButton } from '../component-styles/chevron-button';
import Ripple from '../components/Ripple.js';

const StyledStatus = styled('div')`
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
    background-color: #868688;
    text-align: center; 
    cursor: grab;
    width: 15vw;
`;

export const StatusControls = styled.div`
    display: flex;
    align-items: center;
    margin-bottom: 10px;
`;

export default function Status({
    id,
    viewVariable,
    updateViewVariable,
    viewHoverValue,
    symbolHoverValue,
    controls,
    handleFullscreen,
    isFullscreen
}) {
    const [shouldRotate, setRotate] = useState(true);
    const handleRotate = () => setRotate(!shouldRotate);

    return (
        <Draggable bounds="body" handle="strong" isFullscreen={isFullscreen}>
            <StyledStatus className="Status" isFullscreen={isFullscreen}>
                <StatusControls>
                    <strong className="cursor">
                        <DragBar>Legend</DragBar>
                    </strong>
                    <ChevronButton shouldRotate={shouldRotate} onClick={handleRotate} style={{ paddingLeft: "2%", paddingRight: "2%" }}>
                        <img alt="Button to zoom further into the visualization" src={process.env.PUBLIC_URL + "/assets/chevron.svg"} />
                        <Ripple color={"#FFFFFF"} duration={1000} />
                    </ChevronButton>
                </StatusControls>
                <div className="View" style={{ visibility: !shouldRotate || isFullscreen ? 'hidden' : 'visible' }}>
                    <View id={id} viewVariable={viewVariable} updateViewVariable={updateViewVariable} viewHoverValue={viewHoverValue} symbolHoverValue={symbolHoverValue}
                        isFullscreen={isFullscreen} />
                </div>
            </StyledStatus>
        </Draggable>
    )
}
