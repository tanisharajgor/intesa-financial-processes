// Libraries
import React from 'react';
import * as d3 from 'd3';
import { viewVariables, createLabelScale } from '../../../utils/global';


const treeLevelScale = d3.scaleOrdinal()
  .domain([0, 1, 2, 3, 4])
  .range(['root', 'Process 1', 'Process 2', 'Process 3', 'Activity']);

export function identifyNetworkSummary (inspect, data) {
  const nActors = data.nodes.filter(d => d.group === 'Actor').length;
  const nActivities = data.nodes.filter(d => d.group === 'Activity').length;

  inspect.select('.value1 .key').text('Number of actors: ');
  inspect.select('.value1 .value').text(`${nActors}`);
  inspect.select('.value2 .key').text('Number of activities: ');
  inspect.select('.value2 .value').text(`${nActivities}`);
  inspect.select('.value3 .key').text('');
  inspect.select('.value3 .value').text(' ');
}

export function identifyHierarchySummary (data) {
  const inspect = d3.select('.Inspect');

  inspect.select('.value1 .key').text('Processes showing: ');
  inspect.select('.value1 .value').text('1, 2, 3');
  inspect.select('.value2 .key').text('Number of activities: ');
  inspect.select('.value2 .value').text(`${d3.hierarchy(data).sum(d => d.children ? 0 : 1).value}`);
  inspect.select('.value3 .key').text('');
  inspect.select('.value3 .value').text(' ');
}

export function identifyHierarchyDetail (inspect, d, viewVariable) {
  const rs = d.data.riskStatus[viewVariable];
  const labelScale = createLabelScale(viewVariable);

  inspect.style('display', 'inline-block');
  inspect.style('visibility', 'visible');
  inspect.select('.value1 .key').text(`${treeLevelScale(d.data.level)}: `);
  inspect.select('.value1 .value').text(' ' + d.data.descr);
  inspect.select('.value2 .key').text('Number of activities: ');
  inspect.select('.value2 .value').text(`${d.sum(d => d.children ? 0 : 1).value}`);
  inspect.select('.value3 .key').text(`${viewVariables[viewVariable].label}: `);
  inspect.select('.value3 .value').text(' ' + labelScale(rs));
}

/* Creates the inspect html dom object */
export function IdentifyHTML () {
  return (
    <div className="Inspect">
      <div className="inner">
        <div className="layout_group inline">
          <div className="value1 layout_row">
            <span className="layout_item key"></span>
            <span className="layout_item value"></span>
          </div>
          <div className="value2 layout_row">
            <span className="layout_item key"></span>
            <span className="layout_item value"></span>
          </div>
          <div className="value3 layout_row">
            <span className="layout_item key"></span>
            <span className="layout_item value"></span>
          </div>
        </div>
      </div>
    </div>
  );
}
