import pandas as pd
import os

pth = "..//data/"
raw_pth = os.path.join(pth, "raw")
processed_pth = os.path.join(pth, "processed")

def main():
    channels = pd.read_excel(os.path.join("data", "Canali_Richiesta Dati 220913 (CHANNELS) translated.xlsx"))
    checks = pd.read_excel(os.path.join("data", "Controlli_Richiesta Dati 220913 (CONTROLLING ACTIVITY)) translated.xlsx"))
    risks = pd.read_excel(os.path.join("data", "Rischi_Richiesta Dati 220913 (RISKS) translated.xlsx"))
    actors = pd.read_excel(os.path.join("data", "Attori_Richiesta Dati 220913 (ACTORS) translated.xlsx"))
    applications = pd.read_excel(os.path.join("data", "Applicativi_Richiesta Dati 220913 (APPLICATIONS) translated.xlsx"))


    taxonomy = pd.read_excel(os.path.join("data", "Tassonomia_Richiesta Dati 220913 (TAXONOMY) translated.xlsx"))
    taxonomy_detailed = pd.read_excel(os.path.join("data", "TAXONOMY (ENG) 23 febbraio 2022 translated.xlsx"), skiprows = 2)

    import pdb; pdb.set_trace()

if __name__ == '__main__':
    main()