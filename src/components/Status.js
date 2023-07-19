import { useState } from "react";
import Draggable from 'react-draggable';
import View from "./View";
import { StyledStatus, DragBar, StatusControls } from "../component-styles/status";
import { ChevronButtonStyled } from "./Accordion";

export default function Status({
    id,
    viewVariable,
    updateViewVariable,
    viewHoverValue,
    symbolHoverValue,
    isFullscreen
}) {
    const [shouldRotate, setRotate] = useState(true);
    const handleRotate = () => setRotate(!shouldRotate);

    return (
        <Draggable bounds="body" handle="strong" isFullscreen={isFullscreen}>
            <StyledStatus className="Status" isFullscreen={isFullscreen}>
                <StatusControls>
                    <DragBar>Legend</DragBar>
                    <ChevronButtonStyled shouldRotate={shouldRotate} handleRotate={handleRotate}/>
                </StatusControls>
                <div className="View" style={{ visibility: !shouldRotate || isFullscreen ? 'hidden' : 'visible' }}>
                    <View id={id} viewVariable={viewVariable} updateViewVariable={updateViewVariable} viewHoverValue={viewHoverValue} symbolHoverValue={symbolHoverValue} isFullscreen={isFullscreen} />
                </div>
            </StyledStatus>
        </Draggable>
    )
}
