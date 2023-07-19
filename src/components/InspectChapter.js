import { Accordion, AccordionDetails } from 'cfd-react-components';
import { taxonomyLevel } from "./InspectTaxonomy";
import { AccordionHeaderStyled } from './Accordion';

export default function InspectChapter({selectedChapter, updateSelectedChapter, valuesChapter}) {

    const handleChangeChapter = (event) => {
        let chapter = parseInt(event.target.value);
        updateSelectedChapter(chapter);
    }

    const chapterDescr = valuesChapter.find((d) => d.id === selectedChapter).descr;

    return(
        <Accordion className={'Card'}>
            <AccordionHeaderStyled label="Inspect by Chapter" filteredTypes={[chapterDescr]}/>
            <AccordionDetails>
                {taxonomyLevel(valuesChapter, selectedChapter, handleChangeChapter, "Chapter", "chapter")}
            </AccordionDetails>
        </Accordion>
    )
}
