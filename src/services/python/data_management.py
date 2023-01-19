import pandas as pd
import os
import numpy as np

from python.helper import unique_int

"""
Create a dataframe from a dictionary
"""
def dict_to_df(dictionary):

    return pd.DataFrame.from_dict(dictionary)

"""
Update Ids to numeric
param df dataframe
param var_name the variable id to convert to numeric
return dataframe
"""
def num_id(df, var_name, n = 0):

    new_var = var_name.removesuffix("GUID") + 'ID'
    df[new_var] = df.groupby(var_name).ngroup() + n
    df = df[df[new_var] != -1]

    return df


"""
Clean up strings
"""
def clean_strings(df, var):
    # df[var] = df[var].str.capitalize()
    df[var] = df[var].str.replace('"', '')
    df[var] = df[var].str.replace("'", '')

    return df

"""
Rename actors columns
return dataframe
"""
def actors_rename(actors):

    actors = actors.rename(columns={'Marchiatura': 'branding', 
                                    'Stato Pubblicato Function': 'function_published_status',
                                    'Stato Pubblicato Modello': 'model_published_status',
                                    'Stato Congelato Function': 'function_frozen_status',
                                    'Activity GUID': 'activityGUID',
                                    'Activity Name': 'activity',
                                    'Activity Type': 'activityType',
                                    'Activity Category': 'activityCategory',
                                    'Object Name': 'actor',
                                    'Object Type': 'actorType',
                                    'Object GUID': 'actorGUID'})

    return actors

def translate_config(df, config, colName):
    df = pd.merge(df, dict_to_df(config["translate"][colName]), on=colName, how="left").drop(colName, axis=1).rename(columns={colName+'English': colName})

    return df

"""
Data management steps for activities
return dataframe
"""
def activities_dm(actors, config, raw_pth, processed_pth):

    # import pdb; pdb.set_trace()

    df = actors[["activityGUID", "activity", "activityType", "activityCategory"]].drop_duplicates()
    df = translate_config(df, config, 'activityType')
    df = translate_config(df, config, 'activityCategory')
    dfTranslated = pd.read_csv(os.path.join(raw_pth, "translated", "activities.csv")).rename(columns={'Italian': 'activity'})
    df = pd.merge(df, dfTranslated, on="activity", how="left").drop("activity", axis=1).rename(columns={'English': "activity"})
    df = clean_strings(df, "activity")
    df = df[pd.isnull(df.activity) == False]
    df = num_id(df, "activityGUID", 100000)
    df.activityCategory = df.activityCategory.fillna('NA')

    ## Write the cleaned data out
    df.drop('activityGUID', axis = 1).drop_duplicates().to_csv(os.path.join(processed_pth, 'relational', 'activities' + ".csv"), index = False)

    return df

"""
Data management steps for actors
return dataframe
"""
def actors_dm(actors, config, raw_pth, processed_pth):

    df = actors[actors["Obsolete Object"] != "Obsoleto"]
    df = df[["actorGUID", "actorType", "actor"]].drop_duplicates() # drop duplicates
    df = translate_config(df, config, 'actorType')
    dfTranslated = pd.read_csv(os.path.join(raw_pth, "translated", "actors.csv")).rename(columns={'Italian': 'actor'})
    df = pd.merge(df, dfTranslated, on="actor", how="left").drop("actor", axis=1).rename(columns={'English': "actor"})
    df = clean_strings(df, "actor")
    df = df[pd.isnull(df.actor) == False]
    df = num_id(df, "actorGUID")

    ## Write the cleaned data out
    df.drop('actorGUID', axis = 1).drop_duplicates().to_csv(os.path.join(processed_pth, 'relational', 'actors' + ".csv"), index = False)

    return df

"""
Data management steps for risks
return dataframe
"""
def risks_dm(risks, config, raw_pth, processed_pth):

    df = risks[risks["Obsolete Object"] != "Obsoleto"]
    df = df.rename(columns={
                                'Object Name': 'risk',
                                'Object GUID': 'riskGUID',
                                'Tipo': 'riskType'})
    df = df[["riskGUID", "risk", "riskType"]].drop_duplicates() # drop duplicates
    dfTranslated = pd.read_csv(os.path.join(raw_pth, "translated", "risks.csv")).rename(columns={'Italian': 'risk'})
    df = pd.merge(df, dfTranslated, on="risk", how="left").drop("risk", axis=1).rename(columns={'English': "risk"})
    df = clean_strings(df, "risk")
    df = df[pd.isnull(df.risk) == False]
    df = num_id(df, "riskGUID")
    df = translate_config(df, config, 'riskType')
    df["financialDisclosureRisk"] = df.riskType == "Financial Information Risk (ex 262/2005)"

    ## Write the cleaned data out
    df.drop('riskGUID', axis = 1).drop_duplicates().to_csv(os.path.join(processed_pth, 'relational', 'risks' + ".csv"), index = False)

    return df

"""
Data management steps for controls
return dataframe
"""
def controls_dm(controls, config, raw_pth, processed_pth):

    df = controls.rename(columns={
                                'Activity Name': 'control',
                                'Activity GUID': 'controlGUID',
                                'Activity Category': 'activityCategory',
                                'Tipo': 'controlType',
                                'Periodicità': 'controlPeriodocity'})
    df = df[["controlGUID", "control", "activityCategory", "controlType", "controlPeriodocity"]].drop_duplicates() # drop duplicates
    df = translate_config(df, config, 'activityCategory')
    df = translate_config(df, config, 'controlType')
    df = translate_config(df, config, 'controlPeriodocity')
    dfTranslated = pd.read_csv(os.path.join(raw_pth, "translated", "controls.csv")).rename(columns={'Italian': 'control'})
    df = pd.merge(df, dfTranslated, on="control", how="left").drop("control", axis=1).rename(columns={'English': "control"})
    df = clean_strings(df, "control")
    df = df[pd.isnull(df.control) == False]
    df = num_id(df, "controlGUID")
    df = df.rename(columns={'activityCategory': 'controlCategory'})
    df.controlCategory = df.controlCategory.fillna('NA')
    df['control'] = df['control'].replace(r"^ +", regex=True)
 
    ## Write the cleaned data out
    df.drop('controlGUID', axis = 1).drop_duplicates().to_csv(os.path.join(processed_pth, 'relational', 'controls' + ".csv"), index = False)

    return df

"""
Data management steps for level1
return dataframe
"""
def level1_dm(data, raw_pth, processed_pth):

    df = data.rename(columns={
                                'L1 NAME': 'level1',
                                'L1 GUID': 'level1GUID'})

    df = df[["level1", "level1GUID"]].drop_duplicates() # drop duplicates
    dfTranslated = pd.read_csv(os.path.join(raw_pth, "translated", "level1.csv")).rename(columns={'Italian': 'level1'})
    df = pd.merge(df, dfTranslated, on="level1", how="left").drop("level1", axis=1).rename(columns={'English': "level1"})
    df = clean_strings(df, "level1")
    df = df[pd.isnull(df.level1) == False]
    df = num_id(df, "level1GUID")

    ## Write the cleaned data out
    df.drop('level1GUID', axis = 1).drop_duplicates().to_csv(os.path.join(processed_pth, 'relational', 'level1' + ".csv"), index = False)

    return df

"""
Data management steps for level2
return dataframe
"""
def level2_dm(data, raw_pth, processed_pth):

    df = data.rename(columns={
                                'L2 NAME': 'level2',
                                'L2 GUID': 'level2GUID'})
    df = df[["level2", "level2GUID"]].drop_duplicates() # drop duplicates
    dfTranslated = pd.read_csv(os.path.join(raw_pth, "translated", "level2.csv")).rename(columns={'Italian': 'level2'})
    df = pd.merge(df, dfTranslated, on="level2", how="left").drop("level2", axis=1).rename(columns={'English': "level2"})
    df = clean_strings(df, "level2")
    df = df[pd.isnull(df.level2) == False]
    df = num_id(df, "level2GUID")

    ## Write the cleaned data out
    df.drop('level2GUID', axis = 1).drop_duplicates().to_csv(os.path.join(processed_pth, 'relational', 'level2' + ".csv"), index = False)

    return df

"""
Data management steps for level3
return dataframe
"""
def level3_dm(data, raw_pth, processed_pth):

    df = data.rename(columns={
                                'L3 NAME': 'level3',
                                'L3 GUID': 'level3GUID'})
    df = df[["level3", "level3GUID"]].drop_duplicates() # drop duplicates
    dfTranslated = pd.read_csv(os.path.join(raw_pth, "translated", "level3.csv")).rename(columns={'Italian': 'level3'})
    df = pd.merge(df, dfTranslated, on="level3", how="left").drop("level3", axis=1).rename(columns={'English': "level3"})
    df = clean_strings(df, "level3")
    df = df[pd.isnull(df.level3) == False]
    df = num_id(df, "level3GUID")

    ## Write the cleaned data out
    df.drop('level3GUID', axis = 1).drop_duplicates().to_csv(os.path.join(processed_pth, 'relational', 'level3' + ".csv"), index = False)

    return df

"""
Data management steps for level3
return dataframe
"""
def model_dm(data, raw_pth, processed_pth):

    df = data.rename(columns={
                                'MODEL NAME ITA': 'model',
                                'MODEL GUID': 'modelGUID'})
    df = df[["model", "modelGUID"]].drop_duplicates() # drop duplicates
    dfTranslated = pd.read_csv(os.path.join(raw_pth, "translated", "model.csv")).rename(columns={'Italian': 'model'})
    df = pd.merge(df, dfTranslated, on="model", how="left").drop("model", axis=1).rename(columns={'English': "model"})
    df = clean_strings(df, "model")
    df = df[pd.isnull(df.model) == False]
    df = num_id(df, "modelGUID")

    ## Write the cleaned data out
    df.drop('modelGUID', axis = 1).drop_duplicates().to_csv(os.path.join(processed_pth, 'relational', 'model' + ".csv"), index = False)

    return df

"""
Data management steps for applications
return dataframe
"""
def applications_dm(applications, raw_pth, processed_pth):

    df = applications[applications["Obsolete Object"] != "Obsoleto"]
    df = df.rename(columns={
                                'Object Name': 'application',
                                'Object GUID': 'applicationGUID'})
    df = df[["applicationGUID", "application"]].drop_duplicates() # drop duplicates
    dfTranslated = pd.read_csv(os.path.join(raw_pth, "translated", "applications.csv")).rename(columns={'Italian': 'application'})
    df = pd.merge(df, dfTranslated, on="application", how="left").drop("application", axis=1).rename(columns={'English': "application"})
    df = clean_strings(df, "application")
    df = df[pd.isnull(df.application) == False]
    df = num_id(df, "applicationGUID")

    ## Write the cleaned data out
    df.drop('applicationGUID', axis = 1).to_csv(os.path.join(processed_pth, 'relational', 'applications' + ".csv"), index = False)

    return df

"""
Crosswalk between level1 and level2
"""
def level1_to_level2_dm(data, level1, level2, processed_pth):
    df = data[["level1GUID", "level2GUID"]].drop_duplicates()
    df = pd.merge(df, level1, on="level1GUID", how="left").drop("level1GUID", axis=1)
    df = pd.merge(df, level2, on="level2GUID", how="left").drop("level2GUID", axis=1)

    df = df.drop_duplicates()[["level1ID", "level2ID"]]
    df = df[(pd.isnull(df.level1ID) == False) & (pd.isnull(df.level2ID) == False)]
    df['level1ID'] = pd.to_numeric(df['level1ID'], errors='coerce').astype(int)
    df['level2ID'] = pd.to_numeric(df['level2ID'], errors='coerce').astype(int)

    df.to_csv(os.path.join(processed_pth, 'relational', 'level1_level2' + ".csv"), index = False)

    return df

"""
Crosswalk between level2 and level3
"""
def level2_to_level3_dm(data, level2, level3, processed_pth):
    df = data[["level2GUID", "level3GUID"]].drop_duplicates()
    df = pd.merge(df, level2, on="level2GUID", how="left").drop("level2GUID", axis=1)
    df = pd.merge(df, level3, on="level3GUID", how="left").drop("level3GUID", axis=1)
    df = df.drop_duplicates()[["level2ID", "level3ID"]]
    df = df[(pd.isnull(df.level2ID) == False) & (pd.isnull(df.level3ID) == False)]
    df['level2ID'] = pd.to_numeric(df['level2ID'], errors='coerce').astype(int)
    df['level3ID'] = pd.to_numeric(df['level3ID'], errors='coerce').astype(int)

    df.to_csv(os.path.join(processed_pth, 'relational', 'level2_level3' + ".csv"), index = False)

    return df

"""
Crosswalk between level3 and model
"""
def level3_to_model_dm(data, level3, model, processed_pth):
    df = data[["level3GUID", "modelGUID"]].drop_duplicates()
    df = pd.merge(df, level3, on="level3GUID", how="left").drop("level3GUID", axis=1)
    df = pd.merge(df, model, on="modelGUID", how="left").drop("modelGUID", axis=1)
    df = df.drop_duplicates()[["level3ID", "modelID"]]
    df = df[(pd.isnull(df.level3ID) == False) & (pd.isnull(df.modelID) == False)]
    df['level3ID'] = pd.to_numeric(df['level3ID'], errors='coerce').astype(int)
    df['modelID'] = pd.to_numeric(df['modelID'], errors='coerce').astype(int)

    df.to_csv(os.path.join(processed_pth, 'relational', 'level3_model' + ".csv"), index = False)

    return df

"""
Crosswalk between models and activities
"""
def model_to_activity_dm(data, model, activities, processed_pth):
    df = data[["modelGUID", "activityGUID"]].drop_duplicates()
    df = pd.merge(df, model, on="modelGUID", how="left").drop("modelGUID", axis=1)
    df = pd.merge(df, activities, on="activityGUID", how="left").drop("activityGUID", axis=1)
    df = df.drop_duplicates()[["modelID", "activityID"]]
    df = df[(pd.isnull(df.modelID) == False) & (pd.isnull(df.activityID) == False)]
    df['modelID'] = pd.to_numeric(df['modelID'], errors='coerce').astype(int)
    df['activityID'] = pd.to_numeric(df['activityID'], errors='coerce').astype(int)

    df.to_csv(os.path.join(processed_pth, 'relational', 'model_activities' + ".csv"), index = False)

    return df

"""
Crosswalk between level 3 and activities
"""
def level3_to_activity_dm(level3_to_model, model_to_activity, processed_pth):

    df = pd.merge(level3_to_model, model_to_activity)[["level3ID", "activityID"]].drop_duplicates()
    df = df[(pd.isnull(df.level3ID) == False) & (pd.isnull(df.activityID) == False)]
    df['level3ID'] = pd.to_numeric(df['level3ID'], errors='coerce').astype(int)
    df['activityID'] = pd.to_numeric(df['activityID'], errors='coerce').astype(int)

    df.to_csv(os.path.join(processed_pth, 'relational', 'level3_activities' + ".csv"), index = False)

    return df

"""
Crosswalk between activities and risks
"""
def activity_to_risk_dm(risks, activities, risk, processed_pth):

    df = pd.merge(risks, activities, on="activityGUID", how="left").drop("activityGUID", axis=1)
    df = pd.merge(df, risk, on="riskGUID", how="left").drop("riskGUID", axis=1)
    df = df.drop_duplicates()[["activityID", "riskID"]]
    df = df[(pd.isnull(df.activityID) == False) & (pd.isnull(df.riskID) == False)]
    df['activityID'] = pd.to_numeric(df['activityID'], errors='coerce').astype(int)
    df['riskID'] = pd.to_numeric(df['riskID'], errors='coerce').astype(int)

    df.to_csv(os.path.join(processed_pth, 'relational', 'activities_risks' + ".csv"), index = False)

    return df

"""
Crosswalk between activities and actors
"""
def activity_to_actor_dm(data, activities, actors, processed_pth):

    df = pd.merge(data, activities, on="activityGUID", how="left").drop("activityGUID", axis=1)
    df = pd.merge(df, actors, on="actorGUID", how="left").drop("actorGUID", axis=1)
    df = df.drop_duplicates()[["activityID", "actorID"]]

    df = df[(pd.isnull(df.activityID) == False) & (pd.isnull(df.actorID) == False)]
    df['activityID'] = pd.to_numeric(df['activityID'], errors='coerce').astype(int)
    df['actorID'] = pd.to_numeric(df['actorID'], errors='coerce').astype(int)

    df.to_csv(os.path.join(processed_pth, 'relational', 'activities_actor' + ".csv"), index = False)

    return df

"""
Crosswalk between activities and applications
"""
def activity_to_application_dm(applications, activities, application, processed_pth):

    applications = applications.rename(columns={
                        'Activity GUID': 'activityGUID',
                        'Object GUID': 'applicationGUID'})

    df = pd.merge(applications, activities, on="activityGUID", how="left").drop("activityGUID", axis=1)
    df = pd.merge(df, application, on="applicationGUID", how="left").drop("applicationGUID", axis=1)
    df = df.drop_duplicates()[["activityID", "applicationID"]]

    df = df[(pd.isnull(df.activityID) == False) & (pd.isnull(df.applicationID) == False)]
    df['activityID'] = pd.to_numeric(df['activityID'], errors='coerce').astype(int)
    df['applicationID'] = pd.to_numeric(df['applicationID'], errors='coerce').astype(int)

    df.to_csv(os.path.join(processed_pth, 'relational', 'activities_application' + ".csv"), index = False)

    return df

"""
Crosswalk between risks and controls
"""
def risk_to_control_dm(controls, risks, control, processed_pth):

    df = controls[["Activity GUID", "Object GUID"]].rename(columns={
                                'Activity GUID': 'controlGUID',
                                'Object GUID': 'riskGUID'}).drop_duplicates()
    df = pd.merge(df, risks, on="riskGUID", how="left").drop("riskGUID", axis=1)
    df = pd.merge(df, control, on="controlGUID", how="left").drop("controlGUID", axis=1)
    df = df.drop_duplicates()[["riskID", "controlID"]]
    df = df[(pd.isnull(df.riskID) == False) & (pd.isnull(df.controlID) == False)]
    df['riskID'] = pd.to_numeric(df['riskID'], errors='coerce').astype(int)
    df['controlID'] = pd.to_numeric(df['controlID'], errors='coerce').astype(int)

    df.to_csv(os.path.join(processed_pth, 'relational', 'risks_controls' + ".csv"), index = False)

    return df

"""
Main crosswalk
"""
def main_dm(processed_pth, level1_to_level2, level2_to_level3, level3_to_model, model_to_activity, activity_to_risk, risk_to_control):

    df = pd.merge(level1_to_level2, level2_to_level3, on = "level2ID", how = "left")
    df = pd.merge(df, level3_to_model, on = "level3ID", how = "left")
    df = pd.merge(df, model_to_activity, on = "modelID", how = "left")
    df = pd.merge(df, activity_to_risk, on = "activityID", how = "left")
    df = pd.merge(df, risk_to_control, on = "riskID", how = "left")

    df.to_csv(os.path.join(processed_pth, 'relational', 'main' + ".csv"), index = False)

    return df

"""
"""
def dm_actor_activities_nodes(data, actors, activities):
    actors_activities = data[["activityGUID", "actorGUID"]]
    actors_activities = pd.merge(actors_activities, actors)
    actors_activities = pd.merge(actors_activities, activities)
    actors_activities.drop(["activityGUID", "actorGUID"], axis=1, inplace=True)
    actors_activities = actors_activities.drop_duplicates()

    return actors_activities

def dm_actors_nodes(actors_activities):

    actors_nodes = []

    for i in unique_int(actors_activities, "actorID"):

        actors_activities_sub = actors_activities[actors_activities.actorID == i]

        dictactor = {"id": int(i),
                    "group": "actor",
                    "descr": actors_activities_sub.actor.iloc[0],
                    "type": actors_activities_sub.actorType.iloc[0],
                    "nActivities": len(actors_activities_sub),
                    "activitiesIDs": actors_activities_sub.activityID.unique().tolist()
                    }

        # activities_nodes = []
        # for j in unique_int(actors_activities_sub, "activityID"):

        #     dictactivity = {"id": int(j),
        #                     "group": "activity",
        #                     "descr": actors_activities_sub[actors_activities_sub.activityID == j].activity.iloc[0],
        #                     # "type": actors_activities_sub[actors_activities_sub.activityID == j].activityType.iloc[0],
        #                     "category": actors_activities_sub[actors_activities_sub.activityID == j].activityCategory.iloc[0]}

        #     activities_nodes.append(dictactivity)

        # dictactor["activities"] = activities_nodes
        actors_nodes.append(dictactor)

    return actors_nodes

def dm_activities_nodes(actors_activities):
    activities_nodes = []

    for i in unique_int(actors_activities, "activityID"):

        actors_activities_sub = actors_activities[actors_activities.activityID == i]

        dictactivity = {"id": int(i),
                        "group": "activity",
                        "descr": actors_activities_sub.activity.iloc[0],
                        "type": actors_activities_sub.activityType.iloc[0],
                        "category": actors_activities_sub.activityCategory.iloc[0],
                        "nActors": len(actors_activities_sub),
                        "actorIDs": actors_activities_sub.actorID.unique().tolist()
                        }

        # actors_nodes = []

        # for j in unique_int(actors_activities_sub, "actorID"):

        #     dictactor = {"id": int(j),
        #                 "group": "actor",
        #                 "descr": actors_activities_sub[actors_activities_sub.actorID == j].actor.iloc[0],
        #                 # "type": actors_activities_sub[actors_activities_sub.actorID == j].actorType.iloc[0],
        #                 "nActors": len(actors_activities_sub[actors_activities_sub.actorID == j])}

        #     actors_nodes.append(dictactor)

        # dictactivity["actor"] = actors_nodes
        activities_nodes.append(dictactivity)

    return activities_nodes

def create_actor_activities_nodes(data, actors, activities):

    actors_activities = dm_actor_activities_nodes(data, actors, activities)

    actors_nodes = dm_actors_nodes(actors_activities)
    activities_nodes = dm_activities_nodes(actors_activities)

    return actors_nodes + activities_nodes

"""
Creates links for network
param nodes object
return dictionary
"""
def create_links(data, actors, activities):

    links = []

    actors_activities =  dm_actor_activities_nodes(data, actors, activities)

    for i in range(0, actors_activities.shape[0]):

        dict = {"source": int(actors_activities.iloc[i].actorID),
                "target": int(actors_activities.iloc[i].activityID)}

        links.append(dict)

    return links

"""
Nest the activity attributes
"""
def create_attributes(xwalk, lu, id, root1, root2):

    root1ID = root1+"ID"
    root2ID = root2+"ID"
    df = pd.merge(xwalk[xwalk[root1ID] == id], lu, how="left", on=root2ID)

    attributes = {}

    if df.shape[0] > 0:
        attributes[root2+"N"] = df.shape[0]
        if root2+"Type" in df.columns:
            attributes[root2+"Mode"] = df.mode()[root2+"Type"].iloc[0]

        array = []
        row = {}
        for i in unique_int(df, root2ID):
            row = {"id": int(i),
                   "name": df[df[root2ID] == i][root2].iloc[0]}

            if root2+"Type" in df.columns:
                row["typeMode"] = df[df[root2ID] == i][root2+"Type"].iloc[0]

            array.append(row)
        attributes["attributes"] = array

    return attributes

"""
Nest controls in risks
return dictionary
"""
def nest_risk_control(risk_to_control, risk, control):

    array = []
    ids = unique_int(risk_to_control, "riskID")

    for id in ids:

        attr = create_attributes(risk_to_control, control, id, "risk", "control")
        dict = {"id": int(id),
                "name": risk[risk.riskID == id].risk.iloc[0],
                "financialDisclosureRisk": bool(risk[risk.riskID == id].financialDisclosureRisk.iloc[0]),
                "children": attr,
                "controlTypeMode": attr["controlMode"],
                "controlN": len(attr["attributes"])}

        array.append(dict)

    return array

def test_list_boolean(list, boolName):
    if len([i for i in list if i[boolName]]) > 0:
        bool = True
    else:
        bool = False
    
    return bool

"""
Combines two lookup tables using a crosswalk
"""
def relate_tables(lu1, lu2, xwalk, root1, root2):

    root1ID = root1+"ID"
    root2ID = root2+"ID"

    df = pd.merge(xwalk, lu2, how="left", on=root2ID)
    df = pd.merge(df, lu1, how="left", on=root1ID)
    df.replace('NA', np.nan, inplace=True)

    return df

"""
Creates a risk status attribute at the activity level
return nested list
"""
def create_risk_status(df, rtc, root1, id):

    root1ID = root1+"ID"
    temp = pd.merge(df[df[root1ID] == id], rtc, how="left", on=["riskID", "controlID"])
    temp = temp[pd.isnull(temp.riskID) == False]

    if temp.shape[0] > 0:

        temp['riskID'] = pd.to_numeric(temp['riskID'], errors='coerce').astype(int)
        temp.controlType = temp.controlType.fillna('NA')
        temp.controlPeriodocity = temp.controlPeriodocity.fillna('NA')

        row = {"nRisks": int(temp.riskID.nunique()),
               "riskID": temp.riskID.unique().tolist()}
        
        if pd.isnull(temp.controlType).iloc[0]:
            controlTypeMode = "NA"
        else:
            controlTypeMode = temp.controlType.mode().iloc[0]

        if pd.isnull(temp.controlPeriodocity).iloc[0]:
            controlPeriodocityMode = "NA"
        else:
            controlPeriodocityMode = temp.controlPeriodocity.mode().iloc[0]

        row = {"controlTypeMode": controlTypeMode,
               "controlPeriodocityMode": controlPeriodocityMode,
               "financialDisclosureRiskAny": bool(any(temp.financialDisclosureRisk))}
    else:
        row = {"nRisks": int(0)}

    return row

"""
"""
def nest_activities_to_risks(activities, risks, controls, level3_to_activities, activity_to_risk, risk_to_control):

    array = []

    ids = unique_int(level3_to_activities, "activityID")

    for id in ids:

        dict = {"id": int(id),
                "name": activities[activities.activityID == id].activity.iloc[0],
                "category": activities[activities.activityID == id].activityCategory.iloc[0]
                }

        risk_status = create_risk_status(risks, controls, activities, risk_to_control, activity_to_risk[activity_to_risk.activityID == id])

        if len(risk_status) != 0:
            dict["risks"] = risk_status
            dict["financialDisclosureRiskAny"] = bool(risk_status['riskStatus']['financialDisclosureRiskAny'])
            dict["controlTypeMode"] = risk_status['riskStatus']['controlTypeMode']
            dict["controlPeriodocityMode"] = risk_status['riskStatus']['controlPeriodocityMode']
            dict["nRisks"] = int(risk_status['nRisks'])

        else:
            dict["risks"] = {"nRisks": int(0),
                            "financialDisclosureRiskAny": bool(False),
                            "controlTypeMode": "NA",
                            "controlPeriodocityMode": "NA"}

        array.append(dict)

    return array

"""
"""
def subset_list(ids, l):
    array = []
    for i in l:

        if i["id"] in ids:
            array.append(i)
    
    return array

"""
Nest sub processes
Return object
"""
def nest_sub_processes(df, rtc, xwalk, root1df, root1, root2, children = None, tree_level = None):

    root1ID = root1+"ID"
    root2ID = root2+"ID"

    ids = unique_int(xwalk, root1ID)
    array = []
    
    for id in ids:

        childrenIDs = xwalk[xwalk[root1ID] == id][root2ID].unique().tolist()
        d = {"id": int(id),
            "name": root1df[root1df[root1ID] == id][root1].iloc[0],
            "childrenIDs": childrenIDs,
            "riskStatus": create_risk_status(df, rtc, root1, id),
            "treeLevel": int(tree_level)
            }

        if children is not None:
            d["children"] = subset_list(childrenIDs, children)

        array.append(d)

    return array

"""
Nest processes
Return object
"""
def nest_processes(level1_to_level2, level2_to_level3, level3_to_activity, activity_to_risk, risk_to_control, level1, level2, level3, activities, risks, controls):

    rtc = relate_tables(risks, controls, risk_to_control, root1 = "risk", root2 = "control")

    df = pd.merge(level1_to_level2, level2_to_level3, how="left", on="level2ID")
    df = pd.merge(df, level3_to_activity, how="left", on="level3ID")
    df = pd.merge(df, activity_to_risk, how="left", on="activityID")
    df = pd.merge(df, risk_to_control, how="left", on="riskID")

    nest4 = nest_sub_processes(df, rtc, activity_to_risk, activities, "activity", "risk", None, 4)
    nest3 = nest_sub_processes(df, rtc, level3_to_activity, level3, "level3", "activity", nest4, 3)
    nest2 = nest_sub_processes(df, rtc, level2_to_level3, level2, "level2", "level3", nest3, 2)
    nest1 = nest_sub_processes(df, rtc, level1_to_level2, level1, "level1", "level2", nest2, 1)

    return {"name": "root", 
            "children": nest1,  
            "childrenIDs": level1_to_level2.level1ID.unique().tolist(),
            "riskStatus": "NA",
            "treeLevel": int(0)}

"""
Nest activities attributes
"""
def nest_activities(activities, actors, risks, applications, activity_to_actor, activity_to_risk, activity_to_application):

    array = []

    for id in unique_int(activities, "activityID"):

        dictact = {
            "id": int(id),
            "actors": create_attributes(activity_to_actor, actors, id, "activity", "actor"),
            "risks": create_attributes(activity_to_risk, risks, id, "activity", "risk"),
            "applications": create_attributes(activity_to_application, applications, id, "activity", "application")
        }

        array.append(dictact)

    return array



def create_network(data, level3, actors, activities):

    array = []

    data = pd.merge(data, level3, how="inner", on="level3GUID")

    for i in data.level3ID.unique():

        df = data[data.level3ID == i].drop_duplicates()
        df = pd.merge(df, actors, how="inner", on="actorGUID")
        df = pd.merge(df, activities, how="inner", on="activityGUID")

        actorsID = df.actorID.unique()
        activitiesID = df.activityID.unique()

        actorsArray = []
        activitiesArray = []
        links = []

        for j in range(0, df.shape[0] - 1):
            linkRow = {"target": int(df.actorID.iloc[j]),
                       "source": int(df.activityID.iloc[j])}

            links.append(linkRow)

        for k in actorsID:
            actorRow = {"id": int(k),
                        "group": "actor"}

            actorsArray.append(actorRow)

        for l in activitiesID:
            activityRow = {"id": int(l),
                           "group": "activity"}

            activitiesArray.append(activityRow)

        # import pdb; pdb.set_trace()
        nodes = actorsArray + activitiesArray

        # import pdb; pdb.set_trace()
        network = {
            "id": int(i),
            "nodes": nodes,
            "links": links
        }
    
        array.append(network)

    return array
