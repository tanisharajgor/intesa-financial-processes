// Libraries
import { useState } from 'react';

// Components
import Description from "./Description";
import Ripple from './Ripple';

// Styles
import { AccordionHeader } from 'cfd-react-components';
import { Key } from '../component-styles/key';
import { ChevronButton } from '../component-styles/chevron-button';
import { StyledMenuHeader, StyledMenuBody, StyledFilteredData } from '../component-styles/menu';

// Component to style the Chevron Button
export function ChevronButtonStyled({shouldRotate, handleRotate}) {

    return(
        <ChevronButton shouldRotate={shouldRotate} onClick={handleRotate} style={{ paddingLeft: "2%", paddingRight: "2%" }}>
            <img alt="Button to zoom further into the visualization" src={process.env.PUBLIC_URL + "/assets/chevron.svg"} />
            <Ripple color={"#FFFFFF"} duration={1000} />
        </ChevronButton>
    )
}

// Component to style the Menu Header
export function MenuHeader({label, shouldRotate, handleRotate, filteredTypes=[]}) {
    return(
        <StyledMenuHeader>
            <Key>{filteredTypes.length <= 0 ? label : `${label}:`}</Key>
            <ChevronButtonStyled shouldRotate={shouldRotate} handleRotate={handleRotate}/>
        </StyledMenuHeader>
    )
}

// Component to style Menu Body
export function MenuBody({shouldRotate, pageDescription, children}) {

    return(
        <StyledMenuBody style={{ visibility: !shouldRotate ? 'hidden' : 'visible' }}>
            <Description>
                <p>{pageDescription}</p>
            </Description>
           {children}
        </StyledMenuBody>
    )
}

// Returns a status for each selected type
function TypesStatus({filteredTypes}) {
    return(
        filteredTypes.length <= 0 ? <></> : 
        <StyledFilteredData>
            {
                filteredTypes.map((type, i, arr) => {
                    let str = type;
                    if (i < arr.length - 1) {
                        str += ', '
                    }
                    return (
                        <span key={`descr-${str}`}>{str}</span>
                    )
                }) 
            }
        </StyledFilteredData>
    )
}

// Component to style the Accordian Header
export function AccordionHeaderStyled({label, filteredTypes=[]}) {

    const [shouldRotate, setRotate] = useState(false);
    const handleRotate = () => setRotate(!shouldRotate);

    return(
        <AccordionHeader
        aria-controls="activity-type-filter-content"
        id="activity-type-filter-header"
        onClick={handleRotate}
    >
        <MenuHeader label={label} shouldRotate={shouldRotate} handleRotate={handleRotate} filteredTypes={filteredTypes}/>
        <TypesStatus filteredTypes={filteredTypes}/>
    </AccordionHeader>
    )
}
