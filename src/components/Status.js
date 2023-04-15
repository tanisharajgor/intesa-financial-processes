import View from "./View";

export default function Status({id, viewVariable, updateRiskVariable, riskHoverValue, symbolHoverValue, data}) {
    
    return (
        <div className="Status">
            <View id={id} viewVariable={viewVariable} updateRiskVariable={updateRiskVariable} riskHoverValue={riskHoverValue} symbolHoverValue={symbolHoverValue} data={data}/>
        </div>
    )
}