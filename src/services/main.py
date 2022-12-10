import pandas as pd
import os
import yaml
from python.data_management import actors_rename, activities_dm, actors_dm, risks_dm, applications_dm, controls_dm, level1_dm, level2_dm, level3_dm, create_actor_activities_nodes, create_links
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
    translate_text(data.actor.unique(), os.path.join(raw_pth, "translated"), 'actors')
    translate_text(data.activity.unique(), os.path.join(raw_pth, "translated"), 'activities')
    translate_text(risks["Object Name"].unique(), os.path.join(raw_pth, "translated"), 'risks')
    translate_text(applications["Object Name"].unique(), os.path.join(raw_pth, "translated"), 'applications')
    translate_text(controls["Activity Name"].unique(), os.path.join(raw_pth, "translated"), 'controls')
    translate_text(data["L1 NAME"].unique(), os.path.join(raw_pth, "translated"), 'level1')
    translate_text(data["L2 NAME"].unique(), os.path.join(raw_pth, "translated"), 'level2')
    translate_text(data["L3 NAME"].unique(), os.path.join(raw_pth, "translated"), 'level3')

    ## Clean data
    activitiesClean = activities_dm(data, config, raw_pth, processed_pth)
    actorsClean = actors_dm(data, config, raw_pth, processed_pth)
    risksClean = risks_dm(risks, raw_pth, processed_pth)
    applicationsClean = applications_dm(applications, raw_pth, processed_pth)
    controlsClean = controls_dm(controls, config, raw_pth, processed_pth)
    level1Clean = level1_dm(data, raw_pth, processed_pth)
    level2Clean = level2_dm(data, raw_pth, processed_pth)
    level3Clean = level3_dm(data, raw_pth, processed_pth)

    ## Structured data
    nodes = create_actor_activities_nodes(data, actorsClean, activitiesClean)
    links = create_links(nodes)

    network = {
        "nodes" : nodes,
        "links" : links
    }

    lu = {
        "risk": create_lu(risks.drop("riskGUID", axis=1), "riskID", "risk"),
        "application": create_lu(applications.drop("applicationGUID", axis=1), "applicationID", "application"),
        "activity": create_lu(activities.drop("activityGUID", axis=1), "activityID", "activity"),
        "actor": create_lu(actors.drop("actorGUID", axis=1), "actorID", "actor"),
        "control": create_lu(controls.drop("controlGUID", axis=1), "controlID", "control"),
        "level1": create_lu(level1.drop("level1GUID", axis=1), "level1ID", "level1"),
        "level2": create_lu(level2.drop("level2GUID", axis=1), "level2ID", "level2"),
        "level3": create_lu(level3.drop("level3GUID", axis=1), "level3ID", "level3")
    }

    write_json(network, processed_pth, "network")
    write_json(lu, processed_pth, "lu")

    import pdb; pdb.set_trace()

if __name__ == '__main__':
    main()
    