import pandas as pd
import os
import yaml
from python.data_management import actors_rename, activities_dm, actors_dm, risks_dm, \
    applications_dm, controls_dm, level1_dm, level2_dm, level3_dm, model_dm, \
    activity_to_risk_dm, risk_to_control_dm, main_dm, activity_to_actor_dm, org_str1_dm, \
    org_str2_dm

from python.nest_data import create_processes_to_activities, \
     create_network, create_processes, create_org_structure

from python.translate import translate_text, authenticate_implicit_with_adc
from python.helper import write_json, create_lu

with open('./config.yaml', 'r', encoding='utf8') as file:
    config = yaml.safe_load(file)

pth = "../data/"
raw_pth = os.path.join(pth, "raw")
processed_pth = os.path.join(pth, "processed")
fl_name = "Data_V3.xlsb"

def save_csv(raw_pth):

    for fl in os.listdir(raw_pth):

        df =  pd.read_excel(os.path.join(raw_pth, fl))

        name = os.path.splitext(fl)[0]

        df.to_csv(os.path.join(raw_pth, name+'.csv'))

def main():

    raw = os.path.join(raw_pth, fl_name)
    data = pd.read_excel(raw, sheet_name = "Attori")
    data = actors_rename(data)
    risks = pd.read_excel(raw, sheet_name = "Rischi")
    controls = pd.read_excel(raw, sheet_name = "Controlli")
    applications = pd.read_excel(raw, sheet_name = "Applicativi")

    ## Translate Italian to English
    ## Uncomment line 43 and 44 to authenticate with google translate and uncomment the data structure you wish to translate
    ## The google translate API costs $$ so only translate when needed
    # project_id = config["translate"]["projectId"]
    # authenticate_implicit_with_adc(project_id)

    # translate_text(data.actor.unique(), os.path.join(raw_pth, "translated"), 'actors', project_id)
    # translate_text(data.activity.unique(), os.path.join(raw_pth, "translated"), 'activities', project_id)
    # translate_text(risks["Object Name"].unique(), os.path.join(raw_pth, "translated"), 'risks', project_id)
    # translate_text(applications["Object Name"].unique(), os.path.join(raw_pth, "translated"), 'applications', project_id)
    # translate_text(controls["Activity Name"].unique(), os.path.join(raw_pth, "translated"), 'controls', project_id)
    # translate_text(data["L1 NAME"].unique(), os.path.join(raw_pth, "translated"), 'level1', project_id)
    # translate_text(data["L2 NAME"].unique(), os.path.join(raw_pth, "translated"), 'level2', project_id)
    # translate_text(data["L3 NAME"].unique(), os.path.join(raw_pth, "translated"), 'level3', project_id)
    # translate_text(data["MODEL NAME ITA"].unique(), os.path.join(raw_pth, "translated"), 'model', project_id)
    # translate_text(data.organizational_structure1.unique(), os.path.join(raw_pth, "translated"), 'organizational_structure1', project_id)
    # translate_text(data.organizational_structure.unique(), os.path.join(raw_pth, "translated"), 'organizational_structure', project_id)

    # ## Clean data
    controlsClean = controls_dm(controls, data, config, raw_pth, processed_pth)
    activitiesClean = activities_dm(data, controlsClean, config, raw_pth, processed_pth)
    actorsClean = actors_dm(data, config, raw_pth, processed_pth)
    risksClean = risks_dm(risks, config, raw_pth, processed_pth)
    applicationsClean = applications_dm(applications, raw_pth, processed_pth)
    level1Clean = level1_dm(data, raw_pth, processed_pth)
    level2Clean = level2_dm(data, raw_pth, processed_pth)
    level3Clean = level3_dm(data, raw_pth, processed_pth)
    modelClean = model_dm(data, raw_pth, processed_pth)
    orgClean = org_str2_dm(data, raw_pth, processed_pth)

    data = data[["L1 GUID", "L2 GUID", "L3 GUID", "MODEL GUID", "activityGUID", "actorGUID", "organizational_structure1", "organizational_structure", "Connection"]].rename(
                                columns={
                                'L1 GUID': 'level1GUID',
                                'L2 GUID': 'level2GUID',
                                'L3 GUID': 'level3GUID',
                                'MODEL GUID': 'modelGUID'})

    risks = risks[["Rischio di Informativa Finanziaria (ex 262/2005)", "L2 GUID", "L3 GUID", "MODEL GUID", "Activity GUID", "Object GUID", ]].rename(
                                columns={
                                'Rischio di Informativa Finanziaria (ex 262/2005)': 'level1GUID',
                                'L2 GUID': 'level2GUID',
                                'L3 GUID': 'level3GUID',
                                'MODEL GUID': 'modelGUID',
                                'Activity GUID': 'activityGUID',
                                'Object GUID': 'riskGUID'}).drop_duplicates()

    # Relational data
    activity_to_risk = activity_to_risk_dm(risks, activitiesClean, risksClean, processed_pth)
    risk_to_control = risk_to_control_dm(controls, risksClean, controlsClean, processed_pth)
    main = main_dm(data, level1Clean, level2Clean, level3Clean, modelClean, activitiesClean, actorsClean, risksClean, controlsClean, orgClean, activity_to_risk, risk_to_control)

    network = create_network(main)
    write_json(network["nodes"], os.path.join(processed_pth, "nested"), "nodes")
    write_json(network["links"], os.path.join(processed_pth, "nested"), "links")
    write_json(network["orgStructure"], os.path.join(processed_pth, "nested"), "org_structure")

    processesNested = create_processes_to_activities(main)
    write_json(processesNested, os.path.join(processed_pth, "nested"), "processes")

    lu = {
        "risk": create_lu(risksClean, "riskID", "risk"),
        "application": create_lu(applicationsClean, "applicationID", "application"),
        "activity": create_lu(activitiesClean, "activityID", "activity"),
        "actor": create_lu(actorsClean, "actorID", "actor"),
        "control": create_lu(controlsClean, "controlID", "control"),
        "level1": create_lu(level1Clean, "level1ID", "level1"),
        "level2": create_lu(level2Clean, "level2ID", "level2"),
        "level3": create_lu(level3Clean, "level3ID", "level3"),
        "model": create_lu(modelClean, "modelID", "model"),
        "processes": {"name": "root", "children": create_processes(main), "level": 0},
        "org_structure": create_org_structure(main)
    }

    write_json(lu, os.path.join(processed_pth, "nested"), "lu")

if __name__ == '__main__':
    main()