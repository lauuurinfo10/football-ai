import os
from pathlib import Path

from dotenv import load_dotenv
from openai import OpenAI, OpenAIError


PROJECT_ROOT = Path(__file__).resolve().parents[1]
load_dotenv(PROJECT_ROOT / ".env")


def _required_env(name):
    value = os.getenv(name)
    if not value:
        raise RuntimeError(
            f"Lipsește variabila {name}. Configureaz-o în {PROJECT_ROOT / '.env'}."
        )
    return value


def _create_chat_client():
    endpoint = _required_env("AZURE_OPENAI_ENDPOINT").rstrip("/")
    api_key = _required_env("AZURE_OPENAI_KEY")

    # Azure AI Foundry project endpoints expose the OpenAI-compatible API here.
    return OpenAI(
        api_key=api_key,
        base_url=f"{endpoint}/openai/v1",
    )


def local_match_recap(stats, home_team, away_team, language="en"):
    """Return a useful recap when a hosted language model is unavailable."""
    home = stats[home_team]
    away = stats[away_team]
    winner = home_team if home["goals"] > away["goals"] else away_team
    draw = home["goals"] == away["goals"]
    possession_team = home_team if home["possession"] >= away["possession"] else away_team
    shots_team = home_team if home["shots"] >= away["shots"] else away_team

    if language == "ro":
        result = (
            f"{home_team} și {away_team} au încheiat la egalitate, "
            f"{home['goals']}–{away['goals']}."
            if draw else f"{winner} a câștigat cu {home['goals']}–{away['goals']}."
        )
        return (
            f"{result} {possession_team} a avut mai mult control al mingii "
            f"({stats[possession_team]['possession']}% posesie), iar {shots_team} "
            f"a creat cele mai multe finalizări ({stats[shots_team]['shots']} șuturi). "
            f"Meciul a avut {home['pressure'] + away['pressure']} momente de presiune, "
            "iar diferența a venit din eficiența la momentele decisive."
        )
    if language == "it":
        result = (
            f"{home_team} e {away_team} hanno pareggiato {home['goals']}–{away['goals']}."
            if draw else f"{winner} ha vinto {home['goals']}–{away['goals']}."
        )
        return (
            f"{result} {possession_team} ha controllato di più il pallone "
            f"({stats[possession_team]['possession']}% di possesso), mentre {shots_team} "
            f"ha creato più conclusioni ({stats[shots_team]['shots']} tiri). "
            f"La partita ha registrato {home['pressure'] + away['pressure']} momenti di pressione "
            "e gli episodi decisivi hanno fatto la differenza."
        )
    result = (
        f"{home_team} and {away_team} drew {home['goals']}–{away['goals']}."
        if draw else f"{winner} won {home['goals']}–{away['goals']}."
    )
    return (
        f"{result} {possession_team} controlled more of the ball "
        f"with {stats[possession_team]['possession']}% possession, while {shots_team} "
        f"created the greater shot volume with {stats[shots_team]['shots']} attempts. "
        f"The match contained {home['pressure'] + away['pressure']} pressure moments, "
        "with decisive efficiency shaping the final score."
    )


def explain_match(
    stats,
    home_team,
    away_team,
    mode="fan",
    match=None,
    language="en",
):
    if mode not in {"fan", "analyst"}:
        raise ValueError("mode trebuie să fie 'fan' sau 'analyst'.")
    if language not in {"ro", "it", "en"}:
        raise ValueError("language trebuie să fie 'ro', 'it' sau 'en'.")

    home = stats[home_team]
    away = stats[away_team]

    from pipeline.insights import build_insights

    insight_match = match or {
        "home_team": home_team,
        "away_team": away_team,
        "events": [],
    }
    insights = build_insights(insight_match, stats)
    insight_text = "\n".join(
        f"- {insight['title']}: {insight['explanation']}"
        for insight in insights
    )

    language_name = {"ro": "Romanian", "it": "Italian", "en": "English"}[language]
    prompt = f"""
You are a football analyst AI. Given these match statistics, generate a {mode} commentary.
Write the final answer in {language_name}.

Match: {home_team} {home['goals']} - {away['goals']} {away_team}

{home_team}: {home['passes']} passes ({home['pass_accuracy']}% accuracy),
{home['shots']} shots ({home['shots_on_target']} on target),
{home['possession']}% possession, {home['corners']} corners,
{home['fouls']} fouls, {home['pressure']} pressure moments

{away_team}: {away['passes']} passes ({away['pass_accuracy']}% accuracy),
{away['shots']} shots ({away['shots_on_target']} on target),
{away['possession']}% possession, {away['corners']} corners,
{away['fouls']} fouls, {away['pressure']} pressure moments

Deterministic insights:
{insight_text}

Mode: {"casual fan - short, exciting, emotional" if mode == "fan" else "analyst - tactical, detailed, data-driven"}

Generate a 3-4 sentence match summary.
"""

    client = _create_chat_client()
    response = client.chat.completions.create(
        model=_required_env("AZURE_OPENAI_DEPLOYMENT"),
        messages=[
            {
                "role": "system",
                "content": (
                    "You are a football insights engine. Do not invent events or "
                    "facts that are not supported by the supplied statistics."
                ),
            },
            {"role": "user", "content": prompt},
        ],
        temperature=0.4,
        max_tokens=220,
    )

    return response.choices[0].message.content


if __name__ == "__main__":
    from pipeline.interpret import calculate_stats, load_match

    match = load_match("data/match.json")
    stats = calculate_stats(match)

    print("=== MOD FAN ===")
    print(explain_match(
        stats,
        match["home_team"],
        match["away_team"],
        mode="fan",
        match=match,
    ))
    print()
    print("=== MOD ANALIST ===")
    print(explain_match(
        stats,
        match["home_team"],
        match["away_team"],
        mode="analyst",
        match=match,
    ))
