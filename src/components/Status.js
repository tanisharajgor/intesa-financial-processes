import View from "./View";
import Inspect from "./Inspect";

export default function Status({id, riskVariable, updateRiskVariable, hoverValue, data}) {
    return (
        <div className="Status">
            <View id={id} riskVariable={riskVariable} updateRiskVariable={updateRiskVariable} hoverValue={hoverValue} data={data}/>
            <Inspect id={id}/>
        </div>
    )
}