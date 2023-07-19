import { useState } from "react";
import Draggable from 'react-draggable';
import View from "./View";
import { StyledStatus, DragBar, StatusControls } from "../component-styles/status";
import { ChevronButtonStyled } from "./Accordion";
import { Key } from '../component-styles/key';

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
                    <DragBar>
                        <Key>Legend</Key>
                        <ChevronButtonStyled shouldRotate={shouldRotate} handleRotate={handleRotate}/>
                    </DragBar>
                </StatusControls>
                <div className="View" style={{ visibility: !shouldRotate || isFullscreen ? 'hidden' : 'visible' }}>
                    <View id={id} viewVariable={viewVariable} updateViewVariable={updateViewVariable} viewHoverValue={viewHoverValue} symbolHoverValue={symbolHoverValue} isFullscreen={isFullscreen} />
                </div>
            </StyledStatus>
        </Draggable>
    )
}
