import { AccordionHeader } from 'cfd-react-components';
import { Key } from '../component-styles/key'
import { useState } from 'react';
import { ChevronButton } from '../component-styles/chevron-button';
import Ripple from './Ripple';
import { StyledHeader, StyledFilteredData } from '../component-styles/accordion';

export function AccordionHeaderStyled({label, filteredTypes}) {

    const [shouldRotate, setRotate] = useState(false);
    const handleRotate = () => setRotate(!shouldRotate);

    return(
        <AccordionHeader
        aria-controls="activity-type-filter-content"
        id="activity-type-filter-header"
        onClick={handleRotate}
    >
        <StyledHeader>
            <Key>{filteredTypes.length <= 0 ? label : `${label}:`}</Key>
            <ChevronButton shouldRotate={shouldRotate} onClick={handleRotate}>
                <img alt="Button to zoom further into the visualization" src={process.env.PUBLIC_URL + "/assets/chevron.svg"}/>
                <Ripple color={"#FFFFFF"} duration={1000}/>
            </ChevronButton>
        </StyledHeader>
        { filteredTypes.length <= 0 ? <></> : 
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
        }
    </AccordionHeader>
    )
}
