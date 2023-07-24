// Libraries
import { useState } from 'react';

// Components
import Description from "../../widgets/description";
import { ChevronButtonStyled } from '../../widgets/chevron';

// Styles
import { AccordionHeader } from 'cfd-react-components';
import { Key } from '../../../component-styles/key';
import { StyledMenuHeader, StyledMenuBody, StyledFilteredData } from '../../../component-styles/menu';

// Component to style the Menu Header
export function MenuCollapsableHeader({label, shouldRotate, handleRotate, filteredTypes=[]}) {
    return(
        <StyledMenuHeader>
            <Key>{filteredTypes.length <= 0 ? label : `${label}:`}</Key>
            <ChevronButtonStyled shouldRotate={shouldRotate} handleRotate={handleRotate}/>
        </StyledMenuHeader>
    )
}

export function MenuHeader({label, filteredTypes=[]}) {
    return(
        <StyledMenuHeader>
            <Key>{filteredTypes.length <= 0 ? label : `${label}:`}</Key>
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
        <MenuCollapsableHeader label={label} shouldRotate={shouldRotate} handleRotate={handleRotate} filteredTypes={filteredTypes}/>
        <TypesStatus filteredTypes={filteredTypes}/>
    </AccordionHeader>
    )
}
