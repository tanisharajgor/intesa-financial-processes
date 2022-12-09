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
    activities.activityCategory = activities.activityCategory.fillna('Other')

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

def create_actor_activities_nodes(data, actors, activities):

    actors_activities = data[["activityGUID", "actorGUID"]]
    actors_activities = pd.merge(actors_activities, actors)
    actors_activities = pd.merge(actors_activities, activities)
    actors_activities.drop(["activityGUID", "actorGUID"], axis=1, inplace=True)
    actors_activities = actors_activities.drop_duplicates()
    actors_activities = actors_activities[actors_activities.activityID != -1]
    actors_activities = actors_activities[actors_activities.actorID != -1]

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
