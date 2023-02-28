/*Creates the inspect html dom object*/
export default function Inspect({id}) {

    return (
        <div className="Inspect">
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
        </div>
    )
}