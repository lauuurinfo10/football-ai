"""Validare pentru loturile și evenimentele meciului sintetic."""


def validate_match(match):
    """Ridică ValueError când datele sintetice nu respectă regulile de bază."""
    home = match["home_team"]
    away = match["away_team"]
    teams = [home, away]
    errors = []

    for team in teams:
        lineup = match.get("lineups", {}).get(team, [])
        substitutes = match.get("substitutes", {}).get(team, [])
        if len(lineup) != 11:
            errors.append(f"{team} trebuie să aibă 11 titulari, are {len(lineup)}")
        if len({player["player"] for player in lineup}) != len(lineup):
            errors.append(f"{team} are titulari duplicați")
        roster = lineup + substitutes
        shirt_numbers = [
            player.get("shirt_number")
            for player in roster
            if player.get("shirt_number") is not None
        ]
        if len(shirt_numbers) != len(set(shirt_numbers)):
            errors.append(f"{team} are numere de tricou duplicate")
        if set(player["player"] for player in lineup) & set(
            player["player"] for player in substitutes
        ):
            errors.append(f"{team} are un jucător simultan titular și rezervă")

    active = {
        team: {
            player["player"]: player
            for player in match["lineups"][team]
        }
        for team in teams
    }
    bench = {
        team: {
            player["player"]: player
            for player in match.get("substitutes", {}).get(team, [])
        }
        for team in teams
    }
    events = sorted(
        match.get("events", []),
        key=lambda event: (event.get("timestamp", 0), event.get("sequence", 0)),
    )

    previous_timestamp = -1
    for event in events:
        timestamp = event.get("timestamp", 0)
        if timestamp < previous_timestamp:
            errors.append("evenimentele nu sunt cronologice")
        previous_timestamp = timestamp

        if event.get("team") not in teams:
            errors.append(f"eveniment cu echipă necunoscută: {event.get('team')}")
            continue

        if event["type"] != "substitution":
            continue

        team = event["team"]
        player_out = event.get("player_out", event.get("player"))
        player_in = event.get("player_in")
        if player_out not in active[team]:
            errors.append(f"{team}: jucătorul ieșit nu era activ: {player_out}")
            continue
        if player_in not in bench[team]:
            errors.append(f"{team}: jucătorul intrat nu era rezervă: {player_in}")
            continue
        if active[team][player_out].get("role") != bench[team][player_in].get("role"):
            errors.append(
                f"{team}: rol incompatibil {player_out} -> {player_in}"
            )

        active[team][player_in] = bench[team].pop(player_in)
        del active[team][player_out]

    for team in teams:
        if len(active[team]) != 11:
            errors.append(f"{team} nu mai are 11 jucători activi la final")

    if errors:
        raise ValueError("Validare meci eșuată: " + "; ".join(errors))

    return True
