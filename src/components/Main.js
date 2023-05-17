import Status from "../components/Status";
import styled from "styled-components";

const StyledMain = styled('div')`
    position: relative;
    grid-column-start: 2;
    // display: flex;
    width: 100%;
`
const Visualization = styled('div')`
    width: 100%;
    height: 100%;
    background-color: black;
`
export default function Main({viewVariable, updateViewVariable, viewHoverValue, symbolHoverValue, id}) {

    return(
        <StyledMain>
            <Visualization id={id} className="Visualization"></Visualization>
            <Status id={id} viewVariable={viewVariable} updateViewVariable={updateViewVariable} viewHoverValue={viewHoverValue} symbolHoverValue={symbolHoverValue}/>
        </StyledMain>
    )
}
