
function networkTooltip() {

    return(
        <div className="inner">
            <div className="layout_group inline">
                <div className="group layout_row">
                    <span className="layout_item key"></span>
                    <span className="layout_item value"></span>
                </div>
                <div className="type layout_row">
                    <span className="layout_item key">Type</span>
                    <span className="layout_item value"></span>
                </div>
                <div className="connections layout_row">
                    <span className="layout_item key">Number connections</span>
                    <span className="layout_item value"></span>
                </div>
            </div>
        </div>
    )
}

function hierarchyTooltip() {
    return(
        <div className="inner">
            <div className="layout_group inline">
                <div className="name layout_row">
                    <span className="layout_item key"></span>
                    <span className="layout_item value"></span>
                </div>
                <div className="risk layout_row">
                    <span className="layout_item key"></span>
                    <span className="layout_item value"></span>
                </div>
            </div>
        </div>
    )
}

/*Creates the inspect html dom object*/
export default function Inspect({id}) {

    return (
        <div className="Inspect">
            {id === "network-chart"?networkTooltip():<></>}
            {id !== "network-chart"?hierarchyTooltip():<></>}
        </div>
    )
}