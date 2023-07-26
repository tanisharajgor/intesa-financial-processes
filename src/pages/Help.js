// Libraries
import styled from 'styled-components'

// Components
import Navigation from "../components/Navigation";

// Styles
import { Content } from "../component-styles/content";

export const HelpFormatted = styled('div')`
    padding: 2rem;
    color: lime;
`;

export default function Help() {

    return (
        <>
            <Navigation />
            <Content>
                <div className="Query">
                    <div className="layout_group pad border">
                        <h4 className="secondary">Help</h4>
                        <ul className="formatted">
                            <li>
                            <a href="#gettingstarted">Getting started</a>
                            </li>
                            <li>
                            <a href="#interfaceconventions">Interface conventions</a>
                            </li>
                            <li>
                            <a href="#explore">Explore</a>
                            </li>
                            <li>
                            <a href="#analyze">Analyze</a>
                            </li>
                            <li>
                            <a href="#simulate">Simulate</a>
                            </li>
                            <li>
                            <a href="#abouttheproject">About the project</a>
                            </li>
                        </ul>
                    </div>
                </div>
                <div className="Main">
                    <HelpFormatted>
                        <div className="inner">
                            <h1>Help</h1>
                            <section>
                            <h2 id="gettingstarted">Getting started</h2>
                            <p>
                                This app enables you to explore human resources personnel data
                                to better understand the distribution of knowledge and skills
                                within your organization. You might use the results to:
                            </p>
                            <ul>
                                <li>
                                access employee fit based on their knowledge and skills
                                </li>
                                <li>develop training programs to target needed skills</li>
                                <li>
                                to support future business plans by simulating changes in
                                knowledge distribution
                                </li>
                            </ul>
                            <p>
                                Using the app, you can engage in three main tasks:
                                exploration, analysis, and simulation. The exploration task
                                features enable you to search, filter, and inspect the
                                organization's knowledge graph. You can visualize employee
                                nodes in relation to the median scores for a skill evaluation
                                in the analysis task. Through the simulation task, you can add
                                employee nodes with specific characteristics and see how they
                                might affect the knowledge distribution within the
                                organization.
                            </p>
                            <p>
                                To start, choose one of the three tasks: exploration,
                                analysis, or simulation.
                            </p>
                            </section>
                            <section>
                            <h3>Key terms</h3>
                            <figure>
                                <img
                                src="img/explore-visualization.png"
                                alt="Knowledge network visualizaiton"
                                />
                            </figure>
                            <p>
                                <strong>Knowledge area</strong> &mdash; This term refers to a
                                specialized aggregate of knowledge within management science
                                that defines an area of expertise. There are 43 financial
                                areas that COMPANY X specializes in, e.g., advisory,
                                wealth and asset management, and transaction banking.
                            </p>
                            <p>
                                <strong>Performance domain</strong> &mdash; There are 130
                                performance domains among the 43 knowledge areas, e.g., cash
                                management, securities services, and trade finance.
                                Performance domains refer to activities or behaviors within a
                                knowledge area necessary to achieve project outcomes.
                            </p>
                            <p>
                                <strong>Persona</strong> &mdash; The term "persona" has been
                                used to divide employees into sets based on knowledge areas.
                            </p>
                            </section>
                            <section>
                            <h2 id="interfaceconventions">Interface conventions</h2>
                            <figure>
                                <img
                                src="img/interface-regions.png"
                                alt="Interface regions"
                                />
                                <figcaption>Interface regions</figcaption>
                            </figure>
                            <p>
                                The interface is divided into regions, each with a specific
                                function.
                            </p>
                            <p>
                                The navigation bar&nbsp;contains links to the three main
                                tasks: exploration, analysis, and simulation. It also includes
                                a link to the in-app help and documentation.
                            </p>
                            <p>
                                Once a task is chosen, you can configure query
                                settings&nbsp;to subset the data and customize the display.
                            </p>
                            <p>
                                View status&nbsp;presents options that reflect the data within
                                the current query. The status and legend area provides summary
                                statistics of the results of the current data query and
                                enables the user to color the data points by the categorical
                                attributes.
                            </p>
                            <p>
                                The visualization area can be zoomed and panned using the view
                                controls&nbsp;to enable the user to inspect individual data
                                points.
                            </p>
                            </section>
                            <section>
                            <h2 id="explore">Explore</h2>
                            <p>
                                You can explore your organization&rsquo;s knowledge graph
                                using view features and create custom subsets of the data
                                using the query builder. Use your cursor to reveal links
                                between nodes in the visualization with similar knowledge
                                areas by placing the cursor over a node. Click a node to
                                inspect the attributes.
                            </p>
                            <h3>To build a data query:</h3>
                            <figure>
                                <img
                                src="img/query-filter-agegroup.png"
                                alt="Age group query builder"
                                width="318"
                                />
                                <figcaption>Age group query builder</figcaption>
                            </figure>
                            <ol>
                                <li>
                                Expand a Filter module by clicking the arrow. (Modules
                                include: filter by region, position, age group, gender, and
                                skill)
                                </li>
                                <li>
                                Select attributes for filtering. The query will update
                                automatically.
                                </li>
                                <li>
                                Click the remove button next to the query summary to clear
                                the query filter.
                                </li>
                            </ol>
                            </section>

                            <section>
                            <h3>To reveal and explore clusters:</h3>
                            <figure>
                                <img
                                src="img/query-cluster.png"
                                alt="Cluster"
                                width="318"
                                />
                                <figcaption>Cluster</figcaption>
                            </figure>

                            <ol>
                                <li>
                                Expand the Cluster module by clicking the arrow. (You can
                                cluster by region, gender, age group, knowledge area,
                                performance domain, or position.)
                                </li>
                                <li>
                                Select attributes for clustering. The visualization will
                                update automatically.
                                </li>
                                <li>
                                Choose &ldquo;none&rdquo; or click the remove button next to
                                the cluster summary to reset the visualization layout.
                                </li>
                            </ol>
                                <p className="indent">
                                Clustering only affects the visualization layout. It does not
                                alter the data query.
                                </p>
                            </section>
                            <section>
                            <h3>To identify employees based on attributes:</h3>
                            <figure>
                                <img
                                src="img/query-identify.png"
                                alt="Identify nodes"
                                width="318"
                                />
                                <figcaption>Identify nodes</figcaption>
                            </figure>
                            <ol>
                                <li>
                                Expand the Identify module by clicking the arrow. (You can
                                identify nodes by region, gender, age, knowledge area,
                                performance domain, or compliance score.)
                                </li>
                                <li>
                                Select attributes for identification. The visualization will
                                update automatically.
                                </li>
                                <li>
                                To add attributes, click &ldquo;Add.&rdquo; Another
                                attributes menu will appear below the current selection.
                                </li>
                                <li>
                                To clear an attribute, click the remove button to the right
                                of your selection. To clear all attributes, click the remove
                                button next to the Identify summary.
                                </li>
                            </ol>
                            <p className="indent">
                                Identify feature only affects the visualization layout. It
                                does not alter the data query.
                            </p>
                            </section>
                            <section>
                            <h2 id="analyze">Analyze</h2>
                            <p>
                                In the Analyze task tab, you can visualize employee nodes in
                                relation to the median scores for a skill (knowledge area and
                                performance domain) to identify outliers that may signify
                                sub-optimal fit. The analysis has filtering functions similar
                                to the Explore task. The analysis settings will persist in the
                                Analyze tab if the user navigates away so that they may return
                                to their previous settings.
                            </p>
                            <h3>To build a data query:</h3>
                            <ol>
                                <li>
                                Expand a Filter module by clicking the arrow. (Modules
                                include: filter by region, position, age group, gender, and
                                skill)
                                </li>
                                <li>
                                Select attributes for filtering. The query will update
                                automatically.
                                </li>
                                <li>
                                Click the remove button next to the query summary to clear
                                the query filter.
                                </li>
                            </ol>
                            <h3>Interpreting the results:</h3>
                            <figure>
                                <img
                                src="img/analysis-visualizaiton.png"
                                alt="Analysis visualization"
                                />
                                <figcaption>Analysis visualization</figcaption>
                            </figure>
                            <p>
                                Nodes are arranged by compliance scores in relation to the
                                standard deviation within the group. In most cases, the scores
                                are aggregate averages except when you have selected a
                                specific performance domain. In this case, raw scores are
                                used.
                            </p>
                            </section>
                            <section>
                            <h2 id="simulate">Simulate</h2>
                            <p>
                                The simulation can help you plan how knowledge might be
                                distributed within your organization after a merger or
                                acquisition or another type of workforce expansion. In the
                                Simulate task, you can set the number of simulated employees
                                and the desired age, gender, and skill distributions to add to
                                the knowledge graph. The simulated data will persist in the
                                Simulate tab if you navigate to another task.
                            </p>
                            <h3>To simulate workforce data:</h3>
                            <figure>
                                <img
                                src="img/simulate-nodes.png"
                                alt="Simulate nodes"
                                width="318"
                                />
                                <figcaption>Simulate nodes</figcaption>
                            </figure>                
                            <ol>
                                <li>
                                Set the number of simulated employees to add to your
                                knowledge graph. You may also edit the age, gender, region,
                                and skill distributions.
                                </li>
                                <li>Click add to update the graph.</li>
                            </ol>
                            <p>
                                Simulated employees can be identified using the dynamic key.
                            </p>
                            </section>
                            <section>
                            <h2 id="abouttheproject">About the project</h2>
                            <p>
                                <img
                                src="img/cfd-logo.svg"
                                width="65"
                                alt="Center for Design at
                                Northeastern University logo"
                                />
                            </p>
                            <p>
                                The Data Visualization for E-Learning project began in October
                                2020 as a partnership between the Center for Design at
                                Northeastern University and COMPANY X to visualize
                                knowledge distribution within the company.
                            </p>
                            <h3>Project roadmap</h3>
                            <p>
                                The Data Visualization for E-Learning project has gone through
                                three phases. In Phase 01, we analyzed the data and
                                conceptualized ways of visualizing it to better understand the
                                knowledge graph. In Phase 02, we created a functional
                                prototype and conducted a heuristic evaluation. In this phase,
                                Phase 03, we added development expertise to create a query
                                builder interface and produce a workable product that can be
                                used for further research into how interactive visualization
                                can facilitate understanding knowledge distribution within
                                organizations.
                            </p>
                            <p>
                                Future work will consist of conducting further usability
                                evaluation, tuning the query builder and visualizations, and
                                conceptualizing additional visualizations.
                            </p>
                            <p>
                                You can find details of current and future development in the
                                &ldquo;<a href="https://docs.google.com/document/d/1_AH_4whNAWpJ7lvokyeU80v2uQGhs2tuRfDv3Fw5Zsc/edit?usp=sharing">Data Viz for E-Learning Software Requirements
                                Specification v1.0.0</a>.&rdquo;
                            </p>
                            <h3>Contributors</h3>
                            <ul>
                                <li>
                                Matt Blanco, <em>Design Research Assistant, Northeastern University</em>
                                </li>
                                <li>
                                Paolo Ciuccarelli, <em>Director, Center for Design</em>
                                </li>
                                <li>
                                Estefania Ciliotta Chehade, <em>Postdoc Strategist and Researcher, Center for Design</em>
                                </li>
                                <li>
                                Daniella Fernandes, <em>Design Research Assistant, Northeastern University</em>
                                </li>
                                <li>
                                Joli Holmes, <em>Design Research Assistant, Northeastern University</em>
                                </li>
                                <li>
                                Yuan Hua, <em>Design Research Assistant, Northeastern University</em>
                                </li>
                                <li>
                                Todd Linkner, <em>Assistant Teaching Professor, Northeastern University</em>
                                </li>
                                <li>
                                Houjiang Liu, <em>Ph.D. Student, University of Texas at Austin</em>
                                </li>
                                <li>
                                Wenting Yue, <em>Design Research Assistant, Northeastern University</em>
                                </li>
                            </ul>
                            </section>
                        </div>
                    </HelpFormatted>
                </div>
            </Content>
        </>
    )
}