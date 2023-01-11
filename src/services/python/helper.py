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
<<<<<<< HEAD
=======

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

"""
Unique integer
param df dataframe. Pandas dataframe to subset
param col_name string. Column name 
return dataframe
"""
def unique_int(df, col_name):
    return df[col_name].unique().astype(int)

"""
Subset dataframe
param df dataframe. Pandas dataframe to subset
param col_name string. Column name 
param id  unique id for the column
return dataframe
"""
def subset_df(df, col_name, id):
    return df[df[col_name] == id]

"""
Create lookup
"""
def create_lu(df, var_id, var_descr, sort = False):
    array = []

    if sort:
        df = df.sort_values(var_id, ascending = True)

    for r in unique_int(df, var_id):
        df_sub = subset_df(df, var_id, r)
        dr = df_sub.iloc[0]

        descr = str(dr[var_descr])

        if descr != 'nan':

            array.append({"id": int(dr[var_id]), 
                        "descr": descr})

    return array
>>>>>>> 387a69faa21965d57aae8287333da63e61731589
