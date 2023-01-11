import Navigation from "../components/Navigation";

export default function CirclePacking() {

    return(
        <div className="circle-packing">
            <h3>Circle packing</h3>
            <Navigation/>
            <div className="container">
                <div id="chart"></div>
                <div id="legend"></div>
            </div>
        </div>
    )
}