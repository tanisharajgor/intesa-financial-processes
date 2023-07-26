// Libraries
import React from 'react';
import PropTypes from 'prop-types';

// Libraries
import { useState } from 'react';

// Components
import Description from './Description';
import { ChevronButtonStyled } from './Chevron';

// Styles
import { AccordionHeader } from 'cfd-react-components';
import { Key } from '../component-styles/key';
import { StyledMenuHeader, StyledMenuBody, StyledFilteredData } from '../component-styles/menu';

// Prop types
MenuCollapsableHeader.propTypes = {
  label: PropTypes.node.isRequired,
  shouldRotate: PropTypes.node.isRequired,
  handleRotate: PropTypes.node.isRequired,
  filteredTypes: PropTypes.node.isRequired
};

// Component to style the Menu Header
export function MenuCollapsableHeader ({ label, shouldRotate, handleRotate, filteredTypes = [] }) {
  return (
    <StyledMenuHeader>
      <Key>{filteredTypes.length <= 0 ? label : `${label}:`}</Key>
      <ChevronButtonStyled shouldRotate={shouldRotate} handleRotate={handleRotate}/>
    </StyledMenuHeader>
  );
}

// Prop types
MenuHeader.propTypes = {
  label: PropTypes.node.isRequired,
  filteredTypes: PropTypes.node.isRequired
};

export function MenuHeader ({ label, filteredTypes = [] }) {
  return (
    <StyledMenuHeader>
      <Key>{filteredTypes.length <= 0 ? label : `${label}:`}</Key>
    </StyledMenuHeader>
  );
}

// Prop types
MenuBody.propTypes = {
  shouldRotate: PropTypes.node.isRequired,
  pageDescription: PropTypes.node.isRequired,
  children: PropTypes.node.isRequired
};

// Component to style Menu Body
export function MenuBody ({ shouldRotate, pageDescription, children }) {
  return (
    <StyledMenuBody style={{ visibility: !shouldRotate ? 'hidden' : 'visible' }}>
      <Description>
        <p>{pageDescription}</p>
      </Description>
      {children}
    </StyledMenuBody>
  );
}

// Prop types
TypesStatus.propTypes = {
  filteredTypes: PropTypes.node.isRequired
};

// Returns a status for each selected type
function TypesStatus ({ filteredTypes }) {
  return (
    filteredTypes.length <= 0
      ? <></>
      : <StyledFilteredData>
        {
          filteredTypes.map((type, i, arr) => {
            let str = type;
            if (i < arr.length - 1) {
              str += ', ';
            }
            return (
              <span key={`descr-${str}`}>{str}</span>
            );
          })
        }
      </StyledFilteredData>
  );
}

// Prop types
AccordionHeaderStyled.propTypes = {
  label: PropTypes.node.isRequired,
  filteredTypes: PropTypes.node.isRequired
};

// Component to style the Accordian Header
export function AccordionHeaderStyled ({ label, filteredTypes = [] }) {
  const [shouldRotate, setRotate] = useState(false);
  const handleRotate = () => setRotate(!shouldRotate);

  return (
    <AccordionHeader
      aria-controls="activity-type-filter-content"
      id="activity-type-filter-header"
      onClick={handleRotate}
    >
      <MenuCollapsableHeader label={label} shouldRotate={shouldRotate} handleRotate={handleRotate} filteredTypes={filteredTypes}/>
      <TypesStatus filteredTypes={filteredTypes}/>
    </AccordionHeader>
  );
}
