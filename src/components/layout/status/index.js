// Libraries
import { useState } from "react";
import Draggable from 'react-draggable';

// Components
import { View, MenuBody, MenuCollapsableHeader } from "../../features/index";

// Styles
import { StatusMenu } from "../../features/menu/style";
import { LayoutGroup } from "../queryMenu/style";

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
        <Draggable bounds="body">
            <StatusMenu isFullscreen={isFullscreen} style={{
                    maxHeight: !shouldRotate ? "10vh" : "calc(100vh - 8rem)",
                    overflowY: !shouldRotate ? "hidden" : "scroll",
                    visibility: isFullscreen ? 'hidden' : 'visible'
                }}>
                <MenuCollapsableHeader label="Legend" shouldRotate={shouldRotate} handleRotate={handleRotate}/>
                <MenuBody>
                    <LayoutGroup style={{ visibility: !shouldRotate || isFullscreen ? 'hidden' : 'visible' }}>
                        <View id={id} viewVariable={viewVariable} updateViewVariable={updateViewVariable} viewHoverValue={viewHoverValue} symbolHoverValue={symbolHoverValue} isFullscreen={isFullscreen} />
                    </LayoutGroup>
                </MenuBody> 
            </StatusMenu>
        </Draggable>
    )
}
