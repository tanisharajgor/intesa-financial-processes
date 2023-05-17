import View from "./View";
import styled from "styled-components";

const StyledStatus = styled('div')`
    position: fixed;
    top: 10%;
    right: 2%;
    width: ${props =>  props.theme.viewColWidth };
    padding: ${props =>  props.theme.padding };
`

export default function Status({id, viewVariable, updateViewVariable, viewHoverValue, symbolHoverValue}) {

    // if (viewVariable === undefined) {
    //     viewVariable = "riskType";
    // }

    return (
        <StyledStatus className="Status">
            <View id={id} viewVariable={viewVariable} updateViewVariable={updateViewVariable} viewHoverValue={viewHoverValue} symbolHoverValue={symbolHoverValue}/>
        </StyledStatus>
    )
}