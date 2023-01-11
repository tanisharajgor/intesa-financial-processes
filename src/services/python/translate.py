from google.cloud import translate, storage
import os
import pandas as pd
from python.helper import write_csv
import math

<<<<<<< HEAD
project_id = "banca-355515"

os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = "key.json"

def authenticate_implicit_with_adc():
=======
os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = "key.json"

def authenticate_implicit_with_adc(project_id):
>>>>>>> 387a69faa21965d57aae8287333da63e61731589
    """
    When interacting with Google Cloud Client libraries, the library can auto-detect the
    credentials to use.

    // TODO(Developer):
    //  1. Before running this sample,
    //  set up ADC as described in https://cloud.google.com/docs/authentication/external/set-up-adc
    //  2. Replace the project variable.
    //  3. Make sure that the user account or service account that you are using
    //  has the required permissions. For this sample, you must have "storage.buckets.list".
    Args:
        project_id: The project id of your Google Cloud project.
    """

    # This snippet demonstrates how to list buckets.
    # *NOTE*: Replace the client created below with the client required for your application.
    # Note that the credentials are not specified when constructing the client.
    # Hence, the client library will look for credentials using ADC.
    storage_client = storage.Client(project=project_id)
    buckets = storage_client.list_buckets()
    print("Buckets:")
    for bucket in buckets:
        print(bucket.name)
    print("Listed all storage buckets.")


"""
Yield successive n-sized chunks from lst.
https://stackoverflow.com/questions/312443/how-do-i-split-a-list-into-equally-sized-chunks
"""
def chunks(xs, n):
    n = max(1, n)
    return (xs[i:i+n] for i in range(0, len(xs), n))


def n_chunks(text):

    n = math.floor(len(text)/400)
    if len(text)%400 != 0:
        n = n+1
    return n

"""
Translating Italian to English
Writes out translated text to english and saves as a CSV so the translation does not have to be run each time main is run
"""
<<<<<<< HEAD
def translate_text(text, pth, fl_name):
=======
def translate_text(text, pth, fl_name, project_id):
>>>>>>> 387a69faa21965d57aae8287333da63e61731589

    if(os.path.isfile(os.path.join(pth, fl_name + ".csv")) == False):

        client = translate.TranslationServiceClient()
        location = "global"
        parent = f"projects/{project_id}/locations/{location}"

        text = [x for x in text if str(x) != 'nan']


        nc = n_chunks(text)

        count = 0
        englishTranslation = []
        italianTranslation = []

        for i in range(0, nc):

            if i < nc-1:
                textsub = text[count:count+400]
                count = count + 400
            else:
                textsub = text[count:len(text)-1]

            response = client.translate_text(
                request={
                    "parent": parent,
                    "contents": textsub,
                    "mime_type": "text/plain",
                    "source_language_code": "it",
                    "target_language_code": "en-US",
                }
            )

            trans = []

            for translation in response.translations:
                trans.append(translation.translated_text)

            englishTranslation = englishTranslation + trans
            italianTranslation = italianTranslation + textsub

        d = {"Italian": italianTranslation, "English": englishTranslation}

        write_csv(pd.DataFrame(d), pth, fl_name)
