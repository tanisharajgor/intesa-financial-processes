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

    activities = actors[["activityGUID", "activity", "activityType", "activityCategory"]].drop_duplicates()
    activities = translate_config(activities, config, 'activityType')
    activities = translate_config(activities, config, 'activityCategory')
    activitiesTranslated = pd.read_csv(os.path.join(raw_pth, "activities_translated.csv")).rename(columns={'Italian': 'activity'})
    activities = pd.merge(activities, activitiesTranslated, on="activity", how="left").drop("activity", axis=1).rename(columns={'English': "activity"})
    activities = num_id(activities, "activity")
    activities.activityCategory = activities.activityCategory.fillna('Other')

    ## Write the cleaned data out
    activities.to_csv(os.path.join(processed_pth, 'activities' + ".csv"), index = False)

    return activities

"""
Data management steps for actors
return dataframe
"""
def actors_dm(actors, config, raw_pth, processed_pth):

    actors = actors[actors["Obsolete Object"] != "Obsoleto"]
    actors = actors[["actorGUID", "actorType", "actor"]].drop_duplicates() # drop duplicates
    actors = translate_config(actors, config, 'actorType')
    actorsTranslated = pd.read_csv(os.path.join(raw_pth, "actors_translated.csv")).rename(columns={'Italian': 'actor'})
    actors = pd.merge(actors, actorsTranslated, on="actor", how="left").drop("actor", axis=1).rename(columns={'English': "actor"})
    actors = num_id(actors, "actor")

    ## Write the cleaned data out
    actors.to_csv(os.path.join(processed_pth, 'actors' + ".csv"), index = False)

    return actors

"""
Data management steps for risks
return dataframe
"""
def risks_dm(risks, raw_pth, processed_pth):

    risks = risks[risks["Obsolete Object"] != "Obsoleto"]
    risks = risks.rename(columns={
                                'Object Name': 'risk',
                                'Object GUID': 'riskGUID'})
    risks = risks[["riskGUID", "risk"]].drop_duplicates() # drop duplicates
    risksTranslated = pd.read_csv(os.path.join(raw_pth, "risks_translated.csv")).rename(columns={'Italian': 'risk'})
    risks = pd.merge(risks, risksTranslated, on="risk", how="left").drop("risk", axis=1).rename(columns={'English': "risk"})
    risks = num_id(risks, "risk")

    ## Write the cleaned data out
    risks.to_csv(os.path.join(processed_pth, 'risks' + ".csv"), index = False)

    return risks

"""
Data management steps for controls
return dataframe
"""
def controls_dm(controls, config, raw_pth, processed_pth):

    controls = controls.rename(columns={
                                'Activity Name': 'control',
                                'Activity GUID': 'controlGUID',
                                'Activity Category': 'activityCategory'})
    controls = controls[["controlGUID", "control", "activityCategory"]].drop_duplicates() # drop duplicates
    controls = translate_config(controls, config, 'activityCategory')
    controlsTranslated = pd.read_csv(os.path.join(raw_pth, "controls_translated.csv")).rename(columns={'Italian': 'control'})
    controls = pd.merge(controls, controlsTranslated, on="control", how="left").drop("control", axis=1).rename(columns={'English': "control"})
    controls = num_id(controls, "control")
    controls = controls.rename(columns={'activityCategory': 'controlCategory'})
    controls.controlCategory = controls.controlCategory.fillna('Other')

    ## Write the cleaned data out
    controls.to_csv(os.path.join(processed_pth, 'controls' + ".csv"), index = False)

    return controls

"""
Data management steps for level1
return dataframe
"""
def level1_dm(data, raw_pth, processed_pth):

    level1 = data.rename(columns={
                                'L1 NAME': 'level1',
                                'L1 GUID': 'level1GUID'})

    level1 = level1[["level1", "level1GUID"]].drop_duplicates() # drop duplicates
    level1Translated = pd.read_csv(os.path.join(raw_pth, "level1_translated.csv")).rename(columns={'Italian': 'level1'})
    level1 = pd.merge(level1, level1Translated, on="level1", how="left").drop("level1", axis=1).rename(columns={'English': "level1"})
    level1 = num_id(level1, "level1")

    ## Write the cleaned data out
    level1.to_csv(os.path.join(processed_pth, 'level1' + ".csv"), index = False)

    return level1

"""
Data management steps for level2
return dataframe
"""
def level2_dm(data, raw_pth, processed_pth):

    level2 = data.rename(columns={
                                'L2 NAME': 'level2',
                                'L2 GUID': 'level2GUID'})
    level2 = level2[["level2", "level2GUID"]].drop_duplicates() # drop duplicates
    level2Translated = pd.read_csv(os.path.join(raw_pth, "level2_translated.csv")).rename(columns={'Italian': 'level2'})
    level2 = pd.merge(level2, level2Translated, on="level2", how="left").drop("level2", axis=1).rename(columns={'English': "level2"})
    level2 = num_id(level2, "level2")

    ## Write the cleaned data out
    level2.to_csv(os.path.join(processed_pth, 'level2' + ".csv"), index = False)

    return level2

"""
Data management steps for level3
return dataframe
"""
def level3_dm(data, raw_pth, processed_pth):

    level3 = data.rename(columns={
                                'L3 NAME': 'level3',
                                'L3 GUID': 'level3GUID'})
    level3 = level3[["level3", "level3GUID"]].drop_duplicates() # drop duplicates
    level3Translated = pd.read_csv(os.path.join(raw_pth, "level3_translated.csv")).rename(columns={'Italian': 'level3'})
    level3 = pd.merge(level3, level3Translated, on="level3", how="left").drop("level3", axis=1).rename(columns={'English': "level3"})
    level3 = num_id(level3, "level3")

    ## Write the cleaned data out
    level3.to_csv(os.path.join(processed_pth, 'level3' + ".csv"), index = False)

    return level3

"""
Data management steps for applications
return dataframe
"""
def applications_dm(applications, raw_pth, processed_pth):

    applications = applications[applications["Obsolete Object"] != "Obsoleto"]
    applications = applications.rename(columns={
                                'Object Name': 'application',
                                'Object GUID': 'applicationGUID'})
    applications = applications[["applicationGUID", "application"]].drop_duplicates() # drop duplicates
    applicationsTranslated = pd.read_csv(os.path.join(raw_pth, "applications_translated.csv")).rename(columns={'Italian': 'application'})
    applications = pd.merge(applications, applicationsTranslated, on="application", how="left").drop("application", axis=1).rename(columns={'English': "application"})
    applications = num_id(applications, "application")

    ## Write the cleaned data out
    applications.to_csv(os.path.join(processed_pth, 'applications' + ".csv"), index = False)

    return applications

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
