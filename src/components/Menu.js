import { AccordionHeader } from 'cfd-react-components';
import { Key } from '../component-styles/key';
import { useState } from 'react';
import { ChevronButton } from '../component-styles/chevron-button';
import Ripple from './Ripple';
import { StyledHeader, StyledFilteredData } from '../component-styles/query-menu';


export function ChevronButtonStyled({shouldRotate, handleRotate}) {

    return(
        <ChevronButton shouldRotate={shouldRotate} onClick={handleRotate} style={{ paddingLeft: "2%", paddingRight: "2%" }}>
            <img alt="Button to zoom further into the visualization" src={process.env.PUBLIC_URL + "/assets/chevron.svg"} />
            <Ripple color={"#FFFFFF"} duration={1000} />
        </ChevronButton>
    )
}

export function MenuHeader({label, shouldRotate, handleRotate}) {
    return(
        <StyledHeader>
            <Key>{label}</Key>
            <ChevronButtonStyled shouldRotate={shouldRotate} handleRotate={handleRotate}/>
        </StyledHeader>
    )
}

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
            <ChevronButtonStyled shouldRotate={shouldRotate} handleRotate={handleRotate}/>
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
