import pandas as pd
import os

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

    return df

"""
Unique integer
param df dataframe. Pandas dataframe to subset
param col_name string. Column name 
return dataframe
"""
def unique_int(df, col_name):
    return df[col_name].unique().astype(int)

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
def activities_dm(actors, config, raw_pth):

    activities = actors[["activityGUID", "activity", "activityType", "activityCategory"]].drop_duplicates()
    activities = translate_config(activities, config, 'activityType')
    activities = translate_config(activities, config, 'activityCategory')
    activitiesTranslated = pd.read_csv(os.path.join(raw_pth, "activities_translated.csv")).rename(columns={'Italian': 'activity'})
    activities = pd.merge(activities, activitiesTranslated, on="activity", how="left").drop("activity", axis=1).rename(columns={'English': "activity"})
    activities = num_id(activities, "activity")

    ## Write the cleaned data out
    activities.to_csv(os.path.join(raw_pth, 'activities' + ".csv"), index = False)

    return activities

"""
Data management steps for actors
return dataframe
"""
def actors_dm(actors, config, raw_pth):

    actors = actors[["actorGUID", "actorType", "actor"]].drop_duplicates()
    actors = translate_config(actors, config, 'actorType')
    actorsTranslated = pd.read_csv(os.path.join(raw_pth, "actors_translated.csv")).rename(columns={'Italian': 'actor'})
    actors = pd.merge(actors, actorsTranslated, on="actor", how="left").drop("actor", axis=1).rename(columns={'English': "actor"})
    actors = num_id(actors, "actor")

    ## Write the cleaned data out
    actors.to_csv(os.path.join(raw_pth, 'actors' + ".csv"), index = False)

    return actors

def create_actor_activity_network(data, actors, activities):

    actors_activities = data[["activityGUID", "actorGUID"]]
    actors_activities = pd.merge(actors_activities, actors[["actorGUID", "actorID"]])
    actors_activities = pd.merge(actors_activities, activities[["activityGUID", "activityID"]])

    import pdb; pdb.set_trace()

    actor = []

    for a in unique_int(actors, "actorID"):
        actors_sub = actors[actors.actorID == a]

