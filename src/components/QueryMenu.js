import Draggable from 'react-draggable';
import { ChevronButtonStyled } from "../components/Accordion";
import { Menu, MenuControls } from "../component-styles/query-menu";
import { Key } from '../component-styles/key';

import { useState } from "react";

export default function QueryMenu({children}) {

    const [shouldRotate, setRotate] = useState(false);
    const handleRotate = () => setRotate(!shouldRotate);

    return(
        <Draggable bounds="body" handle="strong">
            <Menu className="Query" id="FilterMenu" style={{
                position: 'absolute',
                padding: '1%',
                height: !shouldRotate ? "10vh" : "65vh", width: "22vw",
                overflowY: !shouldRotate ? "hidden" : "scroll"
            }}>
                <MenuControls>
                    <Key>Network</Key>
                    <ChevronButtonStyled shouldRotate={shouldRotate} handleRotate={handleRotate}/>
                </MenuControls>
                {children}
            </Menu>
        </Draggable>
    )
}
