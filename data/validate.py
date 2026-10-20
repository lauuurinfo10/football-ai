"""Rulează validările pentru meciul sintetic exportat."""

import json
from pathlib import Path

try:
    from data.validation import validate_match
except ModuleNotFoundError:
    from validation import validate_match


MATCH_PATH = Path(__file__).with_name("match.json")


def main():
    with MATCH_PATH.open(encoding="utf-8") as file:
        match = json.load(file)
    validate_match(match)
    print("Match validation passed.")


if __name__ == "__main__":
    main()
