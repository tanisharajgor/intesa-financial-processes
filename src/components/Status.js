import View from "./View";

export default function Status({id, riskVariable, updateRiskVariable}) {
    return (
        <div className="Status">
            <View id={id} riskVariable={riskVariable} updateRiskVariable={updateRiskVariable}/>
        </div>
    )
}