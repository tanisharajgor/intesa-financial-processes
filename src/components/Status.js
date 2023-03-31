import View from "./View";
import styled from "styled-components";

const StyledStatus = styled('div')`
    position: fixed;
    top: 10%;
    right: 2%;
    width: ${props =>  props.theme.viewColWidth };
    padding: ${props =>  props.theme.padding };
`

export default function Status({id, riskVariable, updateRiskVariable, riskHoverValue, symbolHoverValue, data}) {
    
    return (
        <StyledStatus className="Status">
            <View id={id} riskVariable={riskVariable} updateRiskVariable={updateRiskVariable} riskHoverValue={riskHoverValue} symbolHoverValue={symbolHoverValue} data={data}/>
        </StyledStatus>
    )
}