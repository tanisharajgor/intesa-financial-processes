import Status from "../components/Status";

export default function Main({viewVariable, updateRiskVariable, riskHoverValue, symbolHoverValue, id, data}) {

    // console.log(document.querySelector(".Main").clientWidth)

    return(
        <div className="Main">
            <div id={id} className="Visualization"></div>
            <Status id={id} viewVariable={viewVariable} updateRiskVariable={updateRiskVariable} riskHoverValue={riskHoverValue} symbolHoverValue={symbolHoverValue} data={data}/>
        </div>
    )
}