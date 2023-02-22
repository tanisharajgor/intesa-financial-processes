/*Creates the inspect html dom object*/
export default function Inspect() {

    return (
        <div className="Inspect">
            <div className="inner">
                <div>Inspect</div>
                <div className="layout_group inline">
                    <div className="group layout_row">
                        <span className="layout_item key"></span>
                        <span className="layout_item value"></span>
                    </div>
                    <div className="type layout_row">
                        <span className="layout_item key">Type</span>
                        <span className="layout_item value"></span>
                    </div>
                </div>
            </div>
        </div>
    )
}