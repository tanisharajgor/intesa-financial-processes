import View from "./View";
import Inspect from "./Inspect";

export default function Status({id, riskVariable, updateRiskVariable, riskHoverValue, symbolHoverValue, data}) {
    
    return (
        <div className="Status">
            <View id={id} riskVariable={riskVariable} updateRiskVariable={updateRiskVariable} riskHoverValue={riskHoverValue} symbolHoverValue={symbolHoverValue} data={data}/>
            <Inspect id={id}/>
        </div>
    )
}