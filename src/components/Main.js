import Status from "../components/Status";

export default function Main({riskVariable, updateRiskVariable}) {
    return(
        <div className="Main">
            <div id="chart" class="Visualization"></div>
            <Status riskVariable={riskVariable} updateRiskVariable={updateRiskVariable}/>
        </div>
    )
}