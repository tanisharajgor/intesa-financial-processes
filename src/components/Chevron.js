// Components
import Ripple from "./Ripple";

// Styles
import { ChevronButton } from "../component-styles/chevron-button";


// Component to style the Chevron Button
export function ChevronButtonStyled({shouldRotate, handleRotate}) {

    return(
        <ChevronButton shouldRotate={shouldRotate} onClick={handleRotate} style={{ paddingLeft: "2%", paddingRight: "2%" }}>
            <img alt="Button to zoom further into the visualization" src={process.env.PUBLIC_URL + "/assets/chevron.svg"} />
            <Ripple color={"#FFFFFF"} duration={1000} />
        </ChevronButton>
    )
}
