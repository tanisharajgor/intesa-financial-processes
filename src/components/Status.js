import View from "./View";
import Control from "./Controls";
import styled from "styled-components";

const StyledStatus = styled('div')`
    position: fixed;
    top: 7rem;
    right: 2%;
    background-color: rgba(0,0,0,0.7);
    width: ${ props =>  props.theme.viewColWidth };
    padding: ${ props =>  props.theme.padding };
`

export default function Status({
    id,
    viewVariable,
    updateViewVariable,
    viewHoverValue,
    symbolHoverValue,
    controls,
    handleFullscreen
}) {

    return (
        <StyledStatus className="Status">
            <View id={id} viewVariable={viewVariable} updateViewVariable={updateViewVariable} viewHoverValue={viewHoverValue} symbolHoverValue={symbolHoverValue}/>
            <Control controls={controls} handleFullscreen={handleFullscreen}/>
        </StyledStatus>
    )
}
