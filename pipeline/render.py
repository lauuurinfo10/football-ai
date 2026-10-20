def _format_match_time(timestamp):
    """Transforma minutul zecimal intr-un format MM:SS."""
    if timestamp is None:
        return None

    minutes = int(timestamp)
    seconds = int(round((timestamp - minutes) * 60))

    if seconds == 60:
        minutes += 1
        seconds = 0

    return f"{minutes:02d}:{seconds:02d}"


def _overlay_duration(insight):
    """Stabileste durata vizibila a unui insight in secunde."""
    durations = {
        "key_moment": 12,
        "shot_on_target": 8,
        "foul_event": 7,
        "penalty_event": 12,
        "card_event": 7,
        "substitution_event": 7,
        "pressure_turnover": 10,
        "pressure_window": 8,
        "attacking_pattern": 8,
        "finishing_pattern": 8,
        "control_pattern": 8,
        "match_state": 6,
    }
    return durations.get(insight["kind"], 6)


def render_insight(insight, insight_id):
    """
    Transforma un insight intern intr-un obiect consumabil de UI si overlay.
    """
    timestamp = insight.get("timestamp")
    evidence = insight.get("evidence", {})

    return {
        "id": evidence.get("event_id")
        or evidence.get("turnover_event", {}).get("event_id"),
        "type": insight["kind"],
        "priority": insight.get("priority", 3),
        "match_time": _format_match_time(timestamp),
        "timestamp": timestamp,
        "team": insight.get("team"),
        "icon": {
            "key_moment": "goal",
            "shot_on_target": "shot-on-target",
            "foul_event": "foul",
            "penalty_event": "penalty",
            "card_event": (
                "red-card"
                if insight.get("evidence", {}).get("card") == "red_card"
                else "yellow-card"
            ),
            "substitution_event": "substitution",
            "pressure_window": "pressure",
            "pressure_turnover": "pressure",
            "tactical_pattern": "pressure",
        }.get(insight["kind"], "insight"),
        "title": insight["title"],
        "description": insight["explanation"],
        "overlay": {
            "visible_from": timestamp,
            "duration_seconds": _overlay_duration(insight),
            "headline": insight["title"],
            "subheadline": insight["explanation"],
            "team": insight.get("team"),
        },
        "evidence": evidence,
    }


def render_insights(insights):
    """Randeaza insight-urile cronologic, cu sumarul la final."""
    rendered = []
    for index, insight in enumerate(insights):
        rendered_insight = render_insight(
            insight,
            f"insight-{index}-{insight['kind']}-{insight.get('timestamp')}",
        )
        if rendered_insight["id"] is None:
            rendered_insight["id"] = (
                f"insight-{index}-{insight['kind']}-"
                f"{insight.get('timestamp')}"
            )
        rendered.append(rendered_insight)

    return sorted(
        rendered,
        key=lambda insight: (
            insight["timestamp"] is None,
            insight["timestamp"] or 0,
            insight["priority"],
        ),
    )


def build_render_payload(match, stats, insights, player_stats=None):
    """
    Construieste payload-ul complet pentru UI si integrarea de overlay.
    """
    home = match["home_team"]
    away = match["away_team"]

    from pipeline.interpret import calculate_match_state

    timeline_timestamps = sorted({0.0, *{
        insight["timestamp"]
        for insight in insights
        if insight.get("timestamp") is not None
    }})
    timeline = []
    from pipeline.interpret import (
        active_lineups_at,
        calculate_player_stats,
        calculate_stats,
    )

    for timestamp in timeline_timestamps:
        snapshot_stats = calculate_stats(match, timestamp)
        timeline.append(
            {
                "timestamp": timestamp,
                "score": {
                    home: snapshot_stats[home]["goals"],
                    away: snapshot_stats[away]["goals"],
                },
                "stats": snapshot_stats,
                "player_stats": calculate_player_stats(match, timestamp),
                "lineups": active_lineups_at(match, timestamp),
                "state": calculate_match_state(match, timestamp),
            }
        )

    return {
        "match": {
            "home_team": home,
            "away_team": away,
            "lineups": match.get("lineups", {}),
            "substitutes": match.get("substitutes", {}),
            "score": {
                home: stats[home]["goals"],
                away: stats[away]["goals"],
            },
            "events": match.get("events", []),
        },
        "stats": stats,
        "player_stats": player_stats or {},
        "insights": render_insights(insights),
        "timeline": timeline,
        "match_state": calculate_match_state(match),
        "overlay_schema_version": "1.0",
    }


if __name__ == "__main__":
    import json

    from pipeline.insights import build_insights
    from pipeline.interpret import (
        active_lineups_at,
        calculate_player_stats,
        calculate_stats,
        load_match,
    )

    match = load_match("data/match.json")
    stats = calculate_stats(match)
    player_stats = calculate_player_stats(match)
    insights = build_insights(match, stats)
    payload = build_render_payload(match, stats, insights, player_stats)

    print(json.dumps(payload, indent=2, ensure_ascii=False))
