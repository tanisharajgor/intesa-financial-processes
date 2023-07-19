import { useState } from "react";
import Draggable from 'react-draggable';
import View from "./View";
import { StatusMenu } from "../component-styles/status";
import { MenuHeader } from "./Menu";
import { Menu } from "../component-styles/query-menu";

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
            <StatusMenu className="Query" id="FilterMenu" style={{
                        position: 'absolute',
                        padding: '1%',
                        height: !shouldRotate ? "10vh" : "65vh", width: "22vw",
                        overflowY: !shouldRotate ? "hidden" : "scroll"
                    }}>
                <MenuHeader label="Legend" shouldRotate={shouldRotate} handleRotate={handleRotate}/>
                <div className="View" style={{ visibility: !shouldRotate || isFullscreen ? 'hidden' : 'visible' }}>
                    <View id={id} viewVariable={viewVariable} updateViewVariable={updateViewVariable} viewHoverValue={viewHoverValue} symbolHoverValue={symbolHoverValue} isFullscreen={isFullscreen} />
                </div>
            </StatusMenu>
        </Draggable>
    )
}
