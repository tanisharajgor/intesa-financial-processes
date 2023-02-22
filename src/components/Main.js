import Status from "../components/Status";

export default function Main({riskVariable, updateRiskVariable, hoverValue, id, data}) {

    // console.log(document.querySelector(".Main").clientWidth)

    return(
        <div className="Main">
            <div id={id} className="Visualization"></div>
            <Status id={id} riskVariable={riskVariable} updateRiskVariable={updateRiskVariable} hoverValue={hoverValue} data={data}/>
        </div>
    )
}