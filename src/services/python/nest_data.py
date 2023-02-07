
import pandas as pd
import os
import numpy as np
import math

from python.helper import unique_int

"""
Nest the activity attributes
"""
def create_attributes(df, root):

    rootID = root+"ID"

    attributes = {}

    if df.shape[0] > 0:
        attributes[root+"N"] = df.shape[0]
        if root+"Type" in df.columns:
            attributes[root+"Mode"] = df.mode()[root+"Type"].iloc[0]

        array = []
        row = {}
        for i in unique_int(df, rootID):
            row = {"id": int(i),
                   "name": df[df[rootID] == i][root].iloc[0]}

            if root+"Type" in df.columns:
                row["typeMode"] = df[df[rootID] == i][root+"Type"].iloc[0]

            array.append(row)
        attributes["attributes"] = array

    return attributes

"""
Returns all of the level IDs an object is associated with
"""
def levelsObject(df):

    levels = {
            "level1ID": df.level1ID.unique().tolist(),
            "level2ID": df.level2ID.unique().tolist(),
            "level3ID": df.level3ID.unique().tolist(),
        }

    return levels

"""
"""
def subset_list(ids, l):
    array = []
    for i in l:

        if i["id"] in ids:
            array.append(i)
    
    return array

"""
Nest controls in risks
return dictionary
"""
def create_risk_control(main):

    main = main[(pd.isnull(main.riskID) == False) & (pd.isnull(main.controlID) == False)]

    array = []
    ids = unique_int(main, "riskID")

    for id in ids:

        df = main[main.riskID == id]
        dict = {"id": int(id),
                "name": df.risk.iloc[0],
                "riskStatus": create_risk_status(df)
        }

        array.append(dict)

    return array

"""
Creates a risk status attribute at the activity level
return nested list
"""
def create_risk_status(df):

    temp = df[pd.isnull(df.riskID) == False]

    if temp.shape[0] > 0:

        row = {"nRisks": int(temp.riskID.nunique()),
                "riskID": temp.riskID.unique().astype(int).tolist()}
        
        if pd.isnull(temp.controlType).iloc[0]:
            controlTypeMode = "NA"
        else:
            controlTypeMode = temp.controlType.mode().iloc[0]

        if pd.isnull(temp.controlPeriodocity).iloc[0]:
            controlPeriodocityMode = "NA"
        else:
            controlPeriodocityMode = float(temp.controlPeriodocity.mode().iloc[0])

        row = {"controlTypeMode": controlTypeMode,
            "controlPeriodocityMode": controlPeriodocityMode,
            "financialDisclosureRiskAny": bool(any(temp.financialDisclosureRisk))}

    else:
        row = {"nRisks": int(0)}

    return row

"""
Nest sub processes
Return object
"""
def create_sub_processes(df, root, children = None, tree_level = None):

    import pdb; pdb.set_trace()
    rootID = root+"ID"

    array = []
    
    ids = df[rootID].unique()

    for id in ids:

        df_sub = df[df[rootID] == id]

        childrenIDs = df[rootID].unique().tolist()
        d = {"id": int(id),
            "name": df_sub[df_sub[rootID] == id][root].iloc[0],
            "childrenIDs": childrenIDs,
            "riskStatus": create_risk_status(df),
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
def create_processes_to_activities(main):

    nest4 = create_sub_processes(main, "activity", None, 4)
    nest3 = create_sub_processes(main, "level3", nest4, 3)
    nest2 = create_sub_processes(main, "level2", nest3, 2)
    nest1 = create_sub_processes(main, "level1", nest2, 1)

    return {"name": "root", 
            "children": nest1,  
            "childrenIDs": main.level1ID.unique().tolist(),
            "riskStatus": "NA",
            "treeLevel": int(0)}

"""
Nest activities attributes
"""
def create_activities(main, applications):

    array = []

    for id in unique_int(main, "activityID"):

        df = main[main.activityID == id]
        df = pd.merge(df, applications, how="left", on="applicationID")

        dictact = {
            "id": int(id),
            "actors": create_attributes(df, "actor"),
            "risks": create_attributes(df, "risk"),
            "applications": create_attributes(df, "application")
        }

        array.append(dictact)

    return array

def create_network(data):

    array = []

    data = data[pd.isnull(data.actorID) == False]

    for i in data.level3ID.unique():

        df = data[data.level3ID == i].drop_duplicates()

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
                        "group": "Actor",
                        "name": df[df.actorID == k].actor.iloc[0],
                        "type": df[df.actorID == k].actorType.iloc[0],
                        "nActivities": int(df[df.actorID == k].activityID.nunique()),
                        "activitiesID": df[df.actorID == k].activityID.unique().tolist(),
                        "riskStatus": create_risk_status(df[df.actorID == k]),
                        "levels": levelsObject(df[df.actorID == k])
                        }

            actorsArray.append(actorRow)

        for l in activitiesID:
            activityRow = {"id": int(l),
                           "group": "Activity",
                           "name": df[df.activityID == l].activity.iloc[0],
                           "type": df[df.activityID == l].activityType.iloc[0],
                           "nActors": int(df[df.activityID == l].actorID.nunique()),
                           "actorsID": df[df.activityID == l].actorID.unique().tolist(),
                           "riskStatus": create_risk_status(df[df.activityID == l]),
                           "levels": levelsObject(df[df.activityID == l])
                           }

            activitiesArray.append(activityRow)

        nodes = actorsArray + activitiesArray

        network = {
            "id": int(i),
            "nodes": nodes,
            "links": links
        }

        array.append(network)

    return array


def create_processes(main):
    l1Array = []
    for i in main.level1ID.unique():
        l2 = main[main.level1ID == i].level2ID.unique()

        l2Array = []
        for j in l2:
            l3 = main[main.level2ID == j].level3ID.unique()

            l3Array = []
            for k in l3:
                r3 = {"id": int(k),
                     "name": main[main.level3ID == k].level3.iloc[0],
                     "treeLevel": 3}
                l3Array.append(r3)

            r2 = {"id": int(j),
                 "name": main[main.level2ID == j].level2.iloc[0],
                 "children": l3Array,
                 "treeLevel": 2}
            l2Array.append(r2)

        r1 = {"id": int(i),
              "name": main[main.level1ID == i].level1.iloc[0],
              "children": l2Array,
              "treeLevel": 1}
        l1Array.append(r1)

    return l1Array