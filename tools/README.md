# LCS Study App - DEV TOOLS

This directory contains python scripts that are used to pull and process data for use in the LCS Study App. They shouldn't need to be re-run unless LCS data changes (like, they update the lesson 250 dictionary or modify the lesson quizzes).

## Getting Started

It's recommended to use a Python Virtual Environment and install required dependencies:

`python3 -m venv venv`

`source venv/bin/activate`

`pip install -r requirements.txt`

## The tools:

- `download_chapter_quizzes.py` -- This one downloads all the LCS lesson quizzes. You need an API key, which I extracted via the dev tools in my browser.

- `process_chapter_quizzes.py` -- This one builds a single JSONL file that powers the UI's chapter quizzing functionality. It depends on the 'download chapter quizzes' script having already been run, and takes the resulting directory of raw LCS JSON quizzes and extracts only the necessary fields, while also performing some formatting fixes/normalizations.

- `process_lcs_dictionary.py` -- Takes in the LCS Dictionary CSV file (downloaded from the google sheets on the last lesson, number 250) and builds a JSONL file. I added a bit of processing to "clean up" the english/spanish translations, making things more friendly and readable.
