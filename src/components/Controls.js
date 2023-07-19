//Components
import Ripple from "./Ripple";

//Styles
import styled from "styled-components";

export const StyledControlsPanel = styled.div`
    position: absolute;
    bottom: 0.5rem;
    right: 0.5rem; 
    .inner {
        display: flex;
    }
`

const StyledControlButton = styled('button')`
    background: transparent;
    border: 1px solid transparent;
    cursor: pointer;
    position: relative;

    &:hover {
        border-color: ${props =>  props.theme.color.secondary };
        border-radius: 15%;
    }
`

const FullscreenIcon = styled('img')`
    padding: 4px;
`

const FullscreenButton = styled(StyledControlButton)`
    width: 22px;
`

export default function Control({handleFullscreen, controls}) {
    return (
        <StyledControlsPanel>
            <div className="inner">
                <StyledControlButton onClick={() => controls.reset()}>
                    <img alt="Button to reset the scale of the visualization" src={process.env.PUBLIC_URL + "/assets/crop_free.svg"}/>
                    <Ripple color={"#FFFFFF"} duration={1000}/>
                </StyledControlButton>
                <StyledControlButton onClick={() => controls.zoomIn()}>
                    <img alt="Button to zoom further into the visualization" src={process.env.PUBLIC_URL + "/assets/zoom_in.svg"}/>
                    <Ripple color={"#FFFFFF"} duration={1000}/>
                </StyledControlButton>
                <StyledControlButton onClick={() => controls.zoomOut()}>
                    <img alt="Button to zoom out of the visualization" src={process.env.PUBLIC_URL + "/assets/zoom_out.svg"}/>
                    <Ripple color={"#FFFFFF"} duration={1000}/>
                </StyledControlButton>
                <FullscreenButton onClick={handleFullscreen}>
                    <FullscreenIcon alt="Button to make the visualization take up the screen"
                        src={process.env.PUBLIC_URL + "/assets/fullscreen.svg"}
                    />
                    <Ripple color={"#FFFFFF"} duration={1000}/>
                </FullscreenButton>
            </div>
        </StyledControlsPanel>
    )
}