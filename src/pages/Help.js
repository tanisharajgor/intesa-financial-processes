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

export const HelpNav = styled('div')`
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    width: 20rem;
    overflow-y: auto;

    h2 {
        margin-bottom: 1.4rem;
        font-size: 1rem;
        font-weight: normal;
        color: ${props => props.theme.color.secondary};
    }

    p {
        margin-bottom: 0.625rem;
    }

    a {
        text-decoration: none;
        color: ${props => props.theme.color.main};
    }

    a:hover {
        color: ${props => props.theme.color.focus};
    }

    .help_header {
        padding: 1.25rem;
    }
`;

export const HelpBody = styled('div')`
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 20rem;
    padding: 1.25rem;
    overflow-y: auto;
`;


export default function Help () {
  return (
    <>
      <Navigation />
      <HelpContent>
        <HelpNav>
            <div className="help_header">
                <h2>Help</h2>
                <p><a href="#getting_started">Getting Started</a></p>
                <p><a href="#interface_conventions">Interface Conventions</a></p>
                <p><a href="#process_ecosystem">Inspecting the Process Ecosystem</a></p>
                <p><a href="#actor_network">Exploring the Actor Network</a></p>
                <p><a href="#about">About the Project</a></p>
            </div>
        </HelpNav>
        <HelpBody>
            <FormattedContent>
                <h1>Help</h1>
                <section>
                    <h2 id="getting_started">Getting Started</h2>
                    <p>...</p>
                </section>
                <section>
                    <h2 href="interface_conventions">Interface Conventions</h2>
                    <p>...</p>
                </section>
                <section>
                    <h2 href="process_ecosystem">Inspecting the Process Ecosystem</h2>
                    <p>...</p>
                </section>
                <section>
                    <h2 href="actor_network">Exploring the Actor Network</h2>
                    <p>...</p>
                </section>
                <section>
                    <h2 href="about">About the Project</h2>
                    <p>...</p>
                </section>
            </FormattedContent>
        </HelpBody>
     </HelpContent>
    </>
  );
}
