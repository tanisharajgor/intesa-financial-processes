import View from "./View";

export default function Status({id, riskVariable, updateRiskVariable, hoverValue}) {
    return (
        <div className="Status">
            <View id={id} riskVariable={riskVariable} updateRiskVariable={updateRiskVariable} hoverValue={hoverValue}/>
        </div>
    )
}