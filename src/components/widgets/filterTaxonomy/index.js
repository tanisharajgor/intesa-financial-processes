// Libraries
import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import * as d3 from 'd3';

// Components
import { AccordionHeaderStyled } from '../../features/index';

// Data
import lu from '../../../data/processed/nested/lu.json';

// Styles
import { Accordion, AccordionDetails, MenuItem, Form } from 'cfd-react-components';
import { LayoutGroup, LayoutRow, LayoutItem } from '../../layout/index';
import { StyledSelect } from '../../../utils/global-styles';
import * as Theme from '../../../utils/theme';
import { StyledFilter, StyledItemHeader } from '../../features/menu/style'; 

// Prop types
FilterTaxonomy.propTypes = {
  selectedLevel1: PropTypes.number,
  updateLevel1: PropTypes.func,
  selectedLevel3: PropTypes.number,
  updateLevel3: PropTypes.func
};

// constants
const width = 500; const height = 600;

const id = 'Filter-Process';

const rScale = d3.scaleOrdinal()
  .domain([0, 1, 2, 3])
  .range([6, 5, 4, 3]);

// Data management steps
const cluster = d3.cluster()
  .size([height, width - 100]); // 100 is the margin I will have on the right side

function fillScale (d, selectedLevel3) {
  if (d.data.data.level === 3 && d.data.data.id === selectedLevel3) {
    return Theme.primaryColorHex;
  } else if (d.data.data.level === 3) {
    return 'white';
  } else {
    return Theme.extraDarkGreyHex;
  }
}

function initTooltip () {
  d3.select(`#${id}`)
    .append('div')
    .attr('class', 'tooltip')
    .attr('z-index', 500)
    .style('width', '100%')
    .style('height', '85px');
}

// Tooltip
function renderTooltip (selectedLevel3) {
  const tooltip = d3.select(`#${id} .tooltip`);

  d3.selectAll('.Process-Node').on('mouseover', function (e, d) {
    const thisCircle = d3.select(this);

    let x, y;

    if (d.data.data.level === 3) {
      x = e.layerX - 150;
      y = e.layerY - 100;
    } else {
      x = e.layerX + 20;
      y = e.layerY - 10;
    }

    tooltip.style('visibility', 'visible')
      .style('top', `${y}px`)
      .style('left', `${x}px`)
      .html(`Level ${d.data.data.level}<br><b>${d.data.data.descr}</b>`);

    thisCircle
      .attr('stroke', 'white')
      .attr('stroke-width', d => d.data.data.level === 3 ? 1.5 : 0)
      .attr('fill', d => d.data.data.level === 3 ? Theme.primaryColorHex : Theme.extraDarkGreyHex)
      .attr('r', 4);
  }).on('mouseout', function () {
    tooltip.style('visibility', 'hidden');

    d3.selectAll('.Process-Node')
      .attr('stroke', d => fillScale(d, selectedLevel3))
      .attr('fill', d => fillScale(d, selectedLevel3))
      .attr('stroke-width', 0.5)
      .attr('r', d => rScale(d.data.data.level));
  });
}

function clickProcess (updateLevel3) {
  d3.selectAll('.Process-Node').each(function () {
    d3.select(this)
      .on('click', (e, datum) => {
        if (datum.data.data.level === 3) {
          updateLevel3(datum.data.data.id);
        }
      });
  });
}

function initFilter () {
  d3.select(`#${id}`)
    .append('svg')
    .attr('width', width)
    .attr('height', height);
}

function updateFilter (root, selectedLevel3) {
  let svg = d3.select(`#${id} svg`);

  d3.select(`#${id} svg g`).remove();

  svg = svg.append('g')
    .attr('transform', 'translate(10, 0)');

  // Add the links between nodes:
  svg.selectAll('path')
    .data(root.descendants().slice(1).filter(d => d.data.data.level < 4))
    .join('path')
    .attr('d', function (d) {
      return 'M' + d.y + ',' + d.x +
                    'C' + (d.parent.y + 50) + ',' + d.x +
                    ' ' + (d.parent.y + 150) + ',' + d.parent.x + // 50 and 150 are coordinates of inflexion, play with it to change links shape
                    ' ' + d.parent.y + ',' + d.parent.x;
    })
    .style('fill', 'none')
    .attr('stroke', Theme.extraDarkGreyHex)
    .attr('stroke-opacity', 1)
    .attr('stroke-width', 0.5);

  // Add a circle for each node.
  svg.selectAll('g')
    .data(root.descendants().filter(d => d.data.data.level < 4))
    .join('g')
    .attr('transform', function (d) {
      return `translate(${d.y},${d.x})`;
    })
    .append('circle')
    .attr('r', d => rScale(d.data.data.level))
    .attr('fill', d => fillScale(d, selectedLevel3))
    .attr('stroke', d => fillScale(d, selectedLevel3))
    .attr('stroke-width', 0.5)
    .attr('class', 'Process-Node')
    .style('cursor', d => d.data.data.level === 3 ? 'pointer' : 'not-allowed');
}

export function FilterTaxonomy ({ selectedLevel1, updateLevel1, selectedLevel3, updateLevel3 }) {
  const processes = lu.processes;
  const valuesLevel1 = processes.children;
  const level3Descr = lu.level3.find((d) => d.id === selectedLevel3).descr;
  const levelsFiltered = lu.processes.children.find((d) => d.id === selectedLevel1);

  // Update data
  const hierarchyData = d3.hierarchy(levelsFiltered);
  const root = d3.hierarchy(hierarchyData, function (d) {
    return d.children;
  });

  cluster(root);

  const handleChangeLevel1 = (event) => {
    const level1 = parseInt(event.target.value);
    updateLevel1(level1);
  };

  useEffect(() => {
    initTooltip();
    initFilter();
  }, []);

  // Initialize SVG Visualization
  useEffect(() => {
    updateFilter(root, selectedLevel3);
  }, [selectedLevel1]);

  // Update SVG Visualization
  useEffect(() => {
    clickProcess(updateLevel3);
    renderTooltip(selectedLevel3);
  }, [selectedLevel1, selectedLevel3]);

  return (
    <Accordion className={'Card'}>
      <AccordionHeaderStyled label="Filter by Taxonomy" filteredTypes={[level3Descr]}/>
      <AccordionDetails>
        <LayoutGroup>
          <LayoutRow className="layout_row">
            <StyledItemHeader>L1</StyledItemHeader>
            <LayoutItem className="push">
              <Form variant="outlined" size="small">
                <StyledSelect
                  labelId="process1-select-label"
                  id="process1-select"
                  displayEmpty
                  value={selectedLevel1}
                  onChange={handleChangeLevel1}
                >
                  {valuesLevel1.map((level) => {
                    return (
                      <MenuItem key={`menu-item-${level.descr}`} value={level.id}>{level.descr}</MenuItem>
                    );
                  })}
                </StyledSelect>
              </Form>
            </LayoutItem>
          </LayoutRow>
          <LayoutRow>
            <StyledFilter id={id}></StyledFilter>
          </LayoutRow>
        </LayoutGroup>
      </AccordionDetails>
    </Accordion>
  );
}
