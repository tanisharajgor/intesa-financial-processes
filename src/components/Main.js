import Status from "../components/Status";

export default function Main({riskVariable, updateRiskVariable, id}) {
    return(
        <div className="Main">
            <div id={id} className="Visualization"></div>
            <Status id={id} riskVariable={riskVariable} updateRiskVariable={updateRiskVariable}/>
        </div>
    )
}