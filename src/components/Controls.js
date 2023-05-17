import styled from "styled-components";

const StyledControls = styled('div')`
    width: ${props =>  props.theme.viewColWidth };
    padding: ${props =>  props.theme.padding };
`

export default function Control({}) {

    return (
        <StyledControls className="Controls">
            <div className="inner">

            <img src={process.env.PUBLIC_URL + "/assets/crop_free.svg"} />
            <img src={process.env.PUBLIC_URL + "/assets/zoom_in.svg"} />
            <img src={process.env.PUBLIC_URL + "/assets/zoom_out.svg"} />

                {/* <IconButton aria-label="delete" size="medium" color="secondary" onClick={() => controls.zoomIn()}>
                    <ZoomIn />
                </IconButton>
                <IconButton aria-label="delete" size="medium" color="secondary" onClick={() => controls.zoomOut()}>
                    <ZoomOut />
                </IconButton>
                <IconButton aria-label="delete" size="medium" color="secondary" onClick={() => controls.reset()}>
                    <CropFree />
                </IconButton> */}
                </div>
        </StyledControls>
    )
}