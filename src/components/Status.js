// Libraries
import { useState } from "react";
import Draggable from 'react-draggable';

// Components
import View from "./View";
import { MenuBody, MenuHeader } from "./Menu";

// Styles
import { StatusMenu } from "../component-styles/menu";
import { LayoutGroup } from "../component-styles/query-layout";


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
            <StatusMenu className="cursor" style={{
                        height: !shouldRotate ? "10vh" : "65vh",
                        overflowY: !shouldRotate ? "hidden" : "scroll"
                    }}>
                <MenuHeader label="Legend" shouldRotate={shouldRotate} handleRotate={handleRotate}/>
                <MenuBody>
                    <LayoutGroup style={{ visibility: !shouldRotate || isFullscreen ? 'hidden' : 'visible' }}>
                        <View id={id} viewVariable={viewVariable} updateViewVariable={updateViewVariable} viewHoverValue={viewHoverValue} symbolHoverValue={symbolHoverValue} isFullscreen={isFullscreen} />
                    </LayoutGroup>
                </MenuBody>
            </StatusMenu>
        </Draggable>
    )
}
