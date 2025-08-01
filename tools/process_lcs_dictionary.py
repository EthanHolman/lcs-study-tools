import csv
import json

input_filename = "./lcs_dictionary.csv"
output_filename = "../public/lcs_dictionary.jsonl"

part_of_speech_map = {
    "Pronoun, Attribute": "Pronoun, Attribute",
    "Adjective, Indefinite": "Adjective, Indefinite",
    "Article, Indefinite": "Article, Indefinite",
    "Adjective, Estar, feeling": "Adjective, Estar, feeling",
    "Conjunction, Subordinating, normal": "Conjunction, Subordinating, normal",
    "Adverb, Manner, positive/negative": "Adverb, Manner, positive/negative",
    "Conjunction, Subordinating, potential subjunctive": "Conjunction, Subordinating, potential subjunctive",
    'Adjective, Ser, "which"': 'Adjective, Ser, "which"',
    "Conjunction, Coordinating": "Conjunction, Coordinating",
    "Pronoun, Exclamative": "Pronoun, Exclamative",
    "Pronoun, Possessive": "Pronoun, Possessive",
    "Pronoun, Demonstrative": "Pronoun, Demonstrative",
    "Conjunction, List": "Conjunction, List",
    "Preposition, Preposition": "Preposition, Preposition",
    "Adverb, Place, here/there": "Adverb, Place, here/there",
    "Other structure, Pronominal structure": "Other structure, Pronominal structure",
    "Adjective, Ordinal": "Adjective, Ordinal",
    "Adverb, Adverb- Cause/ Consequence": "Adverb, Adverb- Cause/ Consequence",
    'Adverb, Whether (formerly "boolean")': 'Adverb, Whether (formerly "boolean")',
    "Adjective, Ser, size": "Adjective, Ser, size",
    "Adverb, Time, days": "Adverb, Time, days",
    "Adjective, Ser, color": "Adjective, Ser, color",
    "Interjection, Informational": "Interjection, Informational",
    "Pronoun, Interrogative": "Pronoun, Interrogative",
    "Cluster, Conjunction cluster": "Cluster, Conjunction cluster",
    "Adverb, Time, general": "Adverb, Time, general",
    "Pronoun, Quantifier": "Pronoun, Quantifier",
    "Pronoun, Direct Object": "Pronoun, Direct Object",
    "Other structure, advanced structure": "Other structure, advanced structure",
    "Other structure, special suffix": "Other structure, special suffix",
    "Other structure, Que for obligation": "Other structure, Que for obligation",
    "Adjective, Ser, positive/negative": "Adjective, Ser, positive/negative",
    "Adverb, Manner, speed": "Adverb, Manner, speed",
    "Adjective, Ser, comparative": "Adjective, Ser, comparative",
    "Interjection, Emotional": "Interjection, Emotional",
    "Pronoun, Indefinite": "Pronoun, Indefinite",
    "Adverb, Manner, other": "Adverb, Manner, other",
    "Adverb, Place, de": "Adverb, Place, de",
    "Conjunction, Comparative": "Conjunction, Comparative",
    "Adjective, Estar, location": "Adjective, Estar, location",
    "Cluster, Idiom": "Idiom",
    "Adjective, Estar, attribute": "Adjective, Estar, attribute",
    "Adverb, Quantity (amount/degree)": "Adverb, Quantity (amount/degree)",
    "Pronoun, Subject": "Pronoun, Subject",
    "Adjective, Ser, other": "Adjective, Ser, other",
    "Adverb, Time, de": "Adverb, Time, de",
    "Pronoun, Relative": "Pronoun, Relative",
    "Pronoun, Indirect Object": "Pronoun, Indirect Object",
    "Pronoun, Prepositional": "Pronoun, Prepositional",
    "Interjection, Greetings": "Interjection, Greetings",
    "Verb, Verb": "Verb",
    "Adverb, Place, general": "Adverb, Place, general",
    "Adjective, Number": "Adjective, Number",
    "Cluster, Prepositional Cluster": "Cluster, Prepositional Cluster",
    "Article, Definite": "Article, Definite",
    "Noun, Noun": "Noun",
    "Pronoun, Reflexive": "Pronoun, Reflexive",
}


def process_part_of_speech(item: str):
    return part_of_speech_map[item]


def process_eng_str(item: str):
    pos = item.find(":")
    item = item[pos + 1 :]
    item = item.strip()
    return item


def create_item_obj(item):
    return [
        item[0],
        process_eng_str(item[1]),
        int(item[2]),
        process_part_of_speech(item[4]),
        None if len(item) < 6 else item[5],
    ]


processed_items = []


with open(input_filename, encoding="utf8") as csvfile:
    reader = csv.reader(csvfile)
    next(reader)  # skip headers
    count = 0
    for row in reader:
        processed_items.append(create_item_obj(row))
        count += 1

with open(output_filename, "w", encoding="utf8") as jsonfile:
    for x in processed_items:
        jsonfile.write(json.dumps(x, ensure_ascii=False) + "\n")
