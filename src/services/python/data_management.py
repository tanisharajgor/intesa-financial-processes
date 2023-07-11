import pandas as pd
import os
import numpy as np
import math
import re

"""
Create a dataframe from a dictionary
"""
def dict_to_df(dictionary):

    return pd.DataFrame.from_dict(dictionary)

def activity_id(activities, controls):

    act = activities.activityGUID.unique()
    con = controls.controlGUID.unique()

    df = pd.DataFrame(data={"activityGUID": np.unique(np.concatenate((act, con))),
                            "controlGUID": np.unique(np.concatenate((act, con)))})
    df["activityID"] = df.groupby("activityGUID").ngroup() + 100000
    df["controlID"] = df.groupby("controlGUID").ngroup() + 100000

    return df

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
    # df[var] = df[var].str.title()
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
                                    'Object GUID': 'actorGUID',
                                    '3rd path': 'organizational_structure1',
                                    '4th path': 'organizational_structure2'})

    return actors

def translate_config(df, config, colName):
    df = pd.merge(df, dict_to_df(config["translate"][colName]), on=colName, how="left").drop(colName, axis=1).rename(columns={colName+'English': colName})

    return df

"""
Data management steps for activities
Return a dataframe unique on activity
"""
def activities_dm(actors, controls, config, raw_pth, processed_pth):

    df = actors[["activityGUID", "activity", "activityType", "activityCategory"]].drop_duplicates()
    df = translate_config(df, config, 'activityType')
    df = translate_config(df, config, 'activityCategory')

    dfTranslated = pd.read_csv(os.path.join(raw_pth, "translated", "activities.csv")).rename(columns={'Italian': 'activity'})
    df = pd.merge(df, dfTranslated, on="activity", how="left").drop("activity", axis=1).rename(columns={'English': "activity"})
    df = clean_strings(df, "activity")
    df = df[pd.isnull(df.activity) == False]
    df.activityCategory = df.activityCategory.fillna('NA')

    id = activity_id(df, controls)
    df = pd.merge(df, id[["activityGUID", "activityID"]], on="activityGUID", how="left")

    ## Write the cleaned data out
    df.drop('activityGUID', axis = 1).drop_duplicates().to_csv(os.path.join(processed_pth, 'relational', 'activities' + ".csv"), index = False)

    return df

"""
Data management steps for actors
Return a dataframe unique on actor
"""
def actors_dm(actors, config, raw_pth, processed_pth):

    df = actors[actors["Obsolete Object"] != "Obsoleto"]
    df = df[["actorGUID", "actorType", "actor"]].drop_duplicates() # drop duplicates
    df = translate_config(df, config, 'actorType')
    dfTranslated = pd.read_csv(os.path.join(raw_pth, "translated", "actors.csv")).rename(columns={'Italian': 'actor'})
    df = pd.merge(df, dfTranslated, on="actor", how="left").drop("actor", axis=1).rename(columns={'English': "actor"})
    df = clean_strings(df, "actor")
    df = df[pd.isnull(df.actor) == False]
    df = num_id(df, "actorGUID", 10000)
    df.actorType = df.actorType.replace('Missing', 'NA')

    ## Write the cleaned data out
    df.drop('actorGUID', axis = 1).drop_duplicates().to_csv(os.path.join(processed_pth, 'relational', 'actors' + ".csv"), index = False)

    return df

"""
Data management steps for risks
Return a dataframe unique on risk
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
    df = num_id(df, "riskGUID", 100000)
    df = translate_config(df, config, 'riskType')
    df["financialDisclosureRisk"] = df.riskType == "Financial Information Risk (ex 262/2005)"

    ## Write the cleaned data out
    df.drop('riskGUID', axis = 1).drop_duplicates().to_csv(os.path.join(processed_pth, 'relational', 'risks' + ".csv"), index = False)

    return df

"""
Data management steps for controls
Return a dataframe unique on control activities
"""
def controls_dm(controls, activities, config, raw_pth, processed_pth):

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

    period_mapping = {
                    'Decadal': 3650, 
                    'Annually': 365, 
                    'Half yearly':182, 
                    'Quarterly':92,
                    'Monthly':30, 
                    'Weekly':7, 
                    'Daily':1, 
                    'Per event':.1
                    }

    df = df.assign(controlPeriodocity = df.controlPeriodocity.map(period_mapping))

    dfTranslated = pd.read_csv(os.path.join(raw_pth, "translated", "controls.csv")).rename(columns={'Italian': 'control'})
    df = pd.merge(df, dfTranslated, on="control", how="left").drop("control", axis=1).rename(columns={'English': "control"})
    df = clean_strings(df, "control")
    df = df[pd.isnull(df.control) == False]

    id = activity_id(activities[["activityGUID"]].drop_duplicates(), df)
    df = pd.merge(df, id[["controlGUID", "controlID"]], on="controlGUID", how="left")

    df = df.rename(columns={'activityCategory': 'controlCategory'})
    df.controlCategory = df.controlCategory.fillna('NA')
    df['control'] = df['control'].replace(r"^ +", regex=True)
    df.controlType = df.controlType.replace('Missing', 'NA')
    df.controlPeriodocity = df.controlPeriodocity.replace('Missing', 'NA')

    ## Write the cleaned data out
    df.drop('controlGUID', axis = 1).drop_duplicates().to_csv(os.path.join(processed_pth, 'relational', 'controls' + ".csv"), index = False)

    return df

"""
Data management steps for level1
Return a dataframe unique on level 1 (process 1)
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
    df = num_id(df, "level1GUID", 10)

    ## Write the cleaned data out
    df.drop('level1GUID', axis = 1).drop_duplicates().to_csv(os.path.join(processed_pth, 'relational', 'level1' + ".csv"), index = False)

    return df

"""
Data management steps for level2
Return a dataframe unique on level2 (process 2)
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
    df = num_id(df, "level2GUID", 100)

    ## Write the cleaned data out
    df.drop('level2GUID', axis = 1).drop_duplicates().to_csv(os.path.join(processed_pth, 'relational', 'level2' + ".csv"), index = False)

    return df

"""
Data management steps for level3
Return a dataframe unique on level3 (process 3)
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
    df = num_id(df, "level3GUID", 1000)

    def shorten_label(row):
        return row['level3'].split(" - ")[-1]
    
    df['level3'] = df.apply(shorten_label, axis=1)

    ## Write the cleaned data out
    df.drop('level3GUID', axis = 1).drop_duplicates().to_csv(os.path.join(processed_pth, 'relational', 'level3' + ".csv"), index = False)

    return df

"""
Data management steps for level3
Return a dataframe unique on chapter (model)
"""
def model_dm(data, raw_pth, processed_pth):

    df = data.rename(columns={'MODEL NAME ITA': 'model',
                                'MODEL NAME ENG': 'english',
                                'MODEL GUID': 'modelGUID'})
    df = df[["english", "model", "modelGUID"]].drop_duplicates() # drop duplicates
    df.model = df.model.replace(r'\n','', regex=True)
    df.model = df.model.replace(r"'",'', regex=True)

    dfTranslated = pd.read_csv(os.path.join(raw_pth, "translated", "model.csv")).rename(columns={'Italian': 'model'})
    dfTranslated.model = dfTranslated.model.replace(r'\\n','', regex=True)
    dfTranslated.model = dfTranslated.model.replace(r"'",'', regex=True)
    dfTranslated.English = dfTranslated.English.replace(r'\\n','', regex=True)

    df = pd.merge(df, dfTranslated, on="model", how="left").drop("model", axis=1).rename(columns={'English': "model"})
    df = clean_strings(df, "model")
    df.model = df.model.fillna(df.english) #several models are missing the italian translations, but have the english
    df = df[pd.isnull(df.model) == False]
    df = num_id(df, "modelGUID", 1000)
    df = df.drop('english', axis = 1)

    def shorten_label(row):
        return row['model'].split(" - ")[-1]
    
    df['model'] = df.apply(shorten_label, axis=1)

    ## Write the cleaned data out
    df.drop('modelGUID', axis = 1).drop_duplicates().to_csv(os.path.join(processed_pth, 'relational', 'model' + ".csv"), index = False)

    return df

"""
Data management steps for applications data
Return a dataframe unique on application
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
Organizational structure data management
Return dataframe unique on organizational structure 1
"""
def org_str1_dm(data, raw_pth, processed_pth):

    df = data[["organizational_structure1"]].drop_duplicates() # drop duplicates
    dfTranslated = pd.read_csv(os.path.join(raw_pth, "translated", "organizational_structure1.csv")).rename(columns={'Italian': 'organizational_structure1'})
    df = pd.merge(df, dfTranslated, on="organizational_structure1", how="left")
    df = num_id(df, "organizational_structure1", 1000000)

    df.to_csv(os.path.join(processed_pth, 'relational', 'organizational_structure1' + ".csv"), index = False)

    return df

"""
Organizational structure data management
Return dataframe unique on organizational structure 2
"""
def org_str2_dm(data, raw_pth, processed_pth):

    df = data[["organizational_structure2"]].drop_duplicates() # drop duplicates
    dfTranslated = pd.read_csv(os.path.join(raw_pth, "translated", "organizational_structure2.csv")).rename(columns={'Italian': 'organizational_structure2'})
    df = pd.merge(df, dfTranslated, on="organizational_structure2", how="left")
    df = num_id(df, "organizational_structure2", 10000000)

    df.to_csv(os.path.join(processed_pth, 'relational', 'organizational_structure2' + ".csv"), index = False)

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
    df = df.drop_duplicates()[["activityID", "actorID", "Connection"]]

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
def main_dm(data, level1, level2, level3, model, activities, actors, risks, controls, org1, org2, activity_to_risk, risk_to_control):

    df = pd.merge(data, level1, how="left", on="level1GUID")
    df = pd.merge(df, level2, how="left", on="level2GUID")
    df = pd.merge(df, level3, how="left", on="level3GUID")

    df = pd.merge(df, model, how="left", on="modelGUID")

    df = pd.merge(df, activities, how="left", on="activityGUID")
    df = pd.merge(df, actors, how="left", on="actorGUID")

    df = pd.merge(df, org1, how="left", on="organizational_structure1").drop("organizational_structure1", axis=1).rename(columns={'English': "organizational_structure1"})
    df = pd.merge(df, org2, how="left", on="organizational_structure2").drop("organizational_structure2", axis=1).rename(columns={'English': "organizational_structure2"})
    df = clean_strings(df, "organizational_structure1")
    df = clean_strings(df, "organizational_structure2")

    def shorten_label(row):
        return row['organizational_structure2'].split(" - ")[-1]

    df['organizational_structure2'] = df.apply(shorten_label, axis=1)

    rtc = pd.concat([risk_to_control.rename(columns={'controlID': 'activityID'}), activity_to_risk], ignore_index=True, sort=False).drop_duplicates()
    df = pd.merge(df, rtc, how="left", on="activityID")

    df = pd.merge(df, risks, how="left", on="riskID")
    df = pd.merge(df, controls.rename(columns={'controlID': 'activityID'}), how="left", on="activityID")

    df = df.drop(["level1GUID", "level2GUID", "level3GUID", "modelGUID", "activityGUID", "actorGUID", "riskGUID", "controlGUID"], axis = 1)

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
