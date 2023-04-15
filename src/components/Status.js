import View from "./View";

export default function Status({id, viewVariable, updateViewVariable, riskHoverValue, symbolHoverValue, data}) {
    
    return (
        <div className="Status">
            <View id={id} viewVariable={viewVariable} updateViewVariable={updateViewVariable} riskHoverValue={riskHoverValue} symbolHoverValue={symbolHoverValue} data={data}/>
        </div>
    )
}