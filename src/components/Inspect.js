
function networkTooltipSummary() {

    return(
        <div className="inner">
            <div className="layout_group inline">
                <div className="nActors layout_row">
                    <span className="layout_item key">Number of actors</span>
                    <span className="layout_item value"></span>
                </div>
                <div className="nActivities layout_row">
                    <span className="layout_item key">Number of activities</span>
                    <span className="layout_item value"></span>
                </div>
            </div>
        </div>
    )
}

function networkTooltipDetail() {

    return(
        <div className="inner">
            <div className="layout_group inline">
                <div className="value1 layout_row">
                    <span className="layout_item key"></span>
                    <span className="layout_item value"></span>
                </div>
                <div className="value2 layout_row">
                    <span className="layout_item key"></span>
                    <span className="layout_item value"></span>
                </div>
                <div className="value3 layout_row">
                    <span className="layout_item key"></span>
                    <span className="layout_item value"></span>
                </div>
            </div>
        </div>
    )
}

function hierarchyTooltipSummary() {
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

function hierarchyTooltipDetail() {
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
            {id === "network-chart"? networkTooltipDetail():hierarchyTooltipDetail()}
        </div>
    )
}