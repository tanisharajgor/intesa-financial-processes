import Main from "../components/Main";
import Navigation from "../components/Navigation";
import { StylesProvider } from "@material-ui/core/styles";
import { useState } from "react";

const id = "circle-packing-chart";

export default function Network() {

    const [riskVariable, updateRiskVariable] = useState("controlTypeMode");

    return(
        <StylesProvider injectFirst>
            <div className="Content">
                <Navigation/>
                <div className="Query" id="FilterMenu"></div>
                <Main riskVariable={riskVariable} updateRiskVariable={updateRiskVariable} id={id}/>                
            </div>
        </StylesProvider>
    )
}