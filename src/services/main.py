import pandas as pd
import os
import numpy as np
import yaml
from python.data_management import actors_rename, activities_dm, actors_dm, create_actor_activities_nodes, create_links
from python.translate import translate_text, authenticate_implicit_with_adc
from python.helper import write_json

with open('./config.yaml', 'r', encoding='utf8') as file:
    config = yaml.safe_load(file)

pth = "../data/"
raw_pth = os.path.join(pth, "raw")
processed_pth = os.path.join(pth, "processed")


def save_csv(raw_pth):

    for fl in os.listdir(raw_pth):

       # import pdb; pdb.set_trace()

        df =  pd.read_excel(os.path.join(raw_pth, fl))

        name = os.path.splitext(fl)[0]

        df.to_csv(os.path.join(raw_pth, name+'.csv'))

def main():

    data = pd.read_excel(os.path.join(raw_pth, "Richiesta_Dati_V2_EN.xlsb"), sheet_name = "Actors")
    data = actors_rename(data)

    ## Translate Italian to English
    authenticate_implicit_with_adc()
    translate_text(data.actor.unique(), raw_pth, 'actors_translated')
    translate_text(data.activity.unique(), raw_pth, 'activities_translated')

    activities = activities_dm(data, config, raw_pth)
    actors = actors_dm(data, config, raw_pth)

    nodes = create_actor_activities_nodes(data, actors, activities)

    links = create_links(nodes)

    network = {
        "nodes" : nodes,
        "links" : links
    }

    write_json(network, processed_pth, "network")

    import pdb; pdb.set_trace()

if __name__ == '__main__':
    main()
    