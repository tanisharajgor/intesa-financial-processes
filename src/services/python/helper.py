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
