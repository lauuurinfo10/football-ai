import random
import json

try:
    from data.validation import validate_match
except ModuleNotFoundError:
    from validation import validate_match

TEAMS = {
    "Arsenal": [
        "Raya", "Saliba", "Mosquera", "Gabriel", "Timber",
        "Hincapie", "Odegaard", "Rice", "Guimaraes", "Saka", "Gyokeres"
    ],
    "Liverpool": [
        "Alisson", "Frimpong", "Van Dijk", "Araujo", "Kerkez",
        "Wirtz", "Szoboszlai", "Mac Allister", "Gravenberch", "Isak", "Barcola"
    ],
    "Manchester City": [
        "Donnarumma", "Walker", "Ruben Dias", "Gueh", "Gvardiol",
        "Foden", "Enzo Fernandez", "Kovacic", "Cherki", "Haaland", "Doku"
    ],
    "Manchester United": [
        "Lammens", "Dalot", "De Ligt", "Maguire", "Martinez",
        "Fernandes", "Mainoo", "Ugarte", "Rashford", "Cunha", "Mbeumo"
    ],
    "Chelsea": [
        "E. Martinez", "James", "Colwill", "Fofana", "Hato",
        "Caicedo", "Palmer", "Lavia", "Neto", "Joao Pedro", "Estevao"
    ],
    "Tottenham": [
        "Kinsky", "Porro", "Romero", "Van de Ven", "Udogie",
        "Maddison", "Kulusevski", "Simons", "Bentancur", "Solanke", "Tel"
    ]
}

SUBSTITUTES = {
    "Arsenal": ["Nwaneri", "Jorginho", "Tomiyasu", "Martinelli", "Jesus", "Partey", "Zinchenko"],
    "Liverpool": ["Kelleher", "Konate", "Tsimikas", "Elliott", "Jones", "Diaz", "Nunez"],
    "Manchester City": ["Ortega", "Ake", "Stones", "Nunes", "Grealish", "Alvarez", "Bernardo"],
    "Manchester United": ["Onana", "Yoro", "Shaw", "Eriksen", "Mount", "Antony", "Hojlund"],
    "Chelsea": ["Sanchez", "Cucurella", "Badiashile", "Chukwuemeka", "Madueke", "Jackson", "Nkunku"],
    "Tottenham": ["Vicario", "Dragusin", "Spence", "Sarr", "Johnson", "Werner", "Richarlison"],
}

SUBSTITUTE_ROLES = {
    "Arsenal": {
        "Nwaneri": "midfielder", "Jorginho": "midfielder",
        "Tomiyasu": "defender", "Martinelli": "forward",
        "Jesus": "forward", "Partey": "midfielder", "Zinchenko": "defender",
    },
    "Liverpool": {
        "Kelleher": "goalkeeper", "Konate": "defender",
        "Tsimikas": "defender", "Elliott": "midfielder",
        "Jones": "midfielder", "Diaz": "forward", "Nunez": "forward",
    },
    "Manchester City": {
        "Ortega": "goalkeeper", "Ake": "defender", "Stones": "defender",
        "Nunes": "midfielder", "Grealish": "midfielder",
        "Alvarez": "forward", "Bernardo": "midfielder",
    },
    "Manchester United": {
        "Onana": "goalkeeper", "Yoro": "defender", "Shaw": "defender",
        "Eriksen": "midfielder", "Mount": "midfielder",
        "Antony": "forward", "Hojlund": "forward",
    },
    "Chelsea": {
        "Sanchez": "goalkeeper", "Cucurella": "defender",
        "Badiashile": "defender", "Chukwuemeka": "midfielder",
        "Madueke": "forward", "Jackson": "forward", "Nkunku": "midfielder",
    },
    "Tottenham": {
        "Vicario": "goalkeeper", "Dragusin": "defender", "Spence": "defender",
        "Sarr": "midfielder", "Johnson": "forward",
        "Werner": "forward", "Richarlison": "forward",
    },
}


PLAYER_ROLES = {}

for team_players in TEAMS.values():
    PLAYER_ROLES[team_players[0]] = "goalkeeper"

    for player in team_players[1:5]:
        PLAYER_ROLES[player] = "defender"

    for player in team_players[5:9]:
        PLAYER_ROLES[player] = "midfielder"

    for player in team_players[9:]:
        PLAYER_ROLES[player] = "forward"

for team, substitutes in SUBSTITUTES.items():
    for player in substitutes:
        PLAYER_ROLES[player] = SUBSTITUTE_ROLES[team][player]


def shirt_number(player, team):
    """Returnează un număr stabil pentru titulari și rezerve."""
    roster = TEAMS[team] + SUBSTITUTES[team]
    return roster.index(player) + 1


def get_players_by_roles(players, roles):
    """
    Returnează jucătorii care au unul dintre rolurile solicitate.
    """
    return [
        player
        for player in players
        if PLAYER_ROLES[player] in roles
    ]


def annotate_possessions(events):
    """
    Eticheteaza evenimentele cu secventa de posesie din care fac parte.

    Un eveniment possession_change incepe o noua posesie pentru echipa
    mentionata in acel eveniment.
    """
    if not events:
        return

    current_team = events[0]["team"]
    possession_number = 1

    for event in events:
        if event["type"] == "possession_change":
            current_team = event["team"]
            possession_number += 1

        event["possession_id"] = f"pos_{possession_number}"
        event["possession_team"] = current_team


def annotate_turnovers(events):
    """
    Adauga echipa care a pierdut posesia si contextul recuperarii.

    Contextul este atribuit pe baza evenimentelor apropiate temporal. Nu
    pretinde o cauzalitate absoluta, dar face tranzitia explicabila.
    """
    if not events:
        return

    current_team = events[0]["team"]

    for index, event in enumerate(events):
        if event["type"] != "possession_change":
            continue

        previous_team = current_team
        new_team = event["team"]
        event["possession_lost_by"] = previous_team
        event["possession_won_by"] = new_team

        nearby_events = [
            candidate
            for candidate in events[max(0, index - 20):index]
            if candidate["timestamp"] <= event["timestamp"]
            and event["timestamp"] - candidate["timestamp"] <= 1.5
        ]

        reason = "unforced_error"
        cause_event = None

        for candidate in reversed(nearby_events):
            if (
                candidate["type"] == "pressure"
                and candidate.get("pressing_team") == new_team
                and candidate.get("team_under_pressure") == previous_team
            ):
                reason = "pressure"
                cause_event = candidate
                break

            if candidate["type"] == "pass" and (
                candidate["team"] == previous_team
                and not candidate.get("success", True)
            ):
                reason = "failed_pass"
                cause_event = candidate
                break

            if candidate["type"] == "tackle" and (
                candidate["team"] == new_team
                and candidate.get("success")
            ):
                reason = "tackle"
                cause_event = candidate
                break

            if candidate["type"] == "foul" and (
                candidate["team"] == previous_team
            ):
                reason = "foul"
                cause_event = candidate
                break

        event["turnover_reason"] = reason
        event["turnover_cause_event_id"] = (
            cause_event.get("event_id")
            if cause_event
            else None
        )
        current_team = new_team



EVENT_TYPES = [
    "pass", "possession_change", "pressure",
    "tackle", "foul",
    "shot", "corner", "free_kick",
    "save", "goal",
    "yellow_card", "substitution",
    "penalty", "red_card"
]

EVENT_WEIGHTS = [
    38, 14, 12,   # pass, possession_change, pressure
    9, 8,          # tackle, foul
    5, 4, 4,       # shot, corner, free_kick
    3, 0.8,        # save, goal
    0.8, 0.5,      # yellow_card, substitution
    0.1, 0.05      # penalty, red_card
]



def generate_event(
    team,
    players,
    timestamp,
    event_type=None,
    opponent_players=None,
    opponent_team=None,
):
    player = random.choice(players)
    if event_type is None:
        event_type = random.choices(EVENT_TYPES,weights=EVENT_WEIGHTS,k=1)[0]

    event = {
    "event_id": f"evt_{random.getrandbits(64):016x}",
    "timestamp": round(timestamp, 1),
    "type": event_type,
    "player": player,
    "player_role":PLAYER_ROLES[player],
    "team": team,
    "position": [random.randint(0, 100), random.randint(0, 100)],
    "under_pressure": random.choice([True, False])
}

    # câmpuri specifice per tip
    if event_type == "shot":
        event["body_part"] = random.choice(["right_foot", "left_foot", "head"])
        event["on_target"] = random.choice([True, False])
        event["outcome"] = random.choice(["saved", "missed", "blocked", "post"])
        event["speed_kmh"] = random.randint(60, 130)

    elif event_type == "pass":
        event["success"] = random.random() < 0.78  # 78% rata de reusita
        event["distance"] = random.randint(5, 60)

        event["pass_type"] = random.choice(["short", "long", "through_ball", "cross"])
        difficulty_by_type = {
            "short": 0.25,
            "long": 0.55,
            "through_ball": 0.8,
            "cross": 0.7,
        }
        event["difficulty"] = round(
            min(
                1.0,
                difficulty_by_type[event["pass_type"]]
                + event["distance"] / 200
                + (0.15 if event["under_pressure"] else 0),
            ),
            2,
        )

    elif event_type == "foul":
        fouled_players=opponent_players or players

        event["fouled_player"] = random.choice(fouled_players)
        event["fouled_player_role"] = PLAYER_ROLES[event["fouled_player"]]

        event["is_attacking_foul"] = random.choice([True, False])

    elif event_type == "substitution":
        event["player_in"] = random.choice(players)
        event["minute"] = int(timestamp)

    elif event_type == "penalty":
        event["outcome"] = random.choice(["goal", "saved", "missed"])
        event["player"] = player    

    elif event_type in ["goal", "save"]:
        event["body_part"] = random.choice(["right_foot", "left_foot", "head"])
        event["distance"] = random.randint(5, 30)

    elif event_type == "tackle":
        event["success"] = random.choice([True, False])

    elif event_type == "corner":
        event["side"] = random.choice(["left", "right"])

    elif event_type == "free_kick":
        event["distance_to_goal"] = random.randint(15, 35)

    elif event_type == "yellow_card":
        event["reason"] = random.choice(["foul", "dissent", "simulation"])

    elif event_type == "red_card":
        event["reason"] = random.choice(["second_yellow", "serious_foul", "violent_conduct"])

    elif event_type == "pressure":
        event["intensity"] = random.choice(["low", "medium", "high"])
        event["pressing_team"] = team
        event["team_under_pressure"] = opponent_team

    return event



def generate_match(home_team, away_team):
    home_players = TEAMS[home_team]
    away_players = TEAMS[away_team]
    home_substitutes = SUBSTITUTES[home_team]
    away_substitutes = SUBSTITUTES[away_team]

    teams = [home_team, away_team]
    players_by_team = {
        home_team: list(home_players),
        away_team: list(away_players),
    }
    substitutes_by_team = {
        home_team: list(home_substitutes),
        away_team: list(away_substitutes),
    }

    opponent_players_by_team = {
        home_team: away_players,
        away_team: home_players
    }

    events = []

    # Avantajul terenului propriu este mic, nu dominant.
    home_share = random.uniform(0.46, 0.54)

    # Numărul de goluri este generat separat de restul evenimentelor.
    goals_total = random.choices(
        [0, 1, 2, 3, 4, 5],
        weights=[18, 40, 25, 12, 4, 1],
        k=1
    )[0]

    event_counts = {
        # Într-un meci realist, pasele sunt de ordinul sutelor.
        "pass": random.randint(850, 1050),

        # Evenimente mai rare și mai importante.
        "possession_change": random.randint(25, 50),
        "pressure": random.randint(100, 180),
        "tackle": random.randint(25, 50),
        "foul": random.randint(18, 32),

        # Statistici tipice pentru un meci de nivel înalt.
        "shot": random.randint(18, 32),
        "corner": random.randint(6, 14),
        "free_kick": 0,
        "save": 0,

        # Evenimente disciplinare și administrative.
        "goal": 0,
        "yellow_card": random.randint(2, 7),
        "substitution": random.randint(6, 10),
        "penalty": random.choices([0, 1], weights=[92, 8], k=1)[0],
        "red_card": random.choices([0, 1], weights=[98, 2], k=1)[0]
    }

    substitutions_by_team = {
        home_team: 0,
        away_team: 0
    }
    last_substitution_timestamp = {
        home_team: 0,
        away_team: 0,
    }

    def choose_team(event_type):
        """
        Alege echipa pentru un eveniment.

        Evenimentele ofensive beneficiază ușor de avantajul terenului propriu.
        Pentru restul evenimentelor, diferența este foarte mică.
        """
        if event_type in {"shot", "goal", "corner", "penalty"}:
            current_home_share = min(home_share + 0.04, 0.60)
        else:
            current_home_share = home_share

        return random.choices(
            teams,
            weights=[current_home_share, 1 - current_home_share],
            k=1
        )[0]

    def generate_timestamp():
        """
        Generează un minut din prima sau a doua repriză.

        Pauza dintre minutele 45 și 46 nu este modelată ca eveniment.
        """
        if random.random() < 0.5:
            return round(random.uniform(0, 45), 1)

        return round(random.uniform(46, 90), 1)

    for event_type, count in event_counts.items():
        for _ in range(count):
            team = choose_team(event_type)

            # Alegem jucatori compatibili cu tipul evenimentului.
            all_team_players = players_by_team[team]
            opponent_players = opponent_players_by_team[team]

            if event_type == "save":
                event_players = get_players_by_roles(
                    all_team_players,
                    {"goalkeeper"}
                )
            elif event_type in {"shot", "goal", "penalty"}:
                event_players = get_players_by_roles(
                    all_team_players,
                    {"midfielder", "forward"}
                )
            elif event_type in {"tackle", "foul", "yellow_card", "red_card"}:
                event_players = get_players_by_roles(
                    all_team_players,
                    {"defender", "midfielder"}
                )
            elif event_type in {"pressure", "possession_change"}:
                event_players = get_players_by_roles(
                    all_team_players,
                    {"defender", "midfielder", "forward"}
                )
            else:
                event_players = get_players_by_roles(
                    all_team_players,
                    {"defender", "midfielder", "forward"}
                )

            # Nu permitem mai mult de cinci schimbări pentru o echipă.
            if event_type == "substitution":
                if substitutions_by_team[team] >= 5:
                    other_team = away_team if team == home_team else home_team

                    if substitutions_by_team[other_team] >= 5:
                        continue

                    team = other_team
                    all_team_players = players_by_team[team]
                    opponent_players = opponent_players_by_team[team]
                    event_players = get_players_by_roles(
                        all_team_players,
                        {"defender", "midfielder", "forward"}
                    )

                substitutions_by_team[team] += 1
                if not substitutes_by_team[team] or len(all_team_players) <= 1:
                    continue
                event_players = list(all_team_players)
                outgoing_player = random.choice(event_players)
                outgoing_role = PLAYER_ROLES[outgoing_player]
                compatible_substitutes = [
                    player
                    for player in substitutes_by_team[team]
                    if PLAYER_ROLES[player] == outgoing_role
                ]
                if not compatible_substitutes:
                    substitutions_by_team[team] -= 1
                    continue
                event_players = [outgoing_player]
                substitute_player = random.choice(compatible_substitutes)
                substitutes_by_team[team].remove(substitute_player)

            event_timestamp = generate_timestamp()
            if event_type == "substitution":
                event_timestamp = max(
                    event_timestamp,
                    last_substitution_timestamp[team] + 1,
                )
                event_timestamp = min(event_timestamp, 90)
                last_substitution_timestamp[team] = event_timestamp

            event = generate_event(
                team=team,
                players=event_players,
                timestamp=event_timestamp,
                event_type=event_type,
                opponent_players=opponent_players,
                opponent_team=(
                    away_team
                    if team == home_team
                    else home_team
                ),
            )
            if event_type == "substitution":
                event["player_in"] = substitute_player
                event["player_out"] = event["player"]
                event["minute"] = int(event["timestamp"])
                players_by_team[team].remove(event["player"])
                players_by_team[team].append(substitute_player)

            events.append(event)
                # Un fault produce de regulă o fază de lovitură liberă.
    foul_events = [
        event for event in events
        if event["type"] == "foul"
    ]

    for foul_event in foul_events:
        # Nu fiecare fault produce o fază explicită de lovitură liberă.
        if random.random() > 0.85:
            continue

        attacking_team = (
            away_team
            if foul_event["team"] == home_team
            else home_team
        )

        free_kick_event = generate_event(
            team=attacking_team,
            players=players_by_team[attacking_team],
            timestamp=foul_event["timestamp"] + 0.1,
            event_type="free_kick"
        )

        free_kick_event["related_event_id"] = foul_event["event_id"]
        events.append(free_kick_event)

    # Un gol și o paradă trebuie să provină din șuturi.
    shot_events = [
        event for event in events
        if event["type"] == "shot"
    ]

    random.shuffle(shot_events)

    remaining_goals = goals_total

    for shot_event in shot_events:
        if remaining_goals == 0:
            break

        # Doar o parte dintre șuturile pe poartă devin goluri.
        if random.random() > 0.18:
            continue

        shot_event["on_target"] = True
        shot_event["outcome"] = "goal"

        goal_event = {
            "event_id": f"evt_{random.getrandbits(64):016x}",
            "timestamp": shot_event["timestamp"],
            "type": "goal",
            "player": shot_event["player"],
            "team": shot_event["team"],
            "position": shot_event["position"],
            "related_event_id": shot_event["event_id"]
        }

        events.append(goal_event)
        remaining_goals -= 1

    # Șuturile pe poartă care nu devin goluri pot produce parade.
    on_target_shots = [
        event for event in shot_events
        if event["on_target"]
        and event["outcome"] != "goal"
    ]

    for shot_event in on_target_shots:
        if random.random() > 0.65:
            continue

        save_event = {
            "event_id": f"evt_{random.getrandbits(64):016x}",
            "timestamp": shot_event["timestamp"] + 0.1,
            "type": "save",
            "player": players_by_team[
                away_team if shot_event["team"] == home_team else home_team
            ][0],
            "player_role": "goalkeeper",
            "team": (
                away_team
                if shot_event["team"] == home_team
                else home_team
            ),
            "position": shot_event["position"],
            "related_event_id": shot_event["event_id"]
        }

        events.append(save_event)


    # Evenimentele trebuie să apară în ordinea cronologică a meciului.
    events.sort(key=lambda event: event["timestamp"])
    annotate_turnovers(events)
    annotate_possessions(events)

    for index,event in enumerate(events,start=1):
        event["sequence"]=index

    match = {
        "home_team": home_team,
        "away_team": away_team,
        "lineups": {
            home_team: [
                {
                    "player": player,
                    "role": PLAYER_ROLES[player],
                    "shirt_number": shirt_number(player, home_team),
                }
                for player in home_players
            ],
            away_team: [
                {
                    "player": player,
                    "role": PLAYER_ROLES[player],
                    "shirt_number": shirt_number(player, away_team),
                }
                for player in away_players
            ],
        },
        "substitutes": {
            home_team: [
                {
                    "player": player,
                    "role": PLAYER_ROLES[player],
                    "shirt_number": shirt_number(player, home_team),
                }
                for player in home_substitutes
            ],
            away_team: [
                {
                    "player": player,
                    "role": PLAYER_ROLES[player],
                    "shirt_number": shirt_number(player, away_team),
                }
                for player in away_substitutes
            ],
        },
        "events": events
    }
    validate_match(match)
    return match





if __name__ == "__main__":
    match = generate_match("Arsenal", "Liverpool")
    print(f"Total evenimente: {len(match['events'])}")
    
    with open("data/match.json", "w") as f:
        json.dump(match, f, indent=2)
    
    print("Meci salvat in data/match.json")
