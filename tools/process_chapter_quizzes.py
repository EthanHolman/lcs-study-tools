import json
import os

RAW_QUIZZES_BASE_PATH = "./lcs_quizzes_raw"
OUTPUT_FILENAME = "../public/lcs_quizzes.jsonl"


def clean_input_line(line):
    return line.replace("’", "'").replace("*", "")


def load_learncraft_json(filename):
    input_file = open(filename, encoding="utf8")
    lesson_number = int(filename.split("/")[-1].split(".")[0])

    lines = []
    contents = json.loads(input_file.read())

    for item in contents:
        if "spanishExample" in item and "englishTranslation" in item:
            eng = clean_input_line(item["englishTranslation"])
            esp = clean_input_line(item["spanishExample"])
            lines.append([eng, esp, lesson_number, item["recordId"]])

    return lines


files = os.listdir(RAW_QUIZZES_BASE_PATH)
files = list(filter(lambda x: x.endswith(".json"), files))
files.sort(key=lambda x: int(x.split(".")[0]))

all_lines = []

for file in files:
    path = os.path.join(RAW_QUIZZES_BASE_PATH, file)
    all_lines += load_learncraft_json(path)


with open(OUTPUT_FILENAME, "w", encoding="utf8") as output_file:
    for line in all_lines:
        output_file.write(json.dumps(line, ensure_ascii=False) + "\n")
