import pandas as pd
import os
import yaml
from python.data_management import actors_rename, activities_dm, actors_dm, risks_dm, applications_dm, controls_dm, create_actor_activities_nodes, create_links
from python.translate import translate_text, authenticate_implicit_with_adc
from python.helper import write_json, create_lu

with open('./config.yaml', 'r', encoding='utf8') as file:
    config = yaml.safe_load(file)

pth = "../data/"
raw_pth = os.path.join(pth, "raw")
processed_pth = os.path.join(pth, "processed")

fl_name = "Richiesta_Dati_V2_EN.xlsb"

def main():

    raw = os.path.join(raw_pth, fl_name)

    data = pd.read_excel(raw, sheet_name = "Actors")
    data = actors_rename(data)

    risks = pd.read_excel(raw, sheet_name = "Risks")
    controls = pd.read_excel(raw, sheet_name = "Controls")
    applications = pd.read_excel(raw, sheet_name = "Applications (tools)")

    ## Translate Italian to English
    authenticate_implicit_with_adc()
    translate_text(data.actor.unique(), raw_pth, 'actors_translated')
    translate_text(data.activity.unique(), raw_pth, 'activities_translated')
    translate_text(risks["Object Name"].unique(), raw_pth, 'risks_translated')
    translate_text(applications["Object Name"].unique(), raw_pth, 'applications_translated')
    translate_text(controls["Activity Name"].unique(), raw_pth, 'controls_translated')

    ## Clean data
    activities = activities_dm(data, config, raw_pth, processed_pth)
    actors = actors_dm(data, config, raw_pth, processed_pth)
    risks = risks_dm(risks, raw_pth, processed_pth)
    applications = applications_dm(applications, raw_pth, processed_pth)
    controls = controls_dm(controls, config, raw_pth, processed_pth)

    ## Structured data
    nodes = create_actor_activities_nodes(data, actors, activities)
    links = create_links(nodes)

    network = {
        "nodes" : nodes,
        "links" : links
    }

    lu = {
        "risks": create_lu(risks.drop("riskGUID", axis=1), "riskID", "risk"),
        "applications": create_lu(applications.drop("applicationGUID", axis=1), "applicationID", "application"),
        "activities": create_lu(activities.drop("activityGUID", axis=1), "activityID", "activity"),
        "actors": create_lu(actors.drop("actorGUID", axis=1), "actorID", "actor"),
        "controls": create_lu(controls.drop("controlGUID", axis=1), "controlID", "control")
    }

    write_json(network, processed_pth, "network")
    write_json(lu, processed_pth, "lu")

    # import pdb; pdb.set_trace()

if __name__ == '__main__':
    main()
    