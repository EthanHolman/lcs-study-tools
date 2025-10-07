import csv
import re

verb_stuff = []

# with open("lcs_dictionary.csv", encoding="utf8") as csvfile:
#     reader = csv.reader(csvfile)
#     next(reader)
#     mydata = set()
#     for row in reader:
#         if len(row[5]) > 0:
#             mydata.add(row[4])
#             if row[4] != "Verb, Verb":
#                 print(row)
#             # stuff = row[1]
#             # if "impersonal" in stuff:
#             #     print(row)
#             # result = re.search("\(.+\)", stuff)
#             # if result:
#             #     result = result.group(0).split(" ")[1:]
#             #     without_verb = " ".join(result)
#             #     mydata.add(without_verb)
#     print(mydata)

with open("lcs_dictionary.csv", encoding="utf8") as csvfile:
    reader = csv.reader(csvfile)
    next(reader)
    count = 0
    for row in reader:
        # if count > 25:
        #     exit()
        if len(row[5]) > 0:
            if "haber" in row[5].lower():
                print(row)
                count += 1


# VERB PRINTING

# with open("lcs_dictionary.csv", encoding="utf8") as csvfile:
#     reader = csv.reader(csvfile)
#     next(reader)
#     persons = {}
#     for row in reader:
#         if len(row[5]) > 0:
#             stuff = row[1]
#             result = re.search("\(.+\)", stuff)
#             if result:
#                 result = result.group(0).strip("()").split(",")
#                 if len(result) == 3:
#                     result[2] = result[2].strip()
#                     if result[2] == "2nd person plural":
#                         print(row)
#                     persons[result[2]] = persons.get(result[2], 0) + 1

#     print(persons)
