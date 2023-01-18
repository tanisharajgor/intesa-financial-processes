import View from "./View";

export default function Status({riskVariable, updateRiskVariable}) {
    return (
        <div className="Status">
            <View riskVariable={riskVariable} updateRiskVariable={updateRiskVariable}/>
        </div>
    )
}