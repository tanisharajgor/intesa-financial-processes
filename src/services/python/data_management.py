import pandas as pd
import os

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

    df[var_name + 'ID'] = df.groupby(var_name).ngroup() + n
    df = df[df[var_name + 'ID'] != -1]

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

    df = actors[["activityGUID", "activity", "activityType", "activityCategory"]].drop_duplicates()
    df = translate_config(df, config, 'activityType')
    df = translate_config(df, config, 'activityCategory')
    dfTranslated = pd.read_csv(os.path.join(raw_pth, "translated", "activities.csv")).rename(columns={'Italian': 'activity'})
    df = pd.merge(df, dfTranslated, on="activity", how="left").drop("activity", axis=1).rename(columns={'English': "activity"})
    df = num_id(df, "activity")
    df.activityCategory = df.activityCategory.fillna('Other')

    ## Write the cleaned data out
    df.drop('activityGUID', axis = 1).drop_duplicates().to_csv(os.path.join(processed_pth, 'main', 'activities' + ".csv"), index = False)

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
    df = num_id(df, "actor")

    ## Write the cleaned data out
    df.drop('actorGUID', axis = 1).drop_duplicates().to_csv(os.path.join(processed_pth, 'main', 'actors' + ".csv"), index = False)

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
    df = num_id(df, "risk")
    df = translate_config(df, config, 'riskType')
    df["financialDisclosureRisk"] = df.riskType == "Financial Information Risk (ex 262/2005)"

    ## Write the cleaned data out
    df.drop('riskGUID', axis = 1).drop_duplicates().to_csv(os.path.join(processed_pth, 'main', 'risks' + ".csv"), index = False)

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
    dfTranslated = pd.read_csv(os.path.join(raw_pth, "translated",  "controls.csv")).rename(columns={'Italian': 'control'})
    df = pd.merge(df, dfTranslated, on="control", how="left").drop("control", axis=1).rename(columns={'English': "control"})
    df = num_id(df, "control")
    df = df.rename(columns={'activityCategory': 'controlCategory'})
    df.controlCategory = df.controlCategory.fillna('Other')
    df['control'] = df['control'].replace(r"^ +", regex=True)
 
    ## Write the cleaned data out
    df.drop('controlGUID', axis = 1).drop_duplicates().to_csv(os.path.join(processed_pth, 'main', 'controls' + ".csv"), index = False)

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
    df = num_id(df, "level1")

    ## Write the cleaned data out
    df.drop('level1GUID', axis = 1).drop_duplicates().to_csv(os.path.join(processed_pth, 'main', 'level1' + ".csv"), index = False)

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
    df = num_id(df, "level2")

    ## Write the cleaned data out
    df.drop('level2GUID', axis = 1).drop_duplicates().to_csv(os.path.join(processed_pth, 'main', 'level2' + ".csv"), index = False)

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
    df = num_id(df, "level3")

    ## Write the cleaned data out
    df.drop('level3GUID', axis = 1).drop_duplicates().to_csv(os.path.join(processed_pth, 'main', 'level3' + ".csv"), index = False)

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
    df = num_id(df, "model")

    ## Write the cleaned data out
    df.drop('modelGUID', axis = 1).drop_duplicates().to_csv(os.path.join(processed_pth, 'main', 'model' + ".csv"), index = False)

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
    df = num_id(df, "application")

    ## Write the cleaned data out
    df.drop('applicationGUID', axis = 1).to_csv(os.path.join(processed_pth, 'main', 'applications' + ".csv"), index = False)

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

    df.to_csv(os.path.join(processed_pth, 'crosswalk', 'level1_level2' + ".csv"), index = False)

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

    df.to_csv(os.path.join(processed_pth, 'crosswalk', 'level2_level3' + ".csv"), index = False)

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

    df.to_csv(os.path.join(processed_pth, 'crosswalk', 'level3_model' + ".csv"), index = False)

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

    df.to_csv(os.path.join(processed_pth, 'crosswalk', 'model_activities' + ".csv"), index = False)

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

    df.to_csv(os.path.join(processed_pth, 'crosswalk', 'activities_risks' + ".csv"), index = False)

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

    df.to_csv(os.path.join(processed_pth, 'crosswalk', 'activities_actor' + ".csv"), index = False)

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

    df.to_csv(os.path.join(processed_pth, 'crosswalk', 'activities_application' + ".csv"), index = False)

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

    df.to_csv(os.path.join(processed_pth, 'crosswalk', 'risks_controls' + ".csv"), index = False)

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

    df.to_csv(os.path.join(processed_pth, 'crosswalk', 'main' + ".csv"), index = False)

    return df

def create_actor_activities_nodes(data, actors, activities):

    actors_activities = data[["activityGUID", "actorGUID"]]
    actors_activities = pd.merge(actors_activities, actors)
    actors_activities = pd.merge(actors_activities, activities)
    actors_activities.drop(["activityGUID", "actorGUID"], axis=1, inplace=True)
    actors_activities = actors_activities.drop_duplicates()

    actors_nodes = []

    for a in unique_int(actors_activities, "actorID"):

        actors_activities_sub = actors_activities[actors_activities.actorID == a]

        for i in unique_int(actors_activities_sub, "activityID"):

            act_sub = actors_activities_sub[actors_activities_sub.activityID == i]

            dictactivity = {"id": int(i),
                            "group": "activity",
                            "descr": act_sub.activity.iloc[0],
                            "type": act_sub.activityType.iloc[0],
                            "category": act_sub.activityCategory.iloc[0]}

        dictactor = {"id": int(a),
                    "group": "actor",
                    "descr": actors_activities_sub.actor.iloc[0],
                    "type": actors_activities_sub.actorType.iloc[0],
                    "nActivities": len(actors_activities_sub),
                    "activities": dictactivity}

        actors_nodes.append(dictactor)

    activities_nodes = []

    for j in unique_int(actors_activities, "activityID"):

        actors_activities_sub = actors_activities[actors_activities.activityID == j]

        for k in unique_int(actors_activities_sub, "actorID"):

            act_sub = actors_activities_sub[actors_activities_sub.actorID == k]

            dictactor = {"id": int(a),
                        "group": "actor",
                        "descr": act_sub.actor.iloc[0],
                        "type": act_sub.actorType.iloc[0],
                        "nActors": len(act_sub)}

        dictactivity = {"id": int(i),
                        "group": "activity",
                        "descr": actors_activities_sub.activity.iloc[0],
                        "type": actors_activities_sub.activityType.iloc[0],
                        "category": actors_activities_sub.activityCategory.iloc[0],
                        "actors": dictactor}

        activities_nodes.append(dictactivity)

    return actors_nodes + activities_nodes

"""
Creates links for network
param nodes object
return dictionary
"""
def create_links(nodes):

    links = []

    for node in nodes:

        if (node["group"] == "actor"):

            ka = node["activities"]

            for ab in ka:
                dict = {"source": int(ka["id"]),
                        "target": int(node["id"])}
                links.append(dict)

    return links
