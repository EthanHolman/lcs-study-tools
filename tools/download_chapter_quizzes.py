import os
import time
import requests
import sys

try:
    API_TOKEN = sys.argv[sys.argv.index("--token") + 1]
except ValueError:
    print("Missing API_TOKEN.\n Usage: python3 <this_script.py> --token <your_token>")
    exit()

QUIZ_RECORDS_API_ENDPOINT = "https://lcs-api.herokuapp.com/api/public/quizzes"
QUIZ_API_ENDPOINT = "https://lcs-api.herokuapp.com/api/public/quizExamples/"
FILE_OUTPUT_BASE_PATH = "./lcs_quizzes_raw"

os.makedirs(FILE_OUTPUT_BASE_PATH, exist_ok=True)

headers = {"Authorization": f"Bearer {API_TOKEN}"}

r = requests.get(QUIZ_RECORDS_API_ENDPOINT, headers=headers)

for item in r.json():
    if item["quizNickname"].startswith("lcsp quiz"):
        q = requests.get(QUIZ_API_ENDPOINT + str(item["recordId"]), headers=headers)
        filename = os.path.join(
            FILE_OUTPUT_BASE_PATH, item["quizNickname"].split(" ")[-1] + ".json"
        )
        with open(filename, "w") as f:
            f.write(q.text)

    # rate limit the API
    time.sleep(1)
