import View from "./View";

export default function Status({id, viewVariable, updateViewVariable, viewHoverValue, symbolHoverValue}) {
    
    return (
        <div className="Status">
            <View id={id} viewVariable={viewVariable} updateViewVariable={updateViewVariable} viewHoverValue={viewHoverValue} symbolHoverValue={symbolHoverValue}/>
        </div>
    )
}