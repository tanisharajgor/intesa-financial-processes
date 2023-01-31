import Status from "../components/Status";

export default function Main({riskVariable, updateRiskVariable, id}) {

    // console.log(document.querySelector(".Main").clientWidth)

    return(
        <div className="Main">
            <div id={id} className="Visualization"></div>
            <Status id={id} riskVariable={riskVariable} updateRiskVariable={updateRiskVariable}/>
        </div>
    )
}