// Components
import Status from "../../Status";
import Control from "../controls";

// Styles
import { StyledMain, Visualization} from "./style";

export default function Main({
    viewVariable,
    updateViewVariable,
    viewHoverValue,
    symbolHoverValue,
    id,
    controls,
    handleFullscreen,
    isFullscreen
}) {

    return(
        <StyledMain>
            <Visualization id={id} className="Visualization"></Visualization>
            <Status
                id={id}
                viewVariable={viewVariable}
                updateViewVariable={updateViewVariable}
                viewHoverValue={viewHoverValue}
                symbolHoverValue={symbolHoverValue}
                controls={controls}
                handleFullscreen={handleFullscreen}
                isFullscreen={isFullscreen}
            />
            <Control controls={controls} handleFullscreen={handleFullscreen}/>
        </StyledMain>
    )
}
