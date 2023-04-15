import View from "./View";

export default function Status({id, viewVariable, updateViewVariable, viewHoverValue, symbolHoverValue, data}) {
    
    return (
        <div className="Status">
            <View id={id} viewVariable={viewVariable} updateViewVariable={updateViewVariable} viewHoverValue={viewHoverValue} symbolHoverValue={symbolHoverValue} data={data}/>
        </div>
    )
}