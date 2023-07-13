import Status from "../components/Status";
import Control from "./Controls";
import styled from "styled-components";

const StyledMain = styled('div')`
    position: absolute;
    grid-column-start: 2;
    width: 100vw;
`
const Visualization = styled('div')`
    width: 100vw;
    height: 100vh;
    background-color: black;
`
export default function Main({
    viewVariable,
    updateViewVariable,
    viewHoverValue,
    symbolHoverValue,
    id,
    controls,
    handleFullscreen
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
            />
            <Control controls={controls} handleFullscreen={handleFullscreen}/>
        </StyledMain>
    )
}
