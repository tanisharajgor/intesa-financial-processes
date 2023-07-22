// Libraries
import { useState } from "react";
import Draggable from 'react-draggable';

// Components
import View from "./View";
import { MenuBody, MenuCollapsableHeader } from "./Menu";

// Styles
import { StatusMenu } from "../component-styles/menu";
import { LayoutGroup } from "../component-styles/query-layout";

export default function Status({
    selector,
    viewVariable,
    updateViewVariable,
    viewHoverValue,
    symbolHoverValue,
    isFullscreen
}) {
    const [shouldRotate, setRotate] = useState(true);
    const handleRotate = () => setRotate(!shouldRotate);

    return (
        <Draggable bounds="body">
            <StatusMenu isFullscreen={isFullscreen} style={{
                    maxHeight: !shouldRotate ? "10vh" : "calc(100vh - 8rem)",
                    overflowY: !shouldRotate ? "hidden" : "scroll",
                    visibility: isFullscreen ? 'hidden' : 'visible'
                }}>
                <MenuCollapsableHeader label="Legend" shouldRotate={shouldRotate} handleRotate={handleRotate}/>
                <MenuBody>
                    <LayoutGroup style={{ visibility: !shouldRotate || isFullscreen ? 'hidden' : 'visible' }}>
                        <View selector={selector} viewVariable={viewVariable} updateViewVariable={updateViewVariable} viewHoverValue={viewHoverValue} symbolHoverValue={symbolHoverValue} isFullscreen={isFullscreen} />
                    </LayoutGroup>
                </MenuBody> 
            </StatusMenu>
        </Draggable>
    )
}
