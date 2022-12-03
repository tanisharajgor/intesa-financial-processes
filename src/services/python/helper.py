import json
import os
import csv

"""
Write out CSV file
param df dataframe
param pth string
param fl_name string
"""
def write_csv(df, pth, fl_name):

    df.to_csv(os.path.join(pth, fl_name + ".csv"), index = False)

"""
Write out JSON file
param df dataframe
param pth string 
param fl_name string
"""
def write_json(df, pth, fl_name):

    assert(pth is not None)
    with open(os.path.join(pth, fl_name + ".json"), 'w') as f:
        json.dump(df, f)
