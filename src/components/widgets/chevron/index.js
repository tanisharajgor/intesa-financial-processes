// Components
import Ripple from "../../features/ripple";

// Styles
import { ChevronButtonStyles } from "./style";


// Component to style the Chevron Button
export function ChevronButton({shouldRotate, handleRotate}) {

    return(
        <ChevronButtonStyles shouldRotate={shouldRotate} onClick={handleRotate} style={{ paddingLeft: "2%", paddingRight: "2%" }}>
            <img alt="Button to zoom further into the visualization" src={process.env.PUBLIC_URL + "/assets/chevron.svg"} />
            <Ripple color={"#FFFFFF"} duration={1000} />
        </ChevronButtonStyles>
    )
}
