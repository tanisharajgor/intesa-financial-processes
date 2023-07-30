// Libraries
import React from 'react';
import styled from 'styled-components'

// Components
import { Navigation } from '../components/layout/index';

// Styles
import { FormattedContent } from '../utils/global-styles';

export const HelpContent = styled('div')`
    position: absolute;
    top: 4rem;
    right: 0;
    bottom: 0;
    left: 0;
`;

export const HelpBody = styled('div')`
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 20rem;
    padding: 1.25rem;
    overflow-y: auto;

    .ui-img {
        max-width: 318px;
    }
`;

/*
public/assets/help-freeze.png 
*/


export default function Help () {
  return (
    <>
      <Navigation />
      <HelpContent>
        <HelpBody>
            <FormattedContent>
                <h1>Help</h1>
                <section>
                    <h2 id="overview">Overview</h2>
                    <figure>
                        <img src={process.env.PUBLIC_URL + '/assets/help-process-ecosystem.png'}  alt="Process ecosystem diagram" />
                        <figcaption>Process ecosystem diagram</figcaption>
                    </figure>
                    <p>This app enables you to explore and audit risk management data at the enterprise level, through views of the Process Ecosystem and Actor Network to understand and manage the complexity.</p>
                    <p><b>You might use the results to:</b></p>
                    <ul>
                        <li>Understand the distribution of risk across the company</li>
                        <li>Understand the links between activities, actors, and organizational structure</li>
                        <li>Identify risks without adequate controls</li>
                        <li>Develop plans to redistribute workloads</li>
                    </ul>
                </section>
                <section>
                    <h2 href="interface_conventions">Interface Conventions</h2>
                    <figure>
                        <img src={process.env.PUBLIC_URL + '/assets/help-inaterface-regions.png'}  alt="Diagram of interface regions" />
                        <figcaption>Interface regions</figcaption>
                    </figure>
                    <p>The interface is divided into regions, each with a specific function.</p>
                    <p>The navigation bar contains links to the main tasks: exploring the Process Ecosystem and the Network of Actors, Risks, and Activities. It also includes a link to the in-app help and documentation.</p>
                    <p>Once a task is chosen, you can configure query settings to subset the data and customize the display.</p>
                    <p>View status presents options that reflect the data within the current query. The status and legend area provides summary statistics of the results of the current data query and enables the user to color the data points by the categorical attributes. The status pane can be repositioned anywhere in the viewport. You can collapse the pane by clicking on the header.</p>
                </section>
                <section>
                    <figure>
                        <img src={process.env.PUBLIC_URL + '/assets/help-view-controls.png'}  alt="View controls" className="ui-img" />
                        <figcaption>View controls</figcaption>
                    </figure>
                    <p>The view controls enable you to Reset the Viewport, Zoom in and out of the visualization, and explore the visualizations in Full-Screen Mode.</p>
                    <p>The visualization area can also be Zoomed and Panned using your trackpad or mouse and scroll-wheel.</p>
                </section>
                <section>
                    <h2 href="process_ecosystem">Exploring the Process Ecosystem</h2>
                    <figure>
                        <img src={process.env.PUBLIC_URL + '/assets/help-filter.png'}  alt="Filter query module" className="ui-img" />
                        <figcaption>Filter query buidler</figcaption>
                    </figure>
                    <p>You can explore your organization&rsquo;s knowledge graph using viewport controls and by adjusting the query settings to create custom subsets of the dataset, or to identify features having specific attributes within the context of a query. Use your cursor to reveal links between nodes in the visualization with similar knowledge areas by placing the cursor over a node.</p>
                    <p><b>To build a data query:</b></p>
                    <ol>
                        <li>Expand a Filter module by clicking the arrow. (Modules include: filter by activity type, process, and actor type.)</li>
                        <li>Select attributes for filtering. The query will update automatically.</li>
                    </ol>
                </section>
                <section>
                    <figure>
                        <img src={process.env.PUBLIC_URL + '/assets/help-identify.png'}  alt="Identify query module" className="ui-img" />
                        <figcaption>Identify query buidler</figcaption>
                    </figure>
                    <p><b>To identify elements based on attributes:</b></p>
                    <ol>
                        <li>Expand the Identify module by clicking the arrow. (You can identify nodes by activity type, taxonomy, chapter, or organizational structure.)</li>
                        <li>Select attributes for identification. The visualization will update automatically.</li>
                        <li>The Identify feature only affects the visualization layout. It does not alter the data query.</li>
                    </ol>
                </section>
                <section>
                    <h2 href="actor_network">Exploring the Actor Network</h2>
                    <figure>
                        <img src={process.env.PUBLIC_URL + '/assets/help-identify.gif'}  alt="Identify feature in the actor network diagram" />
                        <figcaption>Identify feature in the actor network diagram</figcaption>
                    </figure>

                </section>
                <section>
                    <figure>
                        <img src={process.env.PUBLIC_URL + '/assets/help-freeze.png'}  alt="Freeze feature" />
                        <figcaption>Freeze feature</figcaption>
                    </figure>
                    <p><b>To highlight network connections:</b></p>
                    <ol>
                        <li>&ldquo;Freeze&rdquo; a portion of the network by clicking on a node. This will select and highlight all nodes immediately connected to the selected node. </li>
                        <li>To deselect, click anywhere on the visualization outside of a node.</li>
                    </ol>
                </section>
                <section>
                    <h2 href="about">About the Project</h2>
                    <p>
                        <img src={process.env.PUBLIC_URL + '/assets/logos.svg'}  width="320" alt="Center for Design and Banca Intesa S.p.A." />&nbsp;&nbsp;&nbsp;&nbsp; 
                    </p>
                    <p>The Banca Intesa Processes project began in September 2022 as a partnership between the Center for Design at Northeastern University and Banca Intesa S.p.A. to visualize risk and mitigation processes within the company. The interface was developed through collaborative discovery and problem-space research conducted in 2022–2023. </p>
                    <p><b>Contributors</b></p>
                    <ul>
                        <li>Matt Blanco, Design Research Assistant, Northeastern University</li>
                        <li>Paolo Ciuccarelli, Director, Center for Design</li>
                        <li>Estefania Ciliotta Chehade, Associate Director, Center for Design</li>
                        <li>Andrea Cosentini, Head of Data Science & AI, Intesa Sanpaolo</li>
                        <li>Joli Holmes, Design Research Assistant, Northeastern University</li>
                        <li>Todd Linkner, Assistant Teaching Professor, Northeastern University</li>
                        <li>Tanisha Rajgor, Design Research Assistant, Northeastern University</li>
                    </ul>
                </section>
            </FormattedContent>
        </HelpBody>
     </HelpContent>
    </>
  );
}
