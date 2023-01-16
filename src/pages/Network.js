import Navigation from "../components/Navigation";
import { StylesProvider } from "@material-ui/core/styles";

export default function Network() {
    return(
        <StylesProvider injectFirst>
            <div className="Content">
                <Navigation/>
                <div className="Query" id="FilterMenu"></div>
            </div>
        </StylesProvider>
    )
}