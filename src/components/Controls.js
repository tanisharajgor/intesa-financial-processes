import styled from "styled-components";

const StyledControls = styled('div')`
    width: ${props =>  props.theme.viewColWidth };
    padding: ${props =>  props.theme.padding };
`

function myFunction() {
    console.log("hi there")
}

export default function Control({controls}) {

    return (
        <StyledControls className="Controls">
            <div className="inner">
                <button onClick={() => controls.reset()}><img src={process.env.PUBLIC_URL + "/assets/crop_free.svg"}/></button>
                <button onClick={() => controls.zoomIn()}><img src={process.env.PUBLIC_URL + "/assets/zoom_in.svg"}/></button>
                <button onClick={() => controls.zoomOut()}><img src={process.env.PUBLIC_URL + "/assets/zoom_out.svg"}/></button>
            </div>
        </StyledControls>
    )
}