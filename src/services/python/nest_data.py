
import pandas as pd

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
                   "descr": df[df[rootID] == i][root].iloc[0]}

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
            "modelID": df.modelID.unique().tolist(),
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
                "descr": df.risk.iloc[0],
                "viewType": create_view_type(df)
        }

        array.append(dict)

    return array

"""
Creates a risk status attribute at the activity level
return nested list
"""
def create_view_type(df):

    row = {
        "nActor": int(df[pd.isnull(df.actorID) == False].actorID.nunique()),
        "actorID": df[pd.isnull(df.actorID) == False].actorID.unique().tolist()
    }

    riskType = df[pd.isnull(df.riskType) == False][["riskType", "financialDisclosureRisk", "riskID"]].drop_duplicates()

    if riskType.shape[0] == 0:
        row["riskType"] = "NA"
        row["financialDisclosureRisk"] = "NA"
        row["riskID"] = []
        row["nRisk"] = 0
    else:
        row["riskType"] = riskType.riskType.mode().iloc[0]
        row["financialDisclosureRisk"] = bool(riskType.financialDisclosureRisk.mode().iloc[0])
        row["riskID"] =  riskType.riskID.unique().tolist()
        row["nRisk"] = int(riskType.riskID.nunique())

    controlType = df[(pd.isnull(df.controlType) == False) & (df.activityType == "Control activity")][["controlType", "controlPeriodocity", "activityID"]].drop_duplicates()

    if controlType.shape[0] == 0:
        row["controlType"] = "NA"
        row["controlID"] = []
        row["nControl"] = 0
    else:
        row["controlType"] = controlType.controlType.mode().iloc[0]
        row["controlID"] =  controlType.activityID.unique().tolist()
        row["nControl"] = int(controlType.activityID.nunique())

    controlPeriodocity = df[pd.isnull(df.controlPeriodocity) == False][["controlPeriodocity"]].drop_duplicates()

    if controlPeriodocity.shape[0] == 0:
        row["controlPeriodocity"] = "NA"
    else:
        periodocity = controlPeriodocity.controlPeriodocity.mode().iloc[0]
        if periodocity == "NA":
            row["controlPeriodocity"] = periodocity
        else:
            row["controlPeriodocity"] = float(periodocity)

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

        org = create_org_structure(df_sub)

        childrenIDs = df_sub[root2ID].unique().tolist()
        activityID = df_sub.activityID.unique().tolist()
        childrenID3 = df_sub.level3ID.unique().tolist()
        childrenID2 = df_sub.level2ID.unique().tolist()

        if tree_level == 3:
            fullChildrenIDs = activityID
        elif tree_level == 2:
            fullChildrenIDs = activityID + childrenID3
        elif tree_level == 1:
            fullChildrenIDs = activityID + childrenID3 + childrenID2

        d = {"id": int(id),
            "descr": df_sub[df_sub[root1ID] == id][root1].iloc[0],
            "viewType": create_view_type(df_sub),
            "level": int(tree_level),
            "organizationalStructure": org
            }

        if children is not None:
            d["children"] = subset_list(childrenIDs, children)
            d["viewId"] = "Process"
            d["childrenIDs"] = fullChildrenIDs
        else:
            d["activityType"] = df_sub.activityType.iloc[0]
            if df_sub.activityType.iloc[0] == "Control activity":
                d["viewId"] = "Control activity"
            else:
                d["viewId"] = "Other activity"
            d["processes"] = {
                "level1ID": int(df_sub.level1ID.iloc[0]),
                "level2ID": int(df_sub.level2ID.iloc[0]),
                "level3ID": int(df_sub.level3ID.iloc[0]),
                "modelID": int(df_sub.modelID.iloc[0])
            }

        array.append(d)

    return array

"""
Nest processes
Return object
"""
def create_processes_to_activities(main):

    nest4 = create_sub_processes(main, "activity", "risk", None, 5)
    nest3 = create_sub_processes(main, "level3", "activity", nest4, 3)
    nest2 = create_sub_processes(main, "level2", "level3", nest3, 2)
    nest1 = create_sub_processes(main, "level1", "level2", nest2, 1)

    return {"descr": "root",
            "children": nest1,
            "childrenIDs": main.level1ID.unique().tolist(),
            "viewType": create_view_type(main),
            "level": int(0)}

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

    nodearray = []
    linkarray = []

    data = data[pd.isnull(data.actorID) == False]

    for i in data.level3ID.unique():

        df = data[data.level3ID == i].drop_duplicates()

        actorsID = df[pd.isnull(df.actorID) == False].actorID.unique()
        activitiesID = df[(pd.isnull(df.activityID) == False) & (df.activityType != "Control activity")].activityID.unique()
        riskID = df[pd.isnull(df.riskID) == False].riskID.unique()
        controlID = df[(pd.isnull(df.activityID) == False) & (df.activityType == "Control activity")].activityID.unique()

        df.riskType = df.riskType.fillna('NA')
        df.financialDisclosureRisk = df.financialDisclosureRisk.fillna('NA')
        df.controlPeriodocity = df.controlPeriodocity.fillna('NA')
        df.controlType = df.controlType.fillna('NA')
        df.controlCategory = df.controlCategory.fillna('NA')
        df.risk = df.risk.fillna('NA')
        df.control = df.control.fillna('NA')

        links = []
        nodes = []

        for k in actorsID:

            org = create_org_structure(df[df.actorID == k])

            row = {"id": int(k),
                   "group": "Actor",
                   "viewId": "Actor",
                   "descr": df[df.actorID == k].actor.iloc[0],
                   "type": df[df.actorID == k].actorType.iloc[0],
                   "activitiesID": df[df.actorID == k].activityID.unique().tolist(),
                   "levels": levelsObject(df[df.actorID == k]),
                   "viewType": {
                        "nActivity": int(df[(df.actorID == k) & (pd.isnull(df.activityID) == False)][['activityID']].drop_duplicates().shape[0]),
                        "nRisk": int(df[(df.actorID == k) & (pd.isnull(df.riskID) == False)][['riskID']].drop_duplicates().shape[0]),
                        "nControl": int(df[(df.actorID == k) & (pd.isnull(df.activityID) == False) & (df.activityType == "Control activity")][['activityID']].drop_duplicates().shape[0])
                        },
                    "organizationalStructure": org
                   }

            nodes.append(row)

        for l in activitiesID:
            row = {"id": int(l),
                    "group": "Activity",
                    "viewId": "Other activity",
                    "type": df[df.activityID == l].activityType.iloc[0],
                    "descr": df[df.activityID == l].activity.iloc[0],
                    "actorsID": df[df.activityID == l].actorID.unique().tolist(),
                    "levels": levelsObject(df[df.activityID == l]),
                    "viewType": {
                        "nActor": int(df[(df.activityID == l) & (pd.isnull(df.actorID) == False)][['actorID']].drop_duplicates().shape[0]),
                        "nRisk": int(df[(df.activityID == l) & (pd.isnull(df.riskID) == False)][['riskID']].drop_duplicates().shape[0]),
                        "nControl": int(df[(df.actorID == k) & (pd.isnull(df.activityID) == False) & (df.activityType == "Control activity")][['activityID']].drop_duplicates().shape[0])
                        }
                    }

            nodes.append(row)

        for m in riskID:

            row = {"id": int(m),
                    "group": "Risk",
                    "viewId": "Risk",
                    "descr": df[df.riskID == m].risk.iloc[0],
                    "viewType": {
                        "financialDisclosureRisk": bool(df[df.riskID == m].financialDisclosureRisk.iloc[0]),
                        "riskType": df[df.riskID == m].riskType.iloc[0],
                        "nActor": int(df[(df.riskID == m) & (pd.isnull(df.actorID) == False)][['actorID']].drop_duplicates().shape[0]),
                        "nActivity": int(df[(df.riskID == m) & (pd.isnull(df.activityID) == False)][['activityID']].drop_duplicates().shape[0]),
                        "nControl": int(df[(df.actorID == k) & (pd.isnull(df.activityID) == False) & (df.activityType == "Control activity")][['activityID']].drop_duplicates().shape[0])                    }
                }

            nodes.append(row)

        for k in controlID:
            row = {"id": int(k),
                   "group": "Activity",
                   "type": "Control activity",
                   "viewId": "Control activity",
                   "descr": df[df.activityID == k].control.iloc[0],
                   "viewType": {
                        "controlPeriodocity": df[df.activityID == k].controlPeriodocity.iloc[0],
                        "controlCategory": df[df.activityID == k].controlCategory.iloc[0],
                        "controlType": df[df.activityID == k].controlType.iloc[0],
                        "nActor": int(df[(df.activityID == k) & (pd.isnull(df.actorID) == False)][['actorID']].drop_duplicates().shape[0]),
                        "nRisk": int(df[(df.activityID == k) & (pd.isnull(df.riskID) == False)][['riskID']].drop_duplicates().shape[0])
                    }
                }

            nodes.append(row)

        linkData1 = df[(pd.isnull(df.activityID) == False) & (pd.isnull(df.actorID) == False)][['actorID', 'activityID', 'Connection']].rename(columns={'actorID': 'source',
                                                                                                                                                        'activityID': 'target'})

        linkData2 = df[(pd.isnull(df.activityID) == False) & (pd.isnull(df.riskID) == False)][['activityID', 'riskID', 'Connection']].rename(columns={'activityID': 'source',
                                                                                                                                        'riskID': 'target'})

        linkData = pd.concat([linkData1, linkData2]).drop_duplicates()


        deve = []
        non_deve = []

        for j in range(0, linkData.shape[0]):

            row = {"source": int(linkData.source.iloc[j]),
                   "target": int(linkData.target.iloc[j])
                   #"id": str(linkData.source.iloc[j]) + "-" + str(linkData.target.iloc[j])
                   }
            
            if linkData.iloc[j].Connection == "deve":
                deve.append(row)
            else:
                non_deve.append(row)

        links = {
            "deve": deve,
            "non_deve": non_deve
        }

        node = {
            "id": int(i),
            "nodes": nodes
        }

        link = {
            "id": int(i),
            "links": links
        }

        nodearray.append(node)
        linkarray.append(link)

    network = {
        "nodes": nodearray,
        "links": linkarray
        }

    return network

"""
Creates a taxonomy of processes, chapters, and activities for easy filtering
"""
def create_processes(main):

    l1Array = []
    for i in main.level1ID.unique():

        l2 = main[main.level1ID == i].level2ID.unique()
        l2Array = []

        for j in l2:

            l3 = main[main.level2ID == j].level3ID.unique()
            l3Array = []

            for k in l3:
                model = main[main.level3ID == k].modelID.unique()
                modelArray = []

                for l in model:

                    activities = main[main.activityID == l].activityID.unique()
                    activitiesArray = []

                    for n in activities:

                        a = {"id": int(n),
                            "descr": main[main.activityID == n].activity.iloc[0],
                            "level": int(5)}
                        activitiesArray.append(a)

                    m = {"id": int(l),
                        "descr": main[main.modelID == l].model.iloc[0],
                        "level": int(4),
                        "childrenIDs": activities.tolist(),
                        "children": activitiesArray}
                    modelArray.append(m)

                r3 = {"id": int(k),
                      "descr": main[main.level3ID == k].level3.iloc[0],
                      "level": int(3),
                      "childrenIDs": main[main.level3ID == k].modelID.unique().tolist() + main[main.level3ID == k].activityID.unique().tolist(),
                      "children": modelArray}
                l3Array.append(r3)

            r2 = {"id": int(j),
                 "descr": main[main.level2ID == j].level2.iloc[0],
                 "children": l3Array,
                 "childrenIDs": main[main.level2ID == j].level3ID.unique().tolist() + main[main.level2ID == j].modelID.unique().tolist() + main[main.level2ID == j].activityID.unique().tolist(),
                 "level": int(2)}
            l2Array.append(r2)

        r1 = {"id": int(i),
              "descr": main[main.level1ID == i].level1.iloc[0],
              "children": l2Array,
             "childrenIDs": main[main.level1ID == i].level2ID.unique().tolist() + main[main.level1ID == i].level3ID.unique().tolist() + main[main.level1ID == i].modelID.unique().tolist() + main[main.level1ID == i].activityID.unique().tolist(),
              "level": int(1)}
        l1Array.append(r1)

    return l1Array

"""
Create a nested structure for organizational structure
Return object
"""
def create_org_structure(main):
    l1Array = []

    for i in main.organizational_structure1ID.unique():
        l2 = main[main.organizational_structure1ID == i].organizational_structure2ID.unique()

        l2Array = []
        for j in l2:

            r2 = {"id": int(j),
                  "name": main[main.organizational_structure2ID == j].organizational_structure2.iloc[0],
                  "level": int(2)}
            l2Array.append(r2)

        r1 = {"id": int(i),
              "name": main[main.organizational_structure1ID == i].organizational_structure1.iloc[0],
              "children": l2Array,
              "level": int(1)}
        l1Array.append(r1)

    return l1Array
