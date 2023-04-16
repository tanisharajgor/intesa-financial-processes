import pandas as pd
import os
import yaml
from python.data_management import actors_rename, activities_dm, actors_dm, risks_dm, \
    applications_dm, controls_dm, level1_dm, level2_dm, level3_dm, model_dm, \
    level1_to_level2_dm, level2_to_level3_dm, level3_to_model_dm, model_to_activity_dm, \
    activity_to_risk_dm, risk_to_control_dm, activity_to_actor_dm, activity_to_application_dm, main_dm, \
    level3_to_activity_dm

from python.nest_data import create_processes_to_activities, create_risk_control, \
     create_network, create_processes

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

    # ## Clean data
    activitiesClean = activities_dm(data, config, raw_pth, processed_pth)
    actorsClean = actors_dm(data, config, raw_pth, processed_pth)
    risksClean = risks_dm(risks, config, raw_pth, processed_pth)
    applicationsClean = applications_dm(applications, raw_pth, processed_pth)
    controlsClean = controls_dm(controls, config, raw_pth, processed_pth)
    level1Clean = level1_dm(data, raw_pth, processed_pth)
    level2Clean = level2_dm(data, raw_pth, processed_pth)
    level3Clean = level3_dm(data, raw_pth, processed_pth)
    modelClean = model_dm(data, raw_pth, processed_pth)

    data = data[["L1 GUID", "L2 GUID", "L3 GUID", "MODEL GUID", "activityGUID", "actorGUID"]].rename(
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
    level1_to_level2 = level1_to_level2_dm(data, level1Clean, level2Clean, processed_pth)
    level2_to_level3 = level2_to_level3_dm(data, level2Clean, level3Clean, processed_pth)
    level3_to_model = level3_to_model_dm(data, level3Clean, modelClean, processed_pth)
    model_to_activity = model_to_activity_dm(data, modelClean, activitiesClean, processed_pth)
    level3_to_activity = level3_to_activity_dm(level3_to_model, model_to_activity, processed_pth)
    activity_to_risk = activity_to_risk_dm(risks, activitiesClean, risksClean, processed_pth)
    activity_to_actor = activity_to_actor_dm(data, activitiesClean, actorsClean, processed_pth)
    activity_to_application = activity_to_application_dm(applications, activitiesClean, applicationsClean, processed_pth)
    risk_to_control = risk_to_control_dm(controls, risksClean, controlsClean, processed_pth)
    main = main_dm(data, level1Clean, level2Clean, level3Clean, activitiesClean, actorsClean, risksClean, controlsClean, activity_to_risk, risk_to_control)

    #da1a6f66-23f4-11eb-275f-001dd8b72a50

    import pdb; pdb.set_trace()

    network = create_network(main)
    write_json(network, os.path.join(processed_pth, "nested"), "network2")

    risksNested = create_risk_control(main)
    write_json(risksNested, os.path.join(processed_pth, "nested"), "risks")

    processesNested = create_processes_to_activities(main)
    write_json(processesNested, os.path.join(processed_pth, "nested"), "processes")

    processes = create_processes(main)
  
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
        "processes": {"name": "root", "children": processes, "treeLevel": 0}
    }

    write_json(lu, os.path.join(processed_pth, "nested"), "lu")

if __name__ == '__main__':
    main()
