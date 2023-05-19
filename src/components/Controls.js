import styled from "styled-components";

const StyledControls = styled('div')`
    width: ${props =>  props.theme.viewColWidth };
    padding: ${props =>  props.theme.padding };
`

const StyledControlButton = styled('button')`
    background: transparent;
    border: 1px solid transparent;
    cursor: pointer;

    &:hover {
        border-color: ${props =>  props.theme.color.secondary };
        border-radius: 15%;
    }
`

export default function Control({hideControls, controls}) {

    if (hideControls) {
        return null
    }

    return (
        <StyledControls className="Controls">
            <div className="inner">
                <StyledControlButton onClick={() => controls.reset()}>
                    <img alt="Button to reset the scale of the visualization" src={process.env.PUBLIC_URL + "/assets/crop_free.svg"}/>
                </StyledControlButton>
                <StyledControlButton onClick={() => controls.zoomIn()}>
                    <img alt="Button to zoom further into the visualization" src={process.env.PUBLIC_URL + "/assets/zoom_in.svg"}/>
                </StyledControlButton>
                <StyledControlButton onClick={() => controls.zoomOut()}>
                    <img alt="Button to zoom out of the visualization" src={process.env.PUBLIC_URL + "/assets/zoom_out.svg"}/>
                </StyledControlButton>
            </div>
        </StyledControls>
    )
}