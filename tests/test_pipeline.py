import json
import unittest
from pathlib import Path

from data.validation import validate_match
from pipeline.interpret import (
    active_lineups_at,
    calculate_match_state,
    calculate_player_stats,
    calculate_stats,
)
from pipeline.insights import build_insights
from pipeline.render import build_render_payload
from pipeline.explain import local_match_recap


ROOT = Path(__file__).resolve().parents[1]


class MatchPipelineTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        with (ROOT / "data" / "match.json").open(encoding="utf-8") as file:
            cls.match = json.load(file)

    def test_match_is_valid(self):
        self.assertTrue(validate_match(self.match))

    def test_lineups_remain_eleven_before_and_after_substitutions(self):
        timestamps = [
            event["timestamp"]
            for event in self.match["events"]
            if event["type"] == "substitution"
        ]
        for timestamp in [0, *timestamps, 90]:
            lineups = active_lineups_at(self.match, timestamp)
            self.assertEqual(
                {team: len(players) for team, players in lineups.items()},
                {
                    self.match["home_team"]: 11,
                    self.match["away_team"]: 11,
                },
            )

    def test_temporal_score_never_includes_future_goals(self):
        final = calculate_stats(self.match)
        for event in self.match["events"]:
            if event["type"] == "goal":
                before = calculate_stats(self.match, max(0, event["timestamp"] - 0.01))
                self.assertLessEqual(
                    before[event["team"]]["goals"],
                    final[event["team"]]["goals"],
                )

    def test_match_state_has_expected_shape(self):
        state = calculate_match_state(self.match, 45)
        self.assertIn(state["state"], {"control", "pressure", "chaos", "clutch"})
        self.assertIn(state["dominant_team"], {
            self.match["home_team"],
            self.match["away_team"],
        })

    def test_rendered_insights_follow_the_synthetic_match_clock(self):
        """Event-backed insights must never drift from their source event."""
        stats = calculate_stats(self.match)
        payload = build_render_payload(
            self.match,
            stats,
            build_insights(self.match, stats),
            calculate_player_stats(self.match),
        )
        timed_insights = [
            insight for insight in payload["insights"]
            if insight["timestamp"] is not None
        ]
        self.assertEqual(
            [insight["timestamp"] for insight in timed_insights],
            sorted(insight["timestamp"] for insight in timed_insights),
        )

        event_times = {
            event["event_id"]: event["timestamp"]
            for event in self.match["events"]
        }
        for insight in timed_insights:
            if insight["id"] in event_times:
                self.assertEqual(insight["timestamp"], event_times[insight["id"]])

    def test_local_recap_is_available_without_model_credentials(self):
        stats = calculate_stats(self.match)
        recap = local_match_recap(
            stats,
            self.match["home_team"],
            self.match["away_team"],
            language="ro",
        )
        self.assertIn(self.match["home_team"], recap)
        self.assertIn(self.match["away_team"], recap)
        self.assertGreater(len(recap), 80)


if __name__ == "__main__":
    unittest.main()
