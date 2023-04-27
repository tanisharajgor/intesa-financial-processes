
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
                "riskType": create_risk_type(df)
        }

        array.append(dict)

    return array

"""
Creates a risk status attribute at the activity level
return nested list
"""
def create_risk_type(df):

    df = df[pd.isnull(df.riskID) == False]

    df.financialDisclosureRisk = df.financialDisclosureRisk.fillna('Missing')
    df.riskType = df.riskType.fillna('Missing')

    if df.shape[0] > 0:

        riskType = df.riskType.mode().iloc[0]
        financialDisclosureRiskAny = df.financialDisclosureRisk.mode().iloc[0]

        if (financialDisclosureRiskAny != "NA") & (financialDisclosureRiskAny != "Missing"):
            financialDisclosureRiskAny = bool(financialDisclosureRiskAny)

        row = {"financialDisclosureRiskAny": financialDisclosureRiskAny,
               "riskType": str(riskType)}

    else:
        row = {}

    return row

"""
Creates a risk status attribute at the activity level
return nested list
"""
def create_control_type(df):

    df = df[pd.isnull(df.controlID) == False]

    df.controlType = df.controlType.fillna('Missing')
    df.controlPeriodocity = df.controlPeriodocity.fillna('Missing')

    if df.shape[0] > 0:

        controlType = df.controlType.mode().iloc[0]
        controlPeriodocityMode = df.controlPeriodocity.mode().iloc[0]

        if (controlPeriodocityMode != "NA") & (controlPeriodocityMode != "Missing"):
            controlPeriodocityMode = float(controlPeriodocityMode)

        row = {"controlType": str(controlType),
               "controlPeriodocity": controlPeriodocityMode}

    else:
        row = {}

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
            "riskType": create_risk_type(df_sub),
            "controlType": create_control_type(df_sub),
            "treeLevel": int(tree_level)
            }

        # import pdb; pdb.set_trace()
        if children is not None:
            d["children"] = subset_list(childrenIDs, children)
            d["viewId"] = "Process"
        else:
            d["viewId"] = df_sub[df_sub[root1ID] == id].activityType.iloc[0]

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
            "riskType": {},
            "riskControl": {},
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
        df.riskType = df.riskType.fillna('Missing')
        df.financialDisclosureRisk = df.financialDisclosureRisk.fillna('Missing')
        df.controlPeriodocity = df.controlPeriodocity.fillna('Missing')
        df.controlType = df.controlType.fillna('Missing')
        df.controlCategory = df.controlCategory.fillna('Missing')

        actorsID = df[pd.isnull(df.actorID) == False].actorID.unique()
        activitiesID = df[(pd.isnull(df.activityID) == False) & (df.activityID.isin(df.controlID) == False)].activityID.unique()
        riskID = df[pd.isnull(df.riskID) == False].riskID.unique()
        controlID = df[pd.isnull(df.controlID) == False].controlID.unique()

        links = []
        nodes = []

        for k in actorsID:

            row = {"id": int(k),
                   "group": "Actor",
                   "viewId": "Actor",
                   "name": df[df.actorID == k].actor.iloc[0],
                   "type": df[df.actorID == k].actorType.iloc[0],
                   "activitiesID": df[df.actorID == k].activityID.unique().tolist(),
                   "levels": levelsObject(df[df.actorID == k]),
                   "actorType": {
                        "nActivity": int(df[(df.actorID == k) & (pd.isnull(df.activityID) == False)][['activityID']].drop_duplicates().shape[0]),
                        "nRisk": int(df[(df.actorID == k) & (pd.isnull(df.riskID) == False)][['riskID']].drop_duplicates().shape[0]),
                        "nControl": int(df[(df.actorID == k) & (pd.isnull(df.controlID) == False)][['controlID']].drop_duplicates().shape[0])
                        }
                   }

            nodes.append(row)

        for l in activitiesID:
            row = {"id": int(l),
                    "group": "Activity",
                    "viewId": "Other activity",
                    "type": df[df.activityID == l].activityType.iloc[0],
                    "name": df[df.activityID == l].activity.iloc[0],
                    "actorsID": df[df.activityID == l].actorID.unique().tolist(),
                    "levels": levelsObject(df[df.activityID == l]),
                    "activityType": {
                        "nActor": int(df[(df.activityID == l) & (pd.isnull(df.actorID) == False)][['actorID']].drop_duplicates().shape[0]),
                        "nRisk": int(df[(df.activityID == l) & (pd.isnull(df.riskID) == False)][['riskID']].drop_duplicates().shape[0]),
                        "nControl": int(df[(df.activityID == l) & (pd.isnull(df.controlID) == False)][['controlID']].drop_duplicates().shape[0])
                        }
                    }

            nodes.append(row)

        for m in riskID:

            row = {"id": int(m),
                    "group": "Risk",
                    "viewId": "Risk",
                    "name": df[df.riskID == m].risk.iloc[0],
                    "riskType": {
                        "financialDisclosureRisk": bool(df[df.riskID == m].financialDisclosureRisk.iloc[0]),
                        "riskType": df[df.riskID == m].riskType.iloc[0],
                        "nActor": int(df[(df.riskID == m) & (pd.isnull(df.actorID) == False)][['actorID']].drop_duplicates().shape[0]),
                        "nActivity": int(df[(df.riskID == m) & (pd.isnull(df.activityID) == False)][['activityID']].drop_duplicates().shape[0]),
                        "nControl": int(df[(df.riskID == m) & (pd.isnull(df.controlID) == False)][['controlID']].drop_duplicates().shape[0])
                    }
                }

            nodes.append(row)

        for k in controlID:
            row = {"id": int(k),
                   "group": "Activity",
                   "type": "Control activity",
                   "viewId": "Control activity",
                   "name": df[df.controlID == k].control.iloc[0],
                   "activityType": {
                        "controlPeriodocity": df[df.controlID == k].controlPeriodocity.iloc[0],
                        "controlCategory": df[df.controlID == k].controlCategory.iloc[0],
                        "controlType": df[df.controlID == k].controlType.iloc[0],
                        "nActor": int(df[(df.controlID == k) & (pd.isnull(df.actorID) == False)][['actorID']].drop_duplicates().shape[0]),
                        "nRisk": int(df[(df.controlID == k) & (pd.isnull(df.riskID) == False)][['riskID']].drop_duplicates().shape[0])
                    }
                }

            nodes.append(row)

        linkData1 = df[(pd.isnull(df.activityID) == False) & (pd.isnull(df.actorID) == False)][['actorID', 'activityID']].rename(columns={'actorID': 'source',
                                                                                                                                           'activityID': 'target'})
        linkData2 = df[(pd.isnull(df.activityID) == False) & (pd.isnull(df.riskID) == False)][['activityID', 'riskID']].rename(columns={'activityID': 'source',
                                                                                                                                        'riskID': 'target'})
        linkData3 = df[(pd.isnull(df.riskID) == False) & (pd.isnull(df.controlID) == False)][['riskID', 'controlID']].rename(columns={'riskID': 'source',
                                                                                                                                      'controlID': 'target'})
        linkData4 = df[(pd.isnull(df.actorID) == False) & (pd.isnull(df.controlID) == False) & (df.controlID.isin(df.controlID))][['actorID', 'controlID']].rename(columns={'actorID': 'source',
                                                                                                                                      'controlID': 'target'})
        linkData = linkData1.append(linkData2)
        linkData = linkData.append(linkData3)
        linkData = linkData.append(linkData4).drop_duplicates()

        for j in range(0, linkData.shape[0]):
            row = {"source": int(linkData.source.iloc[j]),
                #    "sourceType": str("Actor"),
                   "target": int(linkData.target.iloc[j]),
                #    "targetType": str("Activity"),
                   "id": str(linkData.source.iloc[j]) + "-" + str(linkData.target.iloc[j])}

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
