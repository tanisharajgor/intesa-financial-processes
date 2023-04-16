import Status from "../components/Status";

export default function Main({viewVariable, updateViewVariable, viewHoverValue, symbolHoverValue, id}) {

    // console.log(document.querySelector(".Main").clientWidth)

    return(
        <div className="Main">
            <div id={id} className="Visualization"></div>
            <Status id={id} viewVariable={viewVariable} updateViewVariable={updateViewVariable} viewHoverValue={viewHoverValue} symbolHoverValue={symbolHoverValue}/>
        </div>
    )
}