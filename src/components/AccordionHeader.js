import { AccordionHeader } from 'cfd-react-components';
import { ChevronButton } from '../component-styles/chevron-button';
import Ripple from './Ripple';
import { Key } from '../component-styles/key';
import { StyledHeader, StyledFilteredData } from "../component-styles/accordion";
import { useState } from 'react';

export default function AccordionHeaderStyled({title, status = []}) {

    const [shouldRotate, setRotate] = useState(false);
    const handleRotate = () => setRotate(!shouldRotate);

    return(
        <AccordionHeader
        aria-controls="activity-type-filter-content"
        id="activity-type-filter-header"
        onClick={handleRotate}
        >
            <StyledHeader>
                <Key>{title}</Key>
                <ChevronButton shouldRotate={shouldRotate} onClick={handleRotate}>
                    <img alt="Button to zoom further into the visualization" src={process.env.PUBLIC_URL + "/assets/chevron.svg"}/>
                    <Ripple color={"#FFFFFF"} duration={1000}/>
                </ChevronButton>
            </StyledHeader>
            { status.length <= 0 ? <></> : 
                    <StyledFilteredData>
                        {
                            status.map((type, i, arr) => {

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