import View from "./View";

export default function Status({id, riskVariable, updateRiskVariable, riskHoverValue, symbolHoverValue, data}) {
    
    return (
        <div className="Status">
            <View id={id} riskVariable={riskVariable} updateRiskVariable={updateRiskVariable} riskHoverValue={riskHoverValue} symbolHoverValue={symbolHoverValue} data={data}/>
        </div>
    )
}