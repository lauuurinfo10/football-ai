import json
import math
from copy import deepcopy
from collections import Counter


def calculate_shot_xg(event, home_team=None):
    """
    Calculează Expected Goals (xG) pentru un șut sau penalty pe baza
    poziției pe teren [x, y], părții corpului și presiunii defensive.
    """
    event_type = event.get("type")
    if event_type == "penalty":
        return 0.78

    if event_type not in {"shot", "goal"}:
        return 0.0

    pos = event.get("position") or [82, 50]
    x, y = float(pos[0]), float(pos[1])

    # Distanța față de cea mai apropiată poartă (în metri aproximativi pe un teren 105x68)
    dist_left = math.hypot(x * 1.05, (y - 50.0) * 0.68)
    dist_right = math.hypot((100.0 - x) * 1.05, (y - 50.0) * 0.68)
    distance_m = min(dist_left, dist_right)

    # Penalizare unghi față de axul central al porții (y = 50)
    central_offset = abs(y - 50.0) / 50.0

    # Model logistic de bază pentru xG
    raw_xg = 0.68 * math.exp(-0.085 * max(0.0, distance_m - 5.0)) * (1.0 - 0.45 * central_offset)

    if event.get("body_part") == "head":
        raw_xg *= 0.65
    if event.get("under_pressure"):
        raw_xg *= 0.78
    if event.get("on_target"):
        raw_xg *= 1.12

    return round(min(0.92, max(0.02, raw_xg)), 2)


def events_until(match, timestamp=None):
    """Returnează evenimentele până la momentul selectat inclusiv."""
    events = match.get("events", [])
    if timestamp is None:
        return list(events)
    return [
        event for event in events
        if event.get("timestamp", 0) <= timestamp
    ]


def match_until(match, timestamp=None):
    """Creează o vedere temporală a meciului fără a modifica datele originale."""
    snapshot = deepcopy(match)
    snapshot["events"] = events_until(match, timestamp)
    return snapshot


def active_lineups_at(match, timestamp=None):
    """Calculează formațiile active folosind aceeași regulă pentru tot UI-ul."""
    lineups = {
        team: [dict(player) for player in lineup]
        for team, lineup in match.get("lineups", {}).items()
    }
    roster = {
        team: {
            player["player"]: player
            for player in (
                match.get("lineups", {}).get(team, [])
                + match.get("substitutes", {}).get(team, [])
            )
        }
        for team in lineups
    }
    substitutions = [
        event for event in events_until(match, timestamp)
        if event.get("type") == "substitution"
    ]
    substitutions.sort(
        key=lambda event: (event.get("timestamp", 0), event.get("sequence", 0))
    )

    for event in substitutions:
        team = event["team"]
        outgoing = event.get("player_out", event.get("player"))
        incoming = event.get("player_in")
        lineup = lineups.get(team, [])
        outgoing_index = next(
            (index for index, player in enumerate(lineup)
             if player["player"] == outgoing),
            None,
        )
        incoming_player = roster.get(team, {}).get(incoming)
        if outgoing_index is None or incoming_player is None:
            continue
        lineups[team][outgoing_index] = dict(incoming_player)

    return lineups


get_active_lineups_at_time = active_lineups_at


def calculate_match_state(match, timestamp=None):
    """Clasifică forma meciului folosind presiune, posesie, scor și ritm."""
    teams = [match["home_team"], match["away_team"]]
    events = events_until(match, timestamp)
    stats = calculate_stats(match, timestamp)
    recent_start = max(0.0, float(timestamp or 90.0) - 5.0)
    recent_events = [
        event for event in events
        if event.get("timestamp", 0) >= recent_start
    ]
    pressure = Counter(
        event.get("pressing_team", event.get("team"))
        for event in recent_events
        if event.get("type") == "pressure"
    )
    pressure_gap = abs(pressure[teams[0]] - pressure[teams[1]])
    possession_gap = abs(
        stats[teams[0]]["possession"] - stats[teams[1]]["possession"]
    )
    score_gap = abs(stats[teams[0]]["goals"] - stats[teams[1]]["goals"])
    event_rate = len(recent_events)

    match_time = float(timestamp) if timestamp is not None else 90.0
    if score_gap and match_time >= 70:
        state = "clutch"
    elif event_rate >= 10 and pressure_gap >= 2:
        state = "chaos"
    elif pressure_gap >= 3 or possession_gap >= 12:
        state = "pressure"
    else:
        state = "control"

    dominant_team = max(
        teams,
        key=lambda team: (
            pressure[team],
            stats[team]["possession"],
            stats[team]["goals"],
        ),
    )
    return {
        "state": state,
        "dominant_team": dominant_team,
        "pressure": dict(pressure),
        "pressure_gap": pressure_gap,
        "possession_gap": round(possession_gap, 1),
        "score_gap": score_gap,
        "recent_event_count": event_rate,
    }


def load_match(filepath):
    with open(filepath, encoding="utf-8") as f:
        return json.load(f)


def calculate_possession(match, until=None):
    home = match["home_team"]
    away = match["away_team"]
    events = sorted(events_until(match, until), key=lambda event: event["timestamp"])
    teams = [home, away]

    possession_time = {home: 0.0, away: 0.0}

    if not events:
        return {home: 50.0, away: 50.0}

    current_team = events[0]["team"]
    last_timestamp = 0.0
    match_end = 90.0 if until is None else max(0.0, float(until))
    if events:
        match_end = max(match_end, max(event["timestamp"] for event in events))

    for event in events:
        timestamp = max(last_timestamp, event["timestamp"])
        possession_time[current_team] += timestamp - last_timestamp

        if event["type"] == "possession_change":
            current_team = event["team"]

        last_timestamp = timestamp

    possession_time[current_team] += match_end - last_timestamp

    total_time = sum(possession_time.values())
    if total_time == 0:
        return {home: 50.0, away: 50.0}

    return {
        team: round(possession_time[team] / total_time * 100, 1)
        for team in teams
    }


def calculate_possession_metrics(match, until=None):
    home = match["home_team"]
    away = match["away_team"]
    events = sorted(events_until(match, until), key=lambda event: event["timestamp"])
    metrics = {
        home: {"possessions": 0, "total_duration": 0.0, "total_passes": 0},
        away: {"possessions": 0, "total_duration": 0.0, "total_passes": 0},
    }

    if not events:
        for team in [home, away]:
            metrics[team]["average_duration"] = 0
            metrics[team]["passes_per_possession"] = 0
        return metrics

    possessions = {}
    for event in events:
        possession_id = event.get("possession_id")
        possession_team = event.get("possession_team", event["team"])

        if possession_id is None:
            continue

        possession = possessions.setdefault(
            possession_id,
            {
                "team": possession_team,
                "start": event["timestamp"],
                "end": event["timestamp"],
                "passes": 0,
            },
        )
        possession["end"] = event["timestamp"]

        if event["type"] == "pass":
            possession["passes"] += 1

    for possession in possessions.values():
        team = possession["team"]
        metrics[team]["possessions"] += 1
        metrics[team]["total_duration"] += (
            possession["end"] - possession["start"]
        )
        metrics[team]["total_passes"] += possession["passes"]

    for team in [home, away]:
        count = metrics[team]["possessions"]
        metrics[team]["average_duration"] = round(
            metrics[team]["total_duration"] / count,
            1,
        ) if count else 0
        metrics[team]["passes_per_possession"] = round(
            metrics[team]["total_passes"] / count,
            1,
        ) if count else 0

    return metrics


def calculate_player_stats(match, until=None):
    home = match["home_team"]
    away = match["away_team"]
    players = {home: {}, away: {}}

    def get_player_stats(team, player, role, shirt_number=None):
        return players[team].setdefault(
            player,
            {
                "player": player,
                "team": team,
                "role": role,
                "shirt_number": shirt_number,
                "passes": 0,
                "passes_success": 0,
                "pass_distance_m": 0,
                "pass_difficulty_total": 0.0,
                "shots": 0,
                "shots_on_target": 0,
                "goals": 0,
                "xg": 0.0,
                "max_shot_speed_kmh": 0,
                "pressure_events": 0,
                "tackles": 0,
                "successful_tackles": 0,
                "fouls": 0,
                "yellow_cards": 0,
                "red_cards": 0,
                "corners": 0,
                "saves": 0,
                "possession_wins": 0,
                "pass_accuracy": 0.0,
                "average_pass_distance_m": 0.0,
                "average_pass_difficulty": 0.0,
                "tracking_available": False,
                "distance_covered_km": None,
                "max_speed_kmh": None,
            },
        )

    for team in [home, away]:
        roster = (
            match.get("lineups", {}).get(team, [])
            + match.get("substitutes", {}).get(team, [])
        )
        for lineup_player in roster:
            get_player_stats(
                team,
                lineup_player["player"],
                lineup_player.get("role", "unknown"),
                lineup_player.get("shirt_number"),
            )

    for event in events_until(match, until):
        team = event["team"]
        player = event.get("player")
        if team not in players or not player:
            continue

        stats = get_player_stats(
            team,
            player,
            event.get("player_role", "unknown"),
        )
        event_type = event["type"]

        if event_type == "pass":
            stats["passes"] += 1
            stats["passes_success"] += int(event.get("success", False))
            stats["pass_distance_m"] += event.get("distance", 0)
            stats["pass_difficulty_total"] += event.get("difficulty", 0)
        elif event_type == "shot":
            stats["shots"] += 1
            stats["shots_on_target"] += int(event.get("on_target", False))
            stats["xg"] = round(stats["xg"] + calculate_shot_xg(event, home), 2)
            stats["max_shot_speed_kmh"] = max(
                stats["max_shot_speed_kmh"],
                event.get("speed_kmh", 0),
            )
        elif event_type == "penalty":
            stats["xg"] = round(stats["xg"] + calculate_shot_xg(event, home), 2)
        elif event_type == "goal":
            stats["goals"] += 1
            stats["shots"] += 1
            stats["shots_on_target"] += 1
        elif event_type == "pressure":
            stats["pressure_events"] += 1
        elif event_type == "tackle":
            stats["tackles"] += 1
            stats["successful_tackles"] += int(event.get("success", False))
        elif event_type == "foul":
            stats["fouls"] += 1
        elif event_type == "yellow_card":
            stats["yellow_cards"] += 1
        elif event_type == "red_card":
            stats["red_cards"] += 1
        elif event_type == "corner":
            stats["corners"] += 1
        elif event_type == "save":
            stats["saves"] += 1
        elif event_type == "possession_change":
            stats["possession_wins"] += 1

    for team_players in players.values():
        for stats in team_players.values():
            if stats["passes"]:
                stats["pass_accuracy"] = round(
                    stats["passes_success"] / stats["passes"] * 100,
                    1,
                )
                stats["average_pass_distance_m"] = round(
                    stats["pass_distance_m"] / stats["passes"],
                    1,
                )
                stats["average_pass_difficulty"] = round(
                    stats["pass_difficulty_total"] / stats["passes"],
                    2,
                )

            del stats["pass_difficulty_total"]

    return players


def calculate_stats(match, until=None):
    home = match["home_team"]
    away = match["away_team"]
    events = events_until(match, until)

    stats = {
        home: {"passes": 0, "passes_success": 0, "shots": 0,
               "shots_on_target": 0, "goals": 0, "xg": 0.0, "corners": 0,
               "fouls": 0, "yellow_cards": 0, "red_cards": 0,
               "pressure": 0, "substitutions": 0,
               "possession_changes": 0},
        away: {"passes": 0, "passes_success": 0, "shots": 0,
               "shots_on_target": 0, "goals": 0, "xg": 0.0, "corners": 0,
               "fouls": 0, "yellow_cards": 0, "red_cards": 0,
               "pressure": 0, "substitutions": 0,
               "possession_changes": 0}
    }

    for event in events:
        team = event["team"]
        t = event["type"]

        if t == "pass":
            stats[team]["passes"] += 1
            if event.get("success"):
                stats[team]["passes_success"] += 1
        elif t == "shot":
            stats[team]["shots"] += 1
            stats[team]["xg"] = round(stats[team]["xg"] + calculate_shot_xg(event, home), 2)
            if event.get("on_target"):
                stats[team]["shots_on_target"] += 1
        elif t == "penalty":
            stats[team]["xg"] = round(stats[team]["xg"] + calculate_shot_xg(event, home), 2)
        elif t == "goal":
            stats[team]["goals"] += 1
            stats[team]["shots"] += 1
            stats[team]["shots_on_target"] += 1
        elif t == "corner":
            stats[team]["corners"] += 1
        elif t == "foul":
            stats[team]["fouls"] += 1
        elif t == "yellow_card":
            stats[team]["yellow_cards"] += 1
        elif t == "red_card":
            stats[team]["red_cards"] += 1
        elif t == "pressure":
            stats[team]["pressure"] += 1
        elif t == "substitution":
            stats[team]["substitutions"] += 1
        elif t == "possession_change":
            stats[team]["possession_changes"] += 1

    for team in [home, away]:
        p = stats[team]["passes"]
        ps = stats[team]["passes_success"]
        stats[team]["pass_accuracy"] = round((ps / p * 100), 1) if p > 0 else 0

    possession = calculate_possession(match, until)
    possession_metrics = calculate_possession_metrics(match, until)

    for team in [home, away]:
        stats[team]["possession"] = possession[team]
        stats[team]["possessions"] = possession_metrics[team]["possessions"]
        stats[team]["average_possession_duration"] = (
            possession_metrics[team]["average_duration"]
        )
        stats[team]["passes_per_possession"] = (
            possession_metrics[team]["passes_per_possession"]
        )

    return stats