// Libraries
import { useState } from "react";

// Components
import Ripple from "./Ripple";

// Styles
import { ChevronButton } from "../component-styles/chevron-button";


export default function Chevron() {
    const [shouldRotate, setRotate] = useState(false);

    const handleRotate = () => setRotate(!shouldRotate);

    return (
        <ChevronButton shouldRotate={shouldRotate} onClick={handleRotate}>
            <img alt="Button to zoom further into the visualization" src={process.env.PUBLIC_URL + "/assets/chevron.svg"}/>
            <Ripple color={"#FFFFFF"} duration={1000}/>
        </ChevronButton>
    )
}