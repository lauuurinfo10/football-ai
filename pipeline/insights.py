def _event_evidence(event):
    """Returneaza identificatorii folositi pentru trasabilitatea insight-ului."""
    return {
        "event_id": event.get("event_id"),
        "sequence": event.get("sequence"),
        "timestamp": event.get("timestamp"),
    }


def _count_text(value, singular, plural):
    return f"{value} {singular if value == 1 else plural}"


def _pressure_windows(match, window_size=5):
    """Gaseste ferestre de timp cu diferenta semnificativa de presiune."""
    home = match["home_team"]
    away = match["away_team"]
    teams = [home, away]
    pressure_events = [
        event
        for event in match["events"]
        if event["type"] == "pressure"
    ]

    windows = []
    for start in range(0, 90, window_size):
        end = start + window_size
        counts = {
            team: sum(
                1
                for event in pressure_events
                if event.get("pressing_team", event["team"]) == team
                and start <= event["timestamp"] < end
            )
            for team in teams
        }
        leading_team = max(teams, key=lambda team: counts[team])
        other_team = away if leading_team == home else home

        if counts[leading_team] >= 6 and counts[leading_team] - counts[other_team] >= 3:
            windows.append(
                {
                    "start": start,
                    "end": end,
                    "team": leading_team,
                    "opponent": other_team,
                    "team_pressure": counts[leading_team],
                    "opponent_pressure": counts[other_team],
                }
            )

    return windows


def _pressure_follow_up(events, window):
    """Gaseste evenimentele care urmeaza unei ferestre de presiune."""
    start = window["start"]
    follow_up_end = window["end"] + 5
    team = window["team"]
    opponent = window["opponent"]

    related_events = []
    for event in events:
        timestamp = event["timestamp"]
        is_in_follow_up = follow_up_end > timestamp >= window["end"]

        if not is_in_follow_up:
            continue

        is_team_attack = (
            event["team"] == team
            and event["type"] in {"shot", "corner", "goal"}
        )
        is_opponent_foul = (
            event["team"] == opponent
            and event["type"] == "foul"
        )

        if is_team_attack or is_opponent_foul:
            related_events.append(event)

    return related_events


def _pressure_turnovers(events, window):
    """Gaseste schimbari de posesie care urmeaza unei ferestre de presiune."""
    start = window["end"]
    end = window["end"] + 5
    pressing_team = window["team"]
    team_under_pressure = window["opponent"]

    turnovers = []
    for event in events:
        if event["type"] != "possession_change":
            continue

        if not start <= event["timestamp"] < end:
            continue

        if event["team"] != pressing_team:
            continue

        turnovers.append(
            {
                "event": event,
                "pressing_team": pressing_team,
                "team_under_pressure": team_under_pressure,
            }
        )

    return turnovers


def _turnover_follow_up(events, turnover):
    """Gaseste actiunile ofensive dupa recuperarea posesiei."""
    turnover_event = turnover["event"]
    start = turnover_event["timestamp"]
    end = start + 3
    team = turnover["pressing_team"]

    return [
        event
        for event in events
        if start < event["timestamp"] <= end
        and event["team"] == team
        and event["type"] in {"shot", "corner", "goal"}
    ]


def _turnover_reason_text(reason):
    return {
        "pressure": "presiune",
        "failed_pass": "o pasa nereusita",
        "tackle": "un tackling reusit",
        "foul": "un fault",
        "unforced_error": "o eroare nefortata",
    }.get(reason, "un eveniment defensiv")


def build_insights(match, stats):
    """
    Construieste insight-uri explicabile pe baza evenimentelor si statisticilor.

    Fiecare insight pastreaza dovezi masurabile, astfel incat textul generat
    ulterior de model sa poata fi verificat impotriva datelor originale.
    """
    home = match["home_team"]
    away = match["away_team"]
    teams = [home, away]
    events = sorted(match["events"], key=lambda event: event["timestamp"])
    insights = []

    for window in _pressure_windows(match):
        follow_up_events = _pressure_follow_up(events, window)
        turnovers = _pressure_turnovers(events, window)
        follow_up_counts = {
            "shot": sum(
                event["type"] == "shot"
                for event in follow_up_events
            ),
            "goal": sum(
                event["type"] == "goal"
                for event in follow_up_events
            ),
            "corner": sum(
                event["type"] == "corner"
                for event in follow_up_events
            ),
            "opponent_foul": sum(
                event["type"] == "foul"
                for event in follow_up_events
            ),
        }
        follow_up_summary = []
        if follow_up_counts["goal"]:
            follow_up_summary.append(
                _count_text(follow_up_counts["goal"], "gol", "goluri")
            )
        if follow_up_counts["shot"]:
            follow_up_summary.append(
                _count_text(follow_up_counts["shot"], "sut", "suturi")
            )
        if follow_up_counts["corner"]:
            follow_up_summary.append(
                _count_text(
                    follow_up_counts["corner"],
                    "corner",
                    "cornere",
                )
            )
        if follow_up_counts["opponent_foul"]:
            follow_up_summary.append(
                _count_text(
                    follow_up_counts["opponent_foul"],
                    "fault al adversarei",
                    "faulturi ale adversarei",
                )
            )

        for turnover in turnovers:
            turnover_event = turnover["event"]
            attacking_events = _turnover_follow_up(events, turnover)
            attacking_counts = {
                "shot": sum(
                    event["type"] == "shot"
                    for event in attacking_events
                ),
                "goal": sum(
                    event["type"] == "goal"
                    for event in attacking_events
                ),
                "corner": sum(
                    event["type"] == "corner"
                    for event in attacking_events
                ),
            }

            action_parts = []
            if attacking_counts["goal"]:
                action_parts.append(
                    _count_text(attacking_counts["goal"], "gol", "goluri")
                )
            if attacking_counts["shot"]:
                action_parts.append(
                    _count_text(attacking_counts["shot"], "sut", "suturi")
                )
            if attacking_counts["corner"]:
                action_parts.append(
                    _count_text(
                        attacking_counts["corner"],
                        "corner",
                        "cornere",
                    )
                )

            if action_parts:
                action_text = ", ".join(action_parts)
                turnover_explanation = (
                    f"{turnover['pressing_team']} a recuperat posesia de la "
                    f"{turnover['team_under_pressure']} la minutul "
                    f"{turnover_event['timestamp']:.1f}, dupa "
                    f"{_turnover_reason_text(turnover_event.get('turnover_reason'))}. "
                    f"In urmatoarele trei "
                    f"minute au urmat {action_text}."
                )
            else:
                turnover_explanation = (
                    f"{turnover['pressing_team']} a recuperat posesia de la "
                    f"{turnover['team_under_pressure']} la minutul "
                    f"{turnover_event['timestamp']:.1f}, dupa "
                    f"{_turnover_reason_text(turnover_event.get('turnover_reason'))}, "
                    "fara o finalizare "
                    "sau un corner in urmatoarele trei minute."
                )

            insights.append(
                {
                    "kind": "pressure_turnover",
                    "priority": 1 if attacking_counts["goal"] else 2,
                    "timestamp": turnover_event["timestamp"],
                    "team": turnover["pressing_team"],
                    "title": (
                        f"{turnover['pressing_team']} a recuperat posesia "
                        f"sub presiune"
                    ),
                    "explanation": turnover_explanation,
                    "evidence": {
                        "turnover_event": _event_evidence(turnover_event),
                        "pressing_team": turnover["pressing_team"],
                        "team_under_pressure": (
                            turnover["team_under_pressure"]
                        ),
                        "turnover_reason": turnover_event.get(
                            "turnover_reason"
                        ),
                        "turnover_cause_event_id": turnover_event.get(
                            "turnover_cause_event_id"
                        ),
                        "attacking_window": {
                            "start": turnover_event["timestamp"],
                            "end": turnover_event["timestamp"] + 3,
                        },
                        "attacking_counts": attacking_counts,
                        "related_events": [
                            _event_evidence(event)
                            | {
                                "type": event["type"],
                                "team": event["team"],
                                "player": event.get("player"),
                            }
                            for event in attacking_events
                        ],
                    },
                }
            )

        if follow_up_summary:
            follow_up_text = ", ".join(follow_up_summary)
            explanation = (
                f"{window['team']} a exercitat {window['team_pressure']} "
                f"momente de presiune asupra echipei {window['opponent']} "
                f"intre minutele {window['start']}-"
                f"{window['end']}, fata de {window['opponent_pressure']} "
                f"ale adversarei. In urmatoarele cinci minute, aceasta presiune a "
                f"fost urmata de {follow_up_text}."
            )
        else:
            explanation = (
            f"{window['team']} a exercitat {window['team_pressure']} "
            f"momente de presiune asupra echipei {window['opponent']} "
            f"intre minutele {window['start']}-"
            f"{window['end']}, fata de {window['opponent_pressure']} "
            "ale adversarei, fara o consecinta imediata in date."
            )

        insights.append(
            {
                "kind": "pressure_window",
                "priority": 2,
                "timestamp": window["start"],
                "team": window["team"],
                "title": (
                    f"{window['team']} a exercitat presiune "
                    f"intre minutele {window['start']}-{window['end']}"
                ),
                "explanation": explanation,
                "evidence": {
                    **window,
                    "follow_up_window": {
                        "start": window["end"],
                        "end": window["end"] + 5,
                    },
                    "follow_up_counts": follow_up_counts,
                    "related_events": [
                        _event_evidence(event)
                        | {
                            "type": event["type"],
                            "team": event["team"],
                            "player": event.get("player"),
                        }
                        for event in follow_up_events
                    ],
                },
            }
        )

    for event in events:
        if event["type"] == "goal":
            related_shot = next(
                (
                    candidate
                    for candidate in events
                    if candidate.get("event_id") == event.get("related_event_id")
                ),
                None,
            )
            insights.append(
                {
                    "kind": "key_moment",
                    "priority": 1,
                    "timestamp": event["timestamp"],
                    "team": event["team"],
                    "title": f"Gol pentru {event['team']}",
                    "explanation": (
                        f"{event['player']} a marcat. Golul este legat de un "
                        "sut pe poarta din cronologia meciului."
                    ),
                    "evidence": {
                        **_event_evidence(event),
                        "player": event["player"],
                        "related_shot_id": (
                            related_shot.get("event_id")
                            if related_shot
                            else None
                        ),
                    },
                }
            )

    for event in events:
        event_type = event["type"]
        timestamp = event["timestamp"]
        player = event.get("player", "Jucător necunoscut")

        if event_type == "shot" and event.get("on_target"):
            insights.append(
                {
                    "kind": "shot_on_target",
                    "priority": 1 if event.get("outcome") == "goal" else 2,
                    "timestamp": timestamp,
                    "team": event["team"],
                    "title": f"Șut pe poartă pentru {event['team']}",
                    "explanation": (
                        f"{player} a trimis un șut pe poartă pentru "
                        f"{event['team']}. Rezultat: {event.get('outcome', 'neprecizat')}."
                    ),
                    "evidence": {
                        **_event_evidence(event),
                        "player": player,
                        "outcome": event.get("outcome"),
                        "speed_kmh": event.get("speed_kmh"),
                        "body_part": event.get("body_part"),
                    },
                }
            )
        elif event_type == "foul":
            insights.append(
                {
                    "kind": "foul_event",
                    "priority": 2,
                    "timestamp": timestamp,
                    "team": event["team"],
                    "title": f"Fault comis de {player}",
                    "explanation": (
                        f"{player} ({event['team']}) a faultat jucătorul "
                        f"{event.get('fouled_player', 'advers') }."
                    ),
                    "evidence": {
                        **_event_evidence(event),
                        "fouled_by": player,
                        "fouled_player": event.get("fouled_player"),
                        "is_attacking_foul": event.get("is_attacking_foul"),
                    },
                }
            )
        elif event_type == "penalty":
            insights.append(
                {
                    "kind": "penalty_event",
                    "priority": 1,
                    "timestamp": timestamp,
                    "team": event["team"],
                    "title": f"Penalty pentru {event['team']}",
                    "explanation": (
                        f"{player} a executat un penalty pentru {event['team']}. "
                        f"Rezultat: {event.get('outcome', 'neprecizat')}."
                    ),
                    "evidence": {
                        **_event_evidence(event),
                        "player": player,
                        "outcome": event.get("outcome"),
                    },
                }
            )
        elif event_type in {"yellow_card", "red_card"}:
            card = "cartonaș galben" if event_type == "yellow_card" else "cartonaș roșu"
            insights.append(
                {
                    "kind": "card_event",
                    "priority": 1 if event_type == "red_card" else 2,
                    "timestamp": timestamp,
                    "team": event["team"],
                    "title": f"{card.capitalize()} pentru {player}",
                    "explanation": (
                        f"{player} ({event['team']}) a primit {card}. "
                        f"Motiv: {event.get('reason', 'neprecizat')}."
                    ),
                    "evidence": {
                        **_event_evidence(event),
                        "player": player,
                        "card": event_type,
                        "reason": event.get("reason"),
                    },
                }
            )
        elif event_type == "substitution":
            insights.append(
                {
                    "kind": "substitution_event",
                    "priority": 2,
                    "timestamp": timestamp,
                    "team": event["team"],
                    "title": f"Schimbare pentru {event['team']}",
                    "explanation": (
                        f"{event.get('player_in', 'Un jucător') } a intrat în locul "
                        f"lui {player} pentru {event['team']}."
                    ),
                    "evidence": {
                        **_event_evidence(event),
                        "player_out": player,
                        "player_in": event.get("player_in"),
                        "minute": event.get("minute"),
                    },
                }
            )

    for team in teams:
        current = stats[team]
        opponent = stats[away if team == home else home]

        if current["pressure"] - opponent["pressure"] >= 20:
            insights.append(
                {
                    "kind": "tactical_pattern",
                    "priority": 2,
                    "timestamp": None,
                    "team": team,
                    "title": f"Presiune ridicata exercitata de {team}",
                    "explanation": (
                        f"{team} a inregistrat cu "
                        f"{current['pressure'] - opponent['pressure']} mai multe "
                        "momente de presiune decat adversara."
                    ),
                    "evidence": {
                        "team_pressure": current["pressure"],
                        "opponent_pressure": opponent["pressure"],
                    },
                }
            )

        if current["shots"] - opponent["shots"] >= 6:
            insights.append(
                {
                    "kind": "attacking_pattern",
                    "priority": 2,
                    "timestamp": None,
                    "team": team,
                    "title": f"{team} a generat mai multe finalizari",
                    "explanation": (
                        f"{team} a avut {current['shots']} suturi, fata de "
                        f"{opponent['shots']} ale adversarei."
                    ),
                    "evidence": {
                        "team_shots": current["shots"],
                        "opponent_shots": opponent["shots"],
                        "team_shots_on_target": current["shots_on_target"],
                    },
                }
            )

        if (
            current["shots"] >= 8
            and current["shots_on_target"] / current["shots"] >= 0.5
        ):
            insights.append(
                {
                    "kind": "finishing_pattern",
                    "priority": 2,
                    "timestamp": None,
                    "team": team,
                    "title": f"{team} a fost eficienta la finalizare",
                    "explanation": (
                        f"{current['shots_on_target']} din {current['shots']} "
                        "suturi au fost pe poarta."
                    ),
                    "evidence": {
                        "shots": current["shots"],
                        "shots_on_target": current["shots_on_target"],
                        "on_target_rate": round(
                            current["shots_on_target"]
                            / current["shots"]
                            * 100,
                            1,
                        ),
                    },
                }
            )

        if (
            current["average_possession_duration"] >= 3
            and current["passes_per_possession"] >= 25
        ):
            insights.append(
                {
                    "kind": "control_pattern",
                    "priority": 3,
                    "timestamp": None,
                    "team": team,
                    "title": f"{team} a controlat fazele de posesie",
                    "explanation": (
                        f"Posesiile au durat in medie "
                        f"{current['average_possession_duration']} minute, "
                        f"cu {current['passes_per_possession']} pase per posesie."
                    ),
                    "evidence": {
                        "possession": current["possession"],
                        "possessions": current["possessions"],
                        "average_duration": (
                            current["average_possession_duration"]
                        ),
                        "passes_per_possession": (
                            current["passes_per_possession"]
                        ),
                    },
                }
            )

    if abs(stats[home]["possession"] - stats[away]["possession"]) <= 5:
        insights.append(
            {
                "kind": "match_state",
                "priority": 3,
                "timestamp": None,
                "team": None,
                "title": "Meci echilibrat la nivel de posesie",
                "explanation": (
                    f"Diferenta de posesie a fost de "
                    f"{abs(stats[home]['possession'] - stats[away]['possession']):.1f} "
                    "puncte procentuale."
                ),
                "evidence": {
                    home: stats[home]["possession"],
                    away: stats[away]["possession"],
                },
            }
        )

    return sorted(
        insights,
        key=lambda insight: (
            insight["priority"],
            insight["timestamp"] is None,
            insight["timestamp"] or 0,
        ),
    )


if __name__ == "__main__":
    import json

    from pipeline.interpret import calculate_stats, load_match

    match = load_match("data/match.json")
    stats = calculate_stats(match)
    print(json.dumps(build_insights(match, stats), indent=2, ensure_ascii=False))
