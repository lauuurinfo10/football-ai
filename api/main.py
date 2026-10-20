from pathlib import Path
import os

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from openai import OpenAIError

from pipeline.insights import build_insights
from pipeline.interpret import (
    active_lineups_at,
    calculate_match_state,
    calculate_player_stats,
    calculate_stats,
    events_until,
    load_match,
)
from pipeline.render import build_render_payload
from pipeline.explain import explain_match, local_match_recap
from data.validation import validate_match


PROJECT_ROOT = Path(__file__).resolve().parents[1]
MATCH_PATH = Path(
    os.getenv("MATCH_DATA_PATH", str(PROJECT_ROOT / "data" / "match.json"))
)


def allowed_origins():
    configured = os.getenv("CORS_ORIGINS") or os.getenv("UI_ORIGINS")
    if configured:
        return [origin.strip() for origin in configured.split(",") if origin.strip()]
    return [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ]


app = FastAPI(
    title="Synthetic Match Insights Engine",
    description="Explainable football intelligence for synthetic match events.",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins(),
    allow_credentials=True,
    allow_methods=["GET"],
    allow_headers=["*"],
)


def build_match_payload(until=None):
    """Ruleaza pipeline-ul complet si returneaza payload-ul pentru clienti."""
    match = load_match(MATCH_PATH)
    validate_match(match)
    stats = calculate_stats(match, until)
    player_stats = calculate_player_stats(match, until)
    insights = build_insights(match, stats)
    payload = build_render_payload(match, stats, insights, player_stats)
    if until is not None:
        payload["match"]["lineups"] = active_lineups_at(match, until)
        payload["match"]["events"] = events_until(match, until)
        payload["match"]["score"] = {
            match["home_team"]: stats[match["home_team"]]["goals"],
            match["away_team"]: stats[match["away_team"]]["goals"],
        }
        payload["match_state"] = calculate_match_state(match, until)
    return payload


@app.get("/api/health")
def health_check():
    """Verifica daca serviciul API este disponibil."""
    return {"status": "ok"}


@app.get("/api/match")
def get_match(at: float | None = Query(default=None, ge=0, le=120)):
    """Returneaza meciul, statisticile si insight-urile randate."""
    try:
        return build_match_payload(at)
    except (FileNotFoundError, KeyError, ValueError) as error:
        raise HTTPException(
            status_code=500,
            detail=f"Nu s-a putut construi payload-ul meciului: {error}",
        ) from error


@app.get("/api/stats")
def get_stats():
    """Returneaza doar statisticile calculate pentru meci."""
    payload = build_match_payload()
    return payload["stats"]


@app.get("/api/insights")
def get_insights():
    """Returneaza doar insight-urile pregatite pentru UI si overlay."""
    payload = build_match_payload()
    return payload["insights"]


@app.get("/api/players")
def get_players():
    """Returneaza statisticile tuturor jucatorilor."""
    payload = build_match_payload()
    return payload["player_stats"]


@app.get("/api/players/{team}/{player}")
def get_player(team: str, player: str):
    """Returneaza statisticile unui jucator selectat."""
    payload = build_match_payload()
    team_players = payload["player_stats"].get(team)
    if team_players is None or player not in team_players:
        raise HTTPException(
            status_code=404,
            detail=f"Jucatorul {player} nu a fost gasit in echipa {team}.",
        )

    return team_players[player]


@app.get("/api/recap")
def get_recap(
    mode: str = Query(default="fan", pattern="^(fan|analyst)$"),
    language: str = Query(default="en", pattern="^(ro|it|en)$"),
):
    """Generează un recap Azure OpenAI pe baza insight-urilor determinate."""
    try:
        match = load_match(MATCH_PATH)
        validate_match(match)
        stats = calculate_stats(match)
        return {
            "mode": mode,
            "language": language,
            "text": explain_match(
                stats,
                match["home_team"],
                match["away_team"],
                mode=mode,
                match=match,
                language=language,
            ),
        }
    except (
        FileNotFoundError,
        KeyError,
        ValueError,
        RuntimeError,
        OpenAIError,
    ):
        # A recap remains available for a live production workflow even when
        # Azure credentials are absent or the model endpoint is unavailable.
        match = load_match(MATCH_PATH)
        validate_match(match)
        stats = calculate_stats(match)
        return {
            "mode": mode,
            "language": language,
            "text": local_match_recap(
                stats,
                match["home_team"],
                match["away_team"],
                language=language,
            ),
            "source": "deterministic_fallback",
        }
