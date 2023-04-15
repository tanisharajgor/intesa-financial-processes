
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

    # df = df[pd.isnull(df.riskID) == False]

    df.controlType = df.controlType.fillna('NA')
    df.controlPeriodocity = df.controlPeriodocity.fillna('NA')
    df.financialDisclosureRisk = df.financialDisclosureRisk.fillna('NA')

    if df.shape[0] > 0:

        row = {"nRisks": int(df.riskID.nunique()),
               "riskID": df.riskID.unique().astype(int).tolist()}
        
        controlType = df.controlType.mode().iloc[0]

        controlPeriodocityMode = df.controlPeriodocity.mode().iloc[0]

        if (controlPeriodocityMode != "NA") & (controlPeriodocityMode != "Missing"):
            controlPeriodocityMode = float(controlPeriodocityMode)

        financialDisclosureRiskAny = df.financialDisclosureRisk.mode().iloc[0]

        if (financialDisclosureRiskAny != "NA") & (financialDisclosureRiskAny != "Missing"):
            financialDisclosureRiskAny = bool(financialDisclosureRiskAny)

        row = {"controlType": controlType,
               "controlPeriodocityMode": controlPeriodocityMode,
               "financialDisclosureRiskAny": financialDisclosureRiskAny}

    else:
        row = {"nRisks": int(0)}

    return row

"""
Nest sub processes
Return object
"""
def create_sub_processes(df, root1, root2, children = None, tree_level = None):

    root1ID = root1+"ID"
    root2ID = root2+"ID"

    ids = unique_int(df, root1ID)
    array = []

    for id in ids:

        df_sub = df[df[root1ID] == id]

        childrenIDs = df_sub[df_sub[root1ID] == id][root2ID].unique().tolist()

        d = {"id": int(id),
            "name": df_sub[df_sub[root1ID] == id][root1].iloc[0],
            # "childrenIDs": childrenIDs,
            "riskStatus": create_risk_status(df_sub),
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

    nest4 = create_sub_processes(main, "activity", "risk", None, 4)
    nest3 = create_sub_processes(main, "level3", "activity", nest4, 3)
    nest2 = create_sub_processes(main, "level2", "level3", nest3, 2)
    nest1 = create_sub_processes(main, "level1", "level2", nest2, 1)

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

    # import pdb; pdb.set_trace()

    for i in data.level3ID.unique():

        df = data[data.level3ID == i].drop_duplicates()
        df.riskType = df.riskType.fillna('NA')
        df.financialDisclosureRisk = df.financialDisclosureRisk.fillna('NA')
        df.controlPeriodocity = df.controlPeriodocity.fillna('NA')
        df.controlType = df.controlType.fillna('NA')
        df.controlCategory = df.controlCategory.fillna('NA')

        actorsID = df[pd.isnull(df.actorID) == False].actorID.unique()
        activitiesID = df[pd.isnull(df.activityID) == False].activityID.unique()
        riskID = df[pd.isnull(df.riskID) == False].riskID.unique()
        controlID = df[pd.isnull(df.controlID) == False].controlID.unique()

        links = []
        nodes = []

        for k in actorsID:

            row = {"id": int(k),
                   "group": "Actor",
                   "name": df[df.actorID == k].actor.iloc[0],
                   "type": df[df.actorID == k].actorType.iloc[0],
                   "nActivities": int(df[df.actorID == k].activityID.nunique()),
                   "activitiesID": df[df.actorID == k].activityID.unique().tolist(),
                #    "riskStatus": create_risk_status(df[df.actorID == k]),
                   "levels": levelsObject(df[df.actorID == k])
                   }

            nodes.append(row)

        for l in activitiesID:
            row = {"id": int(l),
                    "group": "Activity",
                    "name": df[df.activityID == l].activity.iloc[0],
                    "type": df[df.activityID == l].activityType.iloc[0],
                    "nActors": int(df[df.activityID == l].actorID.nunique()),
                    "actorsID": df[df.activityID == l].actorID.unique().tolist(),
                    # "riskStatus": create_risk_status(df[df.activityID == l]),
                    "levels": levelsObject(df[df.activityID == l])
                    }

            nodes.append(row)

        for m in riskID:
            row = {"id": int(m),
                    "group": "Risk",
                    "name": df[df.riskID == m].risk.iloc[0],
                    "riskType": {
                        "financialDisclosureRisk": bool(df[df.riskID == m].financialDisclosureRisk.iloc[0]),
                        "riskType": df[df.riskID == m].riskType.iloc[0],
                        "nControl": int(df[(df.riskID == m) & (pd.isnull(df.controlID) == False)].shape[0])
                    }
                }

            nodes.append(row)

        for k in controlID:
            row = {"id": int(k),
                   "group": "Control",
                   "name": df[df.controlID == k].control.iloc[0],
                   "controlType": {
                        "controlPeriodocity": df[df.controlID == k].controlPeriodocity.iloc[0],
                        "controlCategory": df[df.controlID == k].controlCategory.iloc[0],
                        "controlType": df[df.controlID == k].controlType.iloc[0],
                    }
                }

            nodes.append(row)

        linkData = df[(pd.isnull(df.activityID) == False) & (pd.isnull(df.actorID) == False)][['actorID', 'activityID']].drop_duplicates()

        for j in range(0, linkData.shape[0] - 1):
            row = {"target": int(linkData.actorID.iloc[j]),
                   "source": int(linkData.activityID.iloc[j]),
                   "id": str(linkData.actorID.iloc[j]) + "-" + str(linkData.activityID.iloc[j])}

            links.append(row)

        linkData = df[(pd.isnull(df.activityID) == False) & (pd.isnull(df.riskID) == False)][['activityID', 'riskID']].drop_duplicates()

        for j in range(0, linkData.shape[0] - 1):
            row = {"target": int(linkData.activityID.iloc[j]),
                   "source": int(linkData.riskID.iloc[j]),
                   "id": str(linkData.activityID.iloc[j]) + "-" + str(linkData.riskID.iloc[j])}

            links.append(row)

        linkData = df[(pd.isnull(df.riskID) == False) & (pd.isnull(df.controlID) == False)][['riskID', 'controlID']].drop_duplicates()

        for j in range(0, linkData.shape[0] - 1):
            row = {"target": int(linkData.riskID.iloc[j]),
                   "source": int(linkData.controlID.iloc[j]),
                   "id": str(linkData.riskID.iloc[j]) + "-" + str(linkData.controlID.iloc[j])}

            links.append(row)

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