import React, { useEffect, useMemo, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import "./styles.css";

const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

const TEAM_COLORS = {
  Arsenal: { primary: "#e67e22", text: "#24170d" },
  Liverpool: { primary: "#c0392b", text: "#ffffff" },
  Chelsea: { primary: "#2455a4", text: "#ffffff" },
  "Manchester City": { primary: "#59b8d8", text: "#102a43" },
  "Manchester United": { primary: "#8e44ad", text: "#ffffff" },
  Tottenham: { primary: "#f1c40f", text: "#2d2604" },
};

const translations = {
  ro: {
    studio: "Studio de inteligență a meciului",
    eyebrow: "MOTOR SINTETIC DE INSIGHT-URI FOTBALISTICE",
    liveIntelligence: "INTELIGENȚĂ LIVE",
    fanSubtitle: "Meciul tău, povestea ta.",
    analystSubtitle: "Vizualizare tactică bazată pe dovezi.",
    fan: "Fan",
    analyst: "Analist",
    director: "Overlay live",
    restart: "Repornește meciul",
    start: "Pornește meciul",
    language: "Limbă",
    favoriteTeam: "Echipa favorită",
    favoritePlayer: "Jucător favorit",
    teamOverview: "Statistici echipă",
    playerAnalysis: "Analiză jucător",
    possession: "Posesie",
    passes: "Pase",
    passAccuracy: "Acuratețe pase",
    shots: "Șuturi",
    pressure: "Presiune",
    insights: "Insight-uri live",
    insightCount: "momente",
    whyMatters: "De ce contează?",
    matchContext: "Contextul meciului",
    timelinePosition: "Poziție în cronologie",
    overlayDuration: "Durată overlay",
    liveSnapshot: "Snapshot live",
    fullTime: "Meci încheiat",
    fullTimeDescription: "Toate evenimentele și statisticile finale sunt disponibile.",
    selectInsight: "Selectează un insight pentru a vedea dovezile.",
    loading: "Se încarcă meciul...",
    error: "Nu am putut încărca datele meciului.",
    role: "Rol",
    goals: "Goluri",
    shotsOnTarget: "Șuturi pe poartă",
    passDifficulty: "Dificultate pasă",
    shotSpeed: "Viteză șut",
    live: "LIVE",
    match: "MECI",
    summary: "SUMAR",
    pressureWindow: "Fereastră de presiune",
    recovery: "Recuperare posesie",
    evidence: "Dovezi",
    playerFocus: "FOCUS JUCĂTOR",
    analystDetail: "DETALIU ANALIST",
    iconCredits: "Iconițe și atribuire",
    matchDna: "ADN-ul meciului",
    matchState: "Starea meciului",
    directorTitle: "Regie overlay",
    directorSubtitle: "Selectează un moment, apoi adaugă-l în coada care ar apărea în transmisiune.",
    generateRecap: "Generează recap AI",
    recapLoading: "Se generează recap-ul...",
    recapUnavailable: "Recap-ul AI nu este disponibil momentan.",
    control: "Control",
    pressureState: "Presiune",
    chaos: "Haos",
    clutch: "Clutch",
    matchFinished: "Meci încheiat",
    today: "Astăzi",
    fanStory: "Povestea ta live",
    forYou: "PENTRU TINE",
    syntheticFeed: "Flux sintetic live",
    incomingEvent: "eveniment primit",
    pipeline: "Eveniment → context → explicație → overlay",
    overlayQueue: "Coada de overlay-uri",
    ready: "Pregătit",
    queued: "În coadă",
    onAir: "PE ECRAN",
    addOverlay: "Adaugă overlay",
    removeOverlay: "Elimină",
    recapTitle: "Recapitulare AI",
    recapHint: "O poveste a meciului, adaptată modului tău de vizionare.",
    keyEvidence: "Dovezi cheie",
    tacticalConsole: "Consolă tactică",
    matchView: "Meci",
    statsView: "Statistici",
    liveEvents: "Evenimente live",
    noEvents: "Apasă Pornește meciul pentru a vedea evenimentele.",
    currentMoment: "Moment curent",
  },
  it: {
    studio: "Studio di intelligenza della partita",
    eyebrow: "MOTORE SINTETICO DI INSIGHT CALCISTICI",
    liveIntelligence: "INTELLIGENZA LIVE",
    fanSubtitle: "La tua partita, la tua storia.",
    analystSubtitle: "Vista tattica basata sulle prove.",
    fan: "Fan",
    analyst: "Analista",
    director: "Overlay live",
    restart: "Riavvia partita",
    start: "Avvia partita",
    language: "Lingua",
    favoriteTeam: "Squadra preferita",
    favoritePlayer: "Giocatore preferito",
    teamOverview: "Statistiche squadra",
    playerAnalysis: "Analisi giocatore",
    possession: "Possesso",
    passes: "Passaggi",
    passAccuracy: "Precisione passaggi",
    shots: "Tiri",
    pressure: "Pressione",
    insights: "Insight live",
    insightCount: "momenti",
    whyMatters: "Perché conta?",
    matchContext: "Contesto della partita",
    timelinePosition: "Posizione nella cronologia",
    overlayDuration: "Durata overlay",
    liveSnapshot: "Snapshot live",
    fullTime: "Partita terminata",
    fullTimeDescription: "Tutti gli eventi e le statistiche finali sono disponibili.",
    selectInsight: "Seleziona un insight per vedere le prove.",
    loading: "Caricamento partita...",
    error: "Impossibile caricare i dati della partita.",
    role: "Ruolo",
    goals: "Gol",
    shotsOnTarget: "Tiri in porta",
    passDifficulty: "Difficoltà passaggio",
    shotSpeed: "Velocità tiro",
    live: "LIVE",
    match: "PARTITA",
    summary: "RIEPILOGO",
    pressureWindow: "Finestra di pressione",
    recovery: "Recupero possesso",
    evidence: "Prove",
    playerFocus: "FOCUS GIOCATORE",
    analystDetail: "DETTAGLIO ANALISTA",
    iconCredits: "Icone e attribuzione",
    matchDna: "DNA della partita",
    matchState: "Stato della partita",
    directorTitle: "Regia overlay",
    directorSubtitle: "Seleziona un momento e aggiungilo alla coda per la trasmissione.",
    generateRecap: "Genera recap AI",
    recapLoading: "Generazione recap...",
    recapUnavailable: "Il recap AI non è disponibile al momento.",
    control: "Controllo",
    pressureState: "Pressione",
    chaos: "Caos",
    clutch: "Clutch",
    matchFinished: "Partita terminata",
    today: "Oggi",
    fanStory: "La tua storia live",
    forYou: "PER TE",
    syntheticFeed: "Flusso sintetico live",
    incomingEvent: "evento ricevuto",
    pipeline: "Evento → contesto → spiegazione → overlay",
    overlayQueue: "Coda overlay",
    ready: "Pronto",
    queued: "In coda",
    onAir: "IN ONDA",
    addOverlay: "Aggiungi overlay",
    removeOverlay: "Rimuovi",
    recapTitle: "Recap AI",
    recapHint: "La storia della partita, adattata alla tua esperienza.",
    keyEvidence: "Prove chiave",
    tacticalConsole: "Console tattica",
    matchView: "Partita",
    statsView: "Statistiche",
    liveEvents: "Eventi live",
    noEvents: "Avvia la partita per vedere gli eventi.",
    currentMoment: "Momento attuale",
  },
  en: {
    studio: "Match Intelligence Studio",
    eyebrow: "SYNTHETIC MATCH INSIGHTS ENGINE",
    liveIntelligence: "LIVE INTELLIGENCE",
    fanSubtitle: "Your match, your story.",
    analystSubtitle: "Evidence-led tactical view.",
    fan: "Fan",
    analyst: "Analyst",
    director: "Live overlay",
    restart: "Restart match",
    start: "Start match",
    language: "Language",
    favoriteTeam: "Favorite team",
    favoritePlayer: "Favorite player",
    teamOverview: "Team overview",
    playerAnalysis: "Player analysis",
    possession: "Possession",
    passes: "Passes",
    passAccuracy: "Pass accuracy",
    shots: "Shots",
    pressure: "Pressure",
    insights: "Live insights",
    insightCount: "moments",
    whyMatters: "Why it matters",
    matchContext: "Match context",
    timelinePosition: "Timeline position",
    overlayDuration: "Overlay duration",
    liveSnapshot: "Live snapshot",
    fullTime: "Full time",
    fullTimeDescription: "All events and final statistics are now available.",
    selectInsight: "Select an insight to see the evidence.",
    loading: "Loading match...",
    error: "Could not load match data.",
    role: "Role",
    goals: "Goals",
    shotsOnTarget: "Shots on target",
    passDifficulty: "Pass difficulty",
    shotSpeed: "Shot speed",
    live: "LIVE",
    match: "MATCH",
    summary: "SUMMARY",
    pressureWindow: "Pressure window",
    recovery: "Possession recovery",
    evidence: "Evidence",
    playerFocus: "PLAYER FOCUS",
    analystDetail: "ANALYST DETAIL",
    iconCredits: "Icons and attribution",
    matchDna: "Match DNA",
    matchState: "Match state",
    directorTitle: "Overlay control",
    directorSubtitle: "Select a moment, then add it to the broadcast overlay queue.",
    generateRecap: "Generate AI recap",
    recapLoading: "Generating recap...",
    recapUnavailable: "The AI recap is not available right now.",
    control: "Control",
    pressureState: "Pressure",
    chaos: "Chaos",
    clutch: "Clutch",
    matchFinished: "Match finished",
    today: "Today",
    fanStory: "Your live story",
    forYou: "FOR YOU",
    syntheticFeed: "Synthetic live feed",
    incomingEvent: "event received",
    pipeline: "Event → context → explanation → overlay",
    overlayQueue: "Overlay queue",
    ready: "Ready",
    queued: "Queued",
    onAir: "ON AIR",
    addOverlay: "Add overlay",
    removeOverlay: "Remove",
    recapTitle: "AI match recap",
    recapHint: "The match story, tuned to the way you watch.",
    keyEvidence: "Key evidence",
    tacticalConsole: "Tactical console",
    matchView: "Match",
    statsView: "Statistics",
    liveEvents: "Live events",
    noEvents: "Start the match to see events.",
    currentMoment: "Current moment",
  },
};

function localizeInsight(insight, language, mode) {
  const evidence = insight.evidence || {};
  const team = insight.team || "";
  const opponent = evidence.opponent || evidence.team_under_pressure || "";
  const counts = evidence.follow_up_counts || {};
  const attacking = evidence.attacking_counts || {};
  const player = evidence.player || evidence.fouled_by || evidence.player_out || "";
  const start = evidence.start;
  const end = evidence.end;
  const minute = insight.match_time || "";
  const analyst = mode === "analyst";

  if (language === "ro") {
    if (insight.type === "shot_on_target") {
      return {
        title: analyst ? `${player} a testat poarta` : `Șut pe poartă pentru ${team}`,
        description: analyst
          ? `${player} a trimis mingea pe poartă. Viteză: ${evidence.speed_kmh || "—"} km/h; rezultat: ${evidence.outcome || "—"}.`
          : `${player} a avut un șut pe poartă pentru ${team}.`,
      };
    }
    if (insight.type === "foul_event") {
      return {
        title: analyst ? `${player} a comis un fault` : `Fault comis de ${player}`,
        description: analyst
          ? `${player} (${team}) l-a faultat pe ${evidence.fouled_player || "un adversar"}.`
          : `${player} a faultat pe ${evidence.fouled_player || "un adversar"}.`,
      };
    }
    if (insight.type === "penalty_event") {
      return {
        title: analyst ? `Penalty: ${player}` : `Penalty pentru ${team}`,
        description: `${player} a executat penalty-ul. Rezultat: ${evidence.outcome || "—"}.`,
      };
    }
    if (insight.type === "card_event") {
      const card = evidence.card === "red_card" ? "cartonaș roșu" : "cartonaș galben";
      return {
        title: analyst ? `${card} · ${player}` : `${player} a primit ${card}`,
        description: `Motivul în date: ${evidence.reason || "neprecizat"}.`,
      };
    }
    if (insight.type === "substitution_event") {
      return {
        title: analyst ? `Schimbare tactică pentru ${team}` : `Schimbare pentru ${team}`,
        description: `${evidence.player_in || "Un jucător"} a intrat în locul lui ${evidence.player_out || "un jucător"}.`,
      };
    }
    if (insight.type === "key_moment") {
      return {
        title: analyst ? `${team} a finalizat o secvență decisivă` : `Gol pentru ${team}`,
        description: analyst
          ? `${player} a încheiat atacul la ${minute}. Golul este legat de șutul pe poartă din cronologia evenimentelor.`
          : `${player} a marcat și a schimbat momentul meciului pentru ${team}.`,
      };
    }
    if (insight.type === "pressure_window") {
      const followUp = [];
      if (counts.goal) followUp.push(`${counts.goal} gol`);
      if (counts.shot) followUp.push(`${counts.shot} șut`);
      if (counts.corner) followUp.push(`${counts.corner} corner`);
      return {
        title: analyst ? `${team} a controlat o fereastră de presiune (${start}-${end}')` : `${team} a pus presiune (${start}-${end}')`,
        description: analyst
          ? `${team} a avut ${evidence.team_pressure} momente de presiune asupra lui ${opponent}, față de ${evidence.opponent_pressure}. În următoarele cinci minute au urmat ${followUp.length ? followUp.join(", ") : "nicio acțiune ofensivă imediată"}.`
          : `${team} a pus presiune pe ${opponent}. ${followUp.length ? `Presiunea a fost urmată de ${followUp.join(", ")}.` : "Nu a fost înregistrată o consecință imediată."}`,
      };
    }
    if (insight.type === "pressure_turnover") {
      return {
        title: analyst ? `${team} a câștigat duelul de presiune` : `${team} a recuperat mingea`,
        description: analyst
          ? `${team} a recuperat posesia de la ${evidence.team_under_pressure} la ${minute}, după ${evidence.turnover_reason || "o acțiune defensivă"}. ${attacking.shot || attacking.goal || attacking.corner ? "A urmat o acțiune ofensivă în trei minute." : "Nu a urmat un șut sau corner în trei minute."}`
          : `${team} a recuperat mingea de la ${evidence.team_under_pressure}. ${attacking.shot || attacking.goal || attacking.corner ? "Recuperarea a fost urmată de un atac." : "Echipa a putut relua construcția."}`,
      };
    }
    if (insight.type === "attacking_pattern") {
      return { title: analyst ? `${team} a generat mai multe finalizări` : `${team} a atacat mai mult`, description: analyst ? `${team} a avut ${evidence.team_shots} șuturi față de ${evidence.opponent_shots} ale adversarei.` : `${team} a creat ${evidence.team_shots} încercări, față de ${evidence.opponent_shots}.` };
    }
    if (insight.type === "finishing_pattern") {
      return { title: analyst ? `${team} a fost eficientă la finalizare` : `${team} și-a valorificat ocaziile`, description: analyst ? `${evidence.shots_on_target} din ${evidence.shots} șuturi au fost pe poartă.` : `${evidence.shots_on_target} din ${evidence.shots} șuturi au pus portarul la încercare.` };
    }
    if (insight.type === "control_pattern") {
      return { title: analyst ? `${team} a controlat fazele de posesie` : `${team} a ținut bine mingea`, description: analyst ? "Posesiile au fost mai lungi și au inclus mai multe pase în medie." : "Echipa a construit secvențe mai lungi cu mingea." };
    }
    if (insight.type === "match_state") {
      return { title: analyst ? "Echilibru detectat în posesie" : "Meci echilibrat", description: analyst ? `Diferența de posesie a fost de ${Math.abs(evidence[Object.keys(evidence)[0]] - evidence[Object.keys(evidence)[1]]).toFixed(1)} puncte procentuale.` : "Niciuna dintre echipe nu a dominat clar posesia." };
    }
  }

  if (language === "en") {
    if (insight.type === "shot_on_target") {
      return {
        title: analyst ? `${player} tested the goalkeeper` : `Shot on target for ${team}`,
        description: analyst
          ? `${player} put the ball on target. Speed: ${evidence.speed_kmh || "—"} km/h; outcome: ${evidence.outcome || "—"}.`
          : `${player} produced a shot on target for ${team}.`,
      };
    }
    if (insight.type === "foul_event") {
      return {
        title: analyst ? `${player} committed a foul` : `Foul by ${player}`,
        description: analyst
          ? `${player} (${team}) fouled ${evidence.fouled_player || "an opponent"}.`
          : `${player} fouled ${evidence.fouled_player || "an opponent"}.`,
      };
    }
    if (insight.type === "penalty_event") {
      return {
        title: analyst ? `Penalty: ${player}` : `Penalty for ${team}`,
        description: `${player} took the penalty. Outcome: ${evidence.outcome || "—"}.`,
      };
    }
    if (insight.type === "card_event") {
      const card = evidence.card === "red_card" ? "red card" : "yellow card";
      return {
        title: analyst ? `${card} · ${player}` : `${player} received a ${card}`,
        description: `Recorded reason: ${evidence.reason || "not specified"}.`,
      };
    }
    if (insight.type === "substitution_event") {
      return {
        title: analyst ? `Tactical change for ${team}` : `Substitution for ${team}`,
        description: `${evidence.player_in || "A player"} came on for ${evidence.player_out || "a player"}.`,
      };
    }
    if (insight.type === "key_moment") {
      return {
        title: analyst ? `${team} converted a decisive sequence` : `Goal for ${team}`,
        description: analyst
          ? `${player} finished the attack. The goal is linked to the shot on target at ${minute}, preserving event-level traceability.`
          : `${player} scored and put ${team} ahead in this match moment.`,
      };
    }
    if (insight.type === "pressure_window") {
      const followUp = [];
      if (counts.goal) followUp.push(`${counts.goal} goal`);
      if (counts.shot) followUp.push(`${counts.shot} shot${counts.shot === 1 ? "" : "s"}`);
      if (counts.corner) followUp.push(`${counts.corner} corner${counts.corner === 1 ? "" : "s"}`);
      if (counts.opponent_foul) followUp.push(`${counts.opponent_foul} opponent foul${counts.opponent_foul === 1 ? "" : "s"}`);
      return {
        title: analyst ? `${team} controlled a pressure window (${start}-${end}')` : `${team} applied pressure (${start}-${end}')`,
        description: analyst ? `${team} recorded ${evidence.team_pressure} pressure moments against ${opponent}, compared with ${evidence.opponent_pressure}. ${followUp.length ? `The pressure was followed by ${followUp.join(", ")}.` : "No immediate consequence was recorded."}` : `${team} put the opponent under pressure. ${followUp.length ? `That pressure was followed by ${followUp.join(", ")}.` : "No immediate consequence was recorded."}`,
      };
    }
    if (insight.type === "pressure_turnover") {
      return {
        title: analyst ? `${team} won the pressure duel` : `${team} recovered the ball`,
        description: analyst
          ? `${team} recovered possession from ${evidence.team_under_pressure} at ${minute} after ${evidence.turnover_reason || "a defensive action"}. ${attacking.shot || attacking.goal || attacking.corner ? "An attacking action followed within three minutes." : "The recovery did not lead to a shot or corner within three minutes."}`
          : `${team} won the ball back from ${evidence.team_under_pressure}. ${attacking.shot || attacking.goal || attacking.corner ? "The recovery was followed by an attacking action." : "It helped the team reset its possession."}`,
      };
    }
    if (insight.type === "attacking_pattern") {
      return { title: analyst ? `${team} generated more attempts` : `${team} attacked more often`, description: analyst ? `${team} had ${evidence.team_shots} shots compared with ${evidence.opponent_shots} for the opponent.` : `${team} created ${evidence.team_shots} attempts, more than the opponent's ${evidence.opponent_shots}.` };
    }
    if (insight.type === "finishing_pattern") {
      return { title: analyst ? `${team} showed finishing efficiency` : `${team} made chances count`, description: analyst ? `${evidence.shots_on_target} of ${evidence.shots} shots were on target.` : `${evidence.shots_on_target} of ${evidence.shots} attempts tested the goalkeeper.` };
    }
    if (insight.type === "control_pattern") {
      return { title: analyst ? `${team} controlled possession phases` : `${team} kept the ball well`, description: analyst ? "Possessions were longer and included more passes on average." : "The team built longer spells with the ball." };
    }
    if (insight.type === "match_state") {
      return { title: analyst ? "Possession balance detected" : "A balanced match", description: analyst ? `The possession gap was ${Math.abs(evidence[Object.keys(evidence)[0]] - evidence[Object.keys(evidence)[1]]).toFixed(1)} percentage points.` : "Neither team has clearly dominated possession so far." };
    }
  }

  if (language === "it") {
    if (insight.type === "shot_on_target") {
      return {
        title: analyst ? `${player} ha impegnato il portiere` : `Tiro nello specchio per ${team}`,
        description: analyst
          ? `${player} ha tirato nello specchio. Velocità: ${evidence.speed_kmh || "—"} km/h; esito: ${evidence.outcome || "—"}.`
          : `${player} ha effettuato un tiro nello specchio per ${team}.`,
      };
    }
    if (insight.type === "foul_event") {
      return {
        title: analyst ? `${player} ha commesso un fallo` : `Fallo di ${player}`,
        description: analyst
          ? `${player} (${team}) ha commesso fallo su ${evidence.fouled_player || "un avversario"}.`
          : `${player} ha commesso fallo su ${evidence.fouled_player || "un avversario"}.`,
      };
    }
    if (insight.type === "penalty_event") {
      return {
        title: analyst ? `Rigore: ${player}` : `Rigore per ${team}`,
        description: `${player} ha tirato il rigore. Esito: ${evidence.outcome || "—"}.`,
      };
    }
    if (insight.type === "card_event") {
      const card = evidence.card === "red_card" ? "cartellino rosso" : "cartellino giallo";
      return {
        title: analyst ? `${card} · ${player}` : `${player} ha ricevuto ${card}`,
        description: `Motivo registrato: ${evidence.reason || "non specificato"}.`,
      };
    }
    if (insight.type === "substitution_event") {
      return {
        title: analyst ? `Cambio tattico per ${team}` : `Sostituzione per ${team}`,
        description: `${evidence.player_in || "Un giocatore"} è entrato al posto di ${evidence.player_out || "un giocatore"}.`,
      };
    }
    if (insight.type === "key_moment") {
      return { title: analyst ? `${team} ha convertito una sequenza decisiva` : `Gol per ${team}`, description: analyst ? `${player} ha concluso l'azione al minuto ${minute}. Il gol è collegato al tiro nello specchio nella cronologia.` : `${player} ha segnato e ha cambiato il momento della partita per ${team}.` };
    }
    if (insight.type === "pressure_window") {
      return { title: analyst ? `${team} ha controllato una finestra di pressione (${start}-${end}')` : `${team} ha esercitato pressione (${start}-${end}')`, description: analyst ? `${team} ha registrato ${evidence.team_pressure} momenti di pressione su ${opponent}, contro ${evidence.opponent_pressure}.` : `${team} ha messo sotto pressione ${opponent}.` };
    }
    if (insight.type === "pressure_turnover") {
      return { title: analyst ? `${team} ha vinto il duello di pressione` : `${team} ha recuperato il pallone`, description: analyst ? `${team} ha recuperato il pallone da ${evidence.team_under_pressure} al minuto ${minute}, dopo ${evidence.turnover_reason || "un'azione difensiva"}.` : `${team} ha riconquistato il pallone e può ripartire.` };
    }
    if (insight.type === "attacking_pattern") {
      return { title: analyst ? `${team} ha creato più conclusioni` : `${team} ha attaccato di più`, description: analyst ? `${team} ha effettuato ${evidence.team_shots} tiri contro ${evidence.opponent_shots}.` : `${team} ha creato ${evidence.team_shots} conclusioni, contro ${evidence.opponent_shots}.` };
    }
    if (insight.type === "finishing_pattern") {
      return { title: analyst ? `${team} è stata efficiente in attacco` : `${team} ha sfruttato le occasioni`, description: analyst ? `${evidence.shots_on_target} dei ${evidence.shots} tiri sono finiti nello specchio.` : `${evidence.shots_on_target} dei ${evidence.shots} tiri hanno impegnato il portiere.` };
    }
    if (insight.type === "control_pattern") {
      return { title: analyst ? `${team} ha controllato le fasi di possesso` : `${team} ha gestito bene il pallone`, description: analyst ? "Le sequenze di possesso sono durate più a lungo e hanno incluso più passaggi." : "La squadra ha costruito azioni più lunghe con il pallone." };
    }
    if (insight.type === "match_state") {
      return { title: analyst ? "Equilibrio nel possesso" : "Partita equilibrata", description: analyst ? "La differenza di possesso tra le squadre è stata ridotta." : "Nessuna delle due squadre ha dominato chiaramente il possesso." };
    }
  }

  return { title: insight.title, description: insight.description };
}

function StatCard({ label, value, accent }) {
  return (
    <div className="stat-card">
      <span>{label}</span>
      <strong style={{ color: accent }}>{value}</strong>
    </div>
  );
}

function getStateLabel(state, t) {
  return {
    control: t.control,
    pressure: t.pressureState,
    chaos: t.chaos,
    clutch: t.clutch,
  }[state] || state;
}

function Pitch({ teams, score, lineups, selectedTeam, goalInsight, teamColors, ballEvent }) {
  const formationPositions = [
    [8, 50],
    [20, 16], [20, 39], [20, 61], [20, 84],
    [34, 24], [34, 50], [34, 76],
    [46, 18], [46, 50], [46, 82],
  ];
  const playerDots = Object.entries(lineups).flatMap(([team, lineup]) => {
    const players = lineup
      .map((entry) => ({
        ...(teams[team]?.[entry.player] || {}),
        ...entry,
        team,
      }));
    return players.map((player, index) => {
      const [baseX, baseY] = formationPositions[index] || formationPositions[formationPositions.length - 1];
      return {
        ...player,
        x: team === selectedTeam ? baseX : 100 - baseX,
        y: baseY,
        color: teamColors[team]?.primary || "#b58b58",
      };
    });
  });
  const goalTeamIsSelected = goalInsight?.team === selectedTeam;
  const teamNames = Object.keys(teams);
  const ballPosition = ballEvent?.position || [50, 50];

  return (
    <div className="pitch-wrap">
      <div className="pitch">
        <div className="pitch-scoreboard">
          <div className="pitch-scoreboard-team">
            <span className="broadcast-dot" style={{ background: teamColors[teamNames[0]]?.primary }} />
            <strong>{teamNames[0]}</strong>
            <b>{score?.[teamNames[0]] ?? 0}</b>
          </div>
          <span className="pitch-scoreboard-divider">—</span>
          <div className="pitch-scoreboard-team">
            <b>{score?.[teamNames[1]] ?? 0}</b>
            <strong>{teamNames[1]}</strong>
            <span className="broadcast-dot" style={{ background: teamColors[teamNames[1]]?.primary }} />
          </div>
        </div>
        <div className="halfway" />
        <div className="center-circle" />
        <div className="pitch-zone pitch-zone-left">BUILD-UP</div>
        <div className="pitch-zone pitch-zone-center">MIDFIELD</div>
        <div className="pitch-zone pitch-zone-right">FINAL THIRD</div>
        <div className="goal left-goal" />
        <div className="goal right-goal" />
        <div
          className="match-ball"
          style={{ left: `${ballPosition[0]}%`, top: `${ballPosition[1]}%` }}
          aria-label={ballEvent ? `${ballEvent.type} · ${ballEvent.player || ballEvent.team}` : "Ball"}
          title={ballEvent ? `${ballEvent.type} · ${ballEvent.player || ballEvent.team}` : "Ball"}
        >
          <span />
        </div>
        {playerDots.map((player) => (
          <div
            className="player-dot"
            key={`${player.team}-${player.player}`}
            style={{ left: `${player.x}%`, top: `${player.y}%`, background: player.color }}
            title={`${player.player} · ${player.team}`}
          >
            <span>{player.shirt_number || "—"}</span>
          </div>
        ))}
        {goalInsight && (
          <div
            className={`goal-celebration ${goalTeamIsSelected ? "goal-to-right" : "goal-to-left"}`}
            aria-live="polite"
            aria-label={goalInsight.title}
          >
            <div className="goal-flash" />
            <div className="goal-banner">
              <span className="goal-label">GOAL</span>
              <strong>{goalInsight.title}</strong>
              <span>{goalInsight.match_time}</span>
            </div>
            <div className="goal-ripple goal-ripple-one" />
            <div className="goal-ripple goal-ripple-two" />
            <img className="celebration-player" src="/resources/knee-slide-celebration.png" alt="" />
            <div className="celebration-ball" />
            <div className="goal-spark spark-one" />
            <div className="goal-spark spark-two" />
            <div className="goal-spark spark-three" />
            <div className="goal-spark spark-four" />
          </div>
        )}
      </div>
      <div className="pitch-legend">
        <span><i className="legend-dot" style={{ background: teamColors[teamNames[0]]?.primary }} />{teamNames[0]}</span>
        <span><i className="legend-dot" style={{ background: teamColors[teamNames[1]]?.primary }} />{teamNames[1]}</span>
      </div>
    </div>
  );
}

function TeamStats({ stats, team, t, color }) {
  const data = stats[team];
  return (
    <div className="stats-panel">
      <div className="team-stat-title"><strong>{team}</strong><span style={{ background: color }}>{data.goals}</span></div>
      <div className="stat-grid">
        <StatCard label={t.possession} value={`${data.possession}%`} accent={color} />
        <StatCard label={t.passes} value={data.passes} accent={color} />
        <StatCard label={t.passAccuracy} value={`${data.pass_accuracy}%`} accent={color} />
        <StatCard label={t.shots} value={data.shots} accent={color} />
        <StatCard label={t.pressure} value={data.pressure} accent={color} />
        <StatCard label={t.shotsOnTarget} value={data.shots_on_target} accent={color} />
      </div>
    </div>
  );
}

function MatchTimeline({ insights, timeline, selectedInsightId, onSelect, t, teams }) {
  const eventInsights = insights.filter((insight) => insight.match_time);
  const selectedInsight = eventInsights.find((insight) => insight.id === selectedInsightId);
  const progress = Math.min(100, Math.max(0, ((selectedInsight?.timestamp || 0) / 90) * 100));
  return (
    <div className="match-timeline">
      <div className="timeline-heading">
        <strong>{t.matchDna}</strong>
        <span>{t.matchState}</span>
      </div>
      <div className="timeline-track">
        <span className="timeline-start">0'</span>
        <div className="timeline-events" style={{ "--progress": `${progress}%` }}>
          <i className="timeline-playhead" aria-hidden="true" />
          {(timeline || []).map((snapshot) => {
            const matchingInsight = eventInsights.find(
              (insight) => insight.timestamp === snapshot.timestamp,
            );
            const state = snapshot.state?.state || "control";
            return (
            <button
              className={`timeline-event state-${state} ${matchingInsight && selectedInsightId === matchingInsight.id ? "active" : ""}`}
              key={`${snapshot.timestamp}-${state}`}
              style={{ left: `${Math.min(100, Math.max(0, (snapshot.timestamp / 90) * 100))}%` }}
              onClick={() => matchingInsight && onSelect(matchingInsight.id)}
              title={`${snapshot.timestamp.toFixed(1)}' · ${getStateLabel(state, t)}`}
            >
              <span />
            </button>
            );
          })}
        </div>
        <span className="timeline-middle">45'</span>
        <span className="timeline-end">90'</span>
      </div>
      <div className="timeline-readout">
        {(timeline || []).slice(-6).map((snapshot) => (
          <button
            key={`readout-${snapshot.timestamp}`}
            className="timeline-readout-item"
            onClick={() => {
              const insight = eventInsights.find(
                (item) => item.timestamp === snapshot.timestamp,
              );
              if (insight) onSelect(insight.id);
            }}
          >
            <b>{Math.floor(snapshot.timestamp)}'</b>
            <span className={`state-badge state-${snapshot.state?.state || "control"}`}>
              {getStateLabel(snapshot.state?.state || "control", t)}
            </span>
            <small>
              {teams[0]} {snapshot.score?.[teams[0]] ?? 0}–{snapshot.score?.[teams[1]] ?? 0} {teams[1]}
              {" · "}
              {snapshot.stats?.[teams[0]]?.possession ?? 50}% possession
              {" · "}
              P {snapshot.stats?.[teams[0]]?.pressure ?? 0}/
              {snapshot.stats?.[teams[1]]?.pressure ?? 0}
              {" · "}
              S {(snapshot.stats?.[teams[0]]?.substitutions ?? 0)
                + (snapshot.stats?.[teams[1]]?.substitutions ?? 0)}
            </small>
          </button>
        ))}
      </div>
    </div>
  );
}

function DirectorPanel({ insights, selectedInsight, queue, t, onSelect, onToggleQueue }) {
  const candidates = insights
    .filter((insight) => (
      insight.match_time
      && ["key_moment", "penalty_event"].includes(insight.type)
    ))
    .sort((first, second) => (
      (first.timestamp || 0) - (second.timestamp || 0)
    ));
  return (
    <div className="panel director-panel">
      <div className="panel-heading">
        <div>
          <h2>{t.directorTitle}</h2>
          <p className="panel-subtitle">{t.directorSubtitle}</p>
        </div>
        <span className="director-live">{t.onAir}</span>
      </div>
      <div className="director-preview">
        <span className="director-preview-label">LIVE OVERLAY</span>
        <strong>{selectedInsight?.title || t.selectInsight}</strong>
        <small>{selectedInsight?.description || "—"}</small>
        {selectedInsight && <span className="overlay-spec">{selectedInsight.match_time} · {selectedInsight.overlay?.duration_seconds || 6}s · {selectedInsight.type.replaceAll("_", " ")}</span>}
      </div>
      <div className="director-list">
        {candidates.map((insight) => (
          <div className={`director-item ${selectedInsight?.id === insight.id ? "active" : ""}`} key={insight.id}>
          <button onClick={() => onSelect(insight.id)}>
            <span>{insight.match_time}</span>
            <strong>{insight.title}</strong>
            <small>{insight.overlay?.duration_seconds || 6}s</small>
          </button>
          <button className="queue-button" onClick={() => onToggleQueue(insight.id)}>
            {queue.includes(insight.id) ? t.removeOverlay : t.addOverlay}
          </button>
          </div>
        ))}
      </div>
      <div className="overlay-queue-summary"><strong>{t.overlayQueue}</strong><span>{queue.length} {t.queued.toLowerCase()}</span></div>
    </div>
  );
}

function RecapPanel({ recap, loading, error, onGenerate, t }) {
  return (
    <section className="panel recap-card">
      <div>
        <span className="section-kicker">AI</span>
        <h2>{t.recapTitle}</h2>
        <p>{t.recapHint}</p>
      </div>
      <div className="recap-action">
        <button className="recap-button" onClick={onGenerate} disabled={loading}>
          {loading ? t.recapLoading : t.generateRecap}
        </button>
        {error && <p className="recap-error">{t.recapUnavailable}</p>}
        {recap && <p className="recap-text">{recap}</p>}
      </div>
    </section>
  );
}

function FanStory({ insight, team, player, t }) {
  if (!insight) return null;
  const teamMoment = insight.team === team;
  return (
    <section className={`fan-story ${teamMoment ? "favorite-moment" : "opponent-moment"}`}>
      <div className="fan-story-meta"><span>{t.forYou}</span><span>{insight.match_time}</span></div>
      <h2>{insight.title}</h2>
      <p>{insight.description}</p>
      <div className="fan-story-footer">
        <span>{teamMoment ? `${team} · ${player || t.playerFocus}` : `${team} watch`}</span>
        <span className={`state-badge state-${insight.type.includes("pressure") ? "pressure" : "clutch"}`}>{teamMoment ? t.playerFocus : t.matchContext}</span>
      </div>
    </section>
  );
}

function SyntheticFeed({ events, activeInsight, isFinished, t }) {
  // The feed is always derived from the same synthetic match clock as the
  // selected insight. End-of-match patterns intentionally resolve to 90'.
  const activeTime = activeInsight?.timestamp ?? (isFinished ? 90 : 0);
  const recent = [...events]
    .sort((first, second) => first.timestamp - second.timestamp)
    .filter((event) => event.timestamp <= activeTime)
    .slice(-4)
    .reverse();
  const sourceEvent = events.find((event) => event.event_id === activeInsight?.id);
  const isDerivedInsight = activeInsight && !sourceEvent;
  return (
    <section className="panel synthetic-feed">
      <div className="panel-heading"><h2>{t.syntheticFeed}</h2><span className="live-dot">{t.live}</span></div>
      <p className="pipeline-caption">{t.pipeline}</p>
      <div className="feed-list">
        {isDerivedInsight && (
          <div className="feed-event feed-derived">
            <time>{activeInsight.match_time || "90:00"}</time>
            <span>{activeInsight.type.replaceAll("_", " ")}</span>
            <small>derived from match context</small>
          </div>
        )}
        {recent.length ? recent.map((event) => (
          <div className="feed-event" key={event.event_id || `${event.type}-${event.timestamp}`}>
            <time>{Math.floor(event.timestamp)}'</time>
            <span>{event.type.replaceAll("_", " ")}</span>
            <small>{event.player || event.team} · {event.team}</small>
          </div>
        )) : <p className="muted-note">{t.incomingEvent}</p>}
      </div>
    </section>
  );
}

function EvidenceGrid({ evidence, detailed, t }) {
  const labels = {
    team_pressure: "Pressure events",
    opponent_pressure: "Opponent pressure",
    turnover_reason: "Recovery trigger",
    speed_kmh: "Shot speed",
    outcome: "Outcome",
    player: "Player",
    reason: "Reason",
    shots: "Shots",
    shots_on_target: "On target",
  };
  return (
    <div className="evidence-box">
      <strong>{t.keyEvidence}</strong>
      <div className="evidence-grid">
        {Object.entries(evidence || {})
          .filter(([key, value]) => typeof value !== "object" && value !== null && labels[key])
          .slice(0, detailed ? 8 : 4)
          .map(([key, value]) => <span key={key}><b>{labels[key]}</b>{String(value)}</span>)}
      </div>
    </div>
  );
}

function PlayerPanel({ player, t, detailed }) {
  if (!player) return null;
  return (
    <div className="player-panel fifa-card">
      <div className="fifa-card-hero">
        <strong>{Math.min(99, 68 + player.goals * 8 + Math.round(player.pass_accuracy / 8))}</strong>
        <span>{player.role?.slice(0, 3).toUpperCase()}</span>
        <div className="fifa-shirt">{player.shirt_number || "—"}</div>
      </div>
      <div className="fifa-card-name"><strong>{player.player}</strong><span>{player.team}</span></div>
      <div className="fifa-metrics">
        <span><b>{player.passes}</b>{t.passes}</span>
        <span><b>{player.pass_accuracy}%</b>{t.passAccuracy}</span>
        <span><b>{player.shots}</b>{t.shots}</span>
        <span><b>{player.goals}</b>{t.goals}</span>
        <span><b>{player.pressure_events}</b>{t.pressure}</span>
        {detailed && <span><b>{player.max_shot_speed_kmh}</b>km/h</span>}
      </div>
    </div>
  );
}

function InsightIcon({ type, icon }) {
  if (["pressure_window", "pressure_turnover", "tactical_pattern"].includes(type)) {
    return null;
  }

  const imageByType = {
    key_moment: "/resources/knee-slide-celebration.png",
    shot_on_target: "/resources/shot-on-target.png",
    foul_event: "/resources/tackle.png",
    penalty_event: "/resources/soccer.png",
    card_event: "/resources/soccer-card.png",
    substitution_event: "/resources/substitution.png",
  };
  const image = imageByType[type];
  const sourceByType = {
    key_moment: "https://thenounproject.com/browse/icons/term/knee-slide-celebration/",
    shot_on_target: "https://thenounproject.com/browse/icons/term/shot-on-target/",
    foul_event: "https://thenounproject.com/browse/icons/term/tackle/",
    penalty_event: "https://thenounproject.com/browse/icons/term/soccer/",
    card_event: "https://thenounproject.com/browse/icons/term/soccer-card/",
    substitution_event: "https://thenounproject.com/browse/icons/term/substitution/",
  };
  return (
    <a
      className={`insight-icon icon-${icon || "insight"}`}
      href={sourceByType[type]}
      target="_blank"
      rel="noreferrer"
      aria-label={`Sursa iconiței: ${icon || type}`}
      onClick={(event) => event.stopPropagation()}
    >
      {image && <img src={image} alt="" />}
    </a>
  );
}

const iconlessInsightTypes = ["pressure_window", "pressure_turnover", "tactical_pattern"];

function App() {
  const [payload, setPayload] = useState(null);
  const [mode, setMode] = useState("fan");
  const [page, setPage] = useState("match");
  const [language, setLanguage] = useState("ro");
  const [selectedTeam, setSelectedTeam] = useState("");
  const [selectedPlayer, setSelectedPlayer] = useState("");
  const [selectedInsightId, setSelectedInsightId] = useState(null);
  const [error, setError] = useState(false);
  const [recap, setRecap] = useState("");
  const [recapLoading, setRecapLoading] = useState(false);
  const [recapError, setRecapError] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [overlayQueue, setOverlayQueue] = useState([]);
  const insightListRef = useRef(null);
  const t = translations[language];
  const currentDate = new Intl.DateTimeFormat(language, {
    dateStyle: "full",
  }).format(new Date());

  useEffect(() => {
    fetch(`${API_URL}/api/match`)
      .then((response) => {
        if (!response.ok) throw new Error("Match request failed");
        return response.json();
      })
      .then((data) => {
        setPayload(data);
        setSelectedTeam(data.match.home_team);
      })
      .catch(() => setError(true));
  }, []);

  const teams = payload?.player_stats || {};
  const teamNames = Object.keys(teams);
  const players = selectedTeam ? Object.values(teams[selectedTeam] || {}) : [];
  const localizedInsights = useMemo(
    () => (payload?.insights || [])
      .map((insight) => ({
        ...insight,
        ...localizeInsight(insight, language, mode),
      }))
      .sort((first, second) => {
        const firstTime = first.timestamp == null ? Number.POSITIVE_INFINITY : first.timestamp;
        const secondTime = second.timestamp == null ? Number.POSITIVE_INFINITY : second.timestamp;
        return firstTime - secondTime;
      }),
    [payload, language, mode],
  );
  // A sequence contains every insight. Match moments retain their real timestamp;
  // end-of-match patterns are added one at a time after the final event.
  const playbackInsights = useMemo(() => {
    const moments = localizedInsights.filter((insight) => insight.match_time);
    const summaries = localizedInsights.filter((insight) => !insight.match_time);
    return [...moments, ...summaries];
  }, [localizedInsights]);
  const revealedInsights = useMemo(() => {
    const activeIndex = playbackInsights.findIndex(
      (insight) => insight.id === selectedInsightId,
    );
    if (activeIndex < 0) return [];
    return playbackInsights.slice(0, activeIndex + 1);
  }, [localizedInsights, playbackInsights, selectedInsightId, isPlaying]);
  const displayedInsight = revealedInsights.find((insight) => insight.id === selectedInsightId)
    || revealedInsights[revealedInsights.length - 1];
  const isMatchFinished = !isPlaying
    && playbackInsights.length > 0
    && displayedInsight?.id === playbackInsights[playbackInsights.length - 1]?.id;
  const visibleTimeline = useMemo(() => {
    if (isMatchFinished) return payload?.timeline || [];
    if (!displayedInsight?.match_time) return (payload?.timeline || []).slice(0, 1);
    return (payload?.timeline || []).filter(
      (snapshot) => snapshot.timestamp <= displayedInsight.timestamp,
    );
  }, [payload, displayedInsight, isMatchFinished]);
  const currentSnapshot = useMemo(() => {
    const timeline = payload?.timeline || [];
    if (!payload) {
      return {
        score: {},
        stats: {},
        player_stats: {},
        lineups: {},
        state: null,
      };
    }
    if (isMatchFinished) {
      return {
        score: payload.match.score,
        stats: payload.stats,
        player_stats: payload.player_stats,
        lineups: payload.match.lineups,
        state: payload.match_state || null,
      };
    }
    if (!timeline.length) {
      return {
        score: payload.match.score,
        stats: payload.stats,
        player_stats: payload.player_stats,
        lineups: payload.match.lineups,
        state: payload.match_state || null,
      };
    }
    if (displayedInsight?.timestamp == null) {
      return selectedInsightId
        ? {
          score: payload.match.score,
          stats: payload.stats,
          player_stats: payload.player_stats,
          lineups: payload.match.lineups,
          state: payload.match_state || null,
        }
        : timeline[0];
    }
    return timeline.reduce(
      (current, snapshot) => (
        snapshot.timestamp <= displayedInsight.timestamp ? snapshot : current
      ),
      timeline[0],
    );
  }, [payload, displayedInsight, isMatchFinished, selectedInsightId]);
  const liveLineups = useMemo(() => {
    return currentSnapshot.lineups;
  }, [currentSnapshot]);
  const currentTeams = currentSnapshot.player_stats || teams;
  const activePlayer = currentTeams[selectedTeam]?.[selectedPlayer]
    || players.find((player) => player.player === selectedPlayer);
  const accent = TEAM_COLORS[selectedTeam]?.primary || "#b58b58";
  const goalInsight = displayedInsight?.type === "key_moment" ? displayedInsight : null;
  const currentState = currentSnapshot.state;
  const ballEvent = useMemo(() => {
    const clock = displayedInsight?.timestamp ?? (isMatchFinished ? 90 : 0);
    return [...(payload?.match.events || [])]
      .sort((first, second) => first.timestamp - second.timestamp)
      .filter((event) => event.timestamp <= clock && Array.isArray(event.position))
      .at(-1) || null;
  }, [payload, displayedInsight, isMatchFinished]);
  const personalizedHighlights = useMemo(() => [...revealedInsights]
    .filter((insight) => insight.match_time)
    .sort((first, second) => {
      const relevance = (insight) => (
        (insight.team === selectedTeam ? 3 : 0)
        + (insight.evidence?.player === selectedPlayer ? 2 : 0)
        + (insight.priority === 1 ? 1 : 0)
      );
      return relevance(second) - relevance(first) || (second.timestamp || 0) - (first.timestamp || 0);
    }), [revealedInsights, selectedTeam, selectedPlayer]);
  const personalHero = personalizedHighlights[0] || displayedInsight;

  const generateRecap = () => {
    setRecapLoading(true);
    setRecapError(false);
    const recapMode = mode === "director" ? "fan" : mode;
    fetch(`${API_URL}/api/recap?mode=${recapMode}&language=${language}`)
      .then((response) => {
        if (!response.ok) throw new Error("Recap request failed");
        return response.json();
      })
      .then((data) => setRecap(data.text || ""))
      .catch(() => {
        setRecap("");
        setRecapError(true);
      })
      .finally(() => setRecapLoading(false));
  };

  useEffect(() => {
    if (!playbackInsights.length) return undefined;
    if (!isPlaying) return undefined;
    const timer = window.setInterval(() => {
      setSelectedInsightId((currentId) => {
        if (!currentId) return playbackInsights[0].id;
        const currentIndex = playbackInsights.findIndex(
          (insight) => insight.id === currentId,
        );
        if (currentIndex + 1 >= playbackInsights.length) {
          setIsPlaying(false);
          return playbackInsights[playbackInsights.length - 1].id;
        }
        return playbackInsights[currentIndex + 1].id;
      });
    }, 7000);
    return () => window.clearInterval(timer);
  }, [isPlaying, playbackInsights, selectedInsightId]);

  useEffect(() => {
    if (!insightListRef.current || !displayedInsight?.id) return;
    const list = insightListRef.current;
    const insight = list.querySelector(`[data-insight-id="${displayedInsight.id}"]`);
    // Keep the page where the viewer left it. Only the constrained insight
    // list is allowed to follow the live event when it needs to overflow.
    if (insight && list.scrollHeight > list.clientHeight) {
      list.scrollTo({
        top: Math.max(0, insight.offsetTop - list.offsetTop - 8),
        behavior: "smooth",
      });
    }
  }, [displayedInsight?.id]);

  const selectInsight = (insightId) => {
    setSelectedInsightId(insightId);
    setIsPlaying(false);
  };

  const restartMatch = () => {
    if (!playbackInsights.length) return;
    setSelectedInsightId(null);
    setIsPlaying(false);
    setRecap("");
    setRecapError(false);
  };

  const startMatch = () => {
    if (!playbackInsights.length) return;
    if (!selectedInsightId || isMatchFinished) {
      setSelectedInsightId(playbackInsights[0].id);
    }
    setIsPlaying(true);
  };

  const toggleOverlay = (insightId) => {
    setOverlayQueue((current) => (
      current.includes(insightId)
        ? current.filter((id) => id !== insightId)
        : [...current, insightId]
    ));
  };

  useEffect(() => {
    if (players.length && !players.some((player) => player.player === selectedPlayer)) {
      setSelectedPlayer(players[0].player);
    }
  }, [selectedTeam, players, selectedPlayer]);

  if (!payload) {
    return <main className="app-shell centered">{error ? <p>{t.error}</p> : <p>{t.loading}</p>}</main>;
  }

  return (
    <main className="app-shell clean-shell">
      <header className="clean-topbar">
        <strong className="brand-mark">MI</strong>
        <nav className="page-switcher" aria-label="Application sections">
          <button className={page === "match" ? "active" : ""} onClick={() => setPage("match")}>{t.matchView}</button>
          <button className={page === "stats" ? "active" : ""} onClick={() => setPage("stats")}>{t.statsView}</button>
        </nav>
        <div className="clean-controls">
          <div className="segmented">
            <button className={mode === "fan" ? "active" : ""} onClick={() => setMode("fan")}>{t.fan}</button>
            <button className={mode === "analyst" ? "active" : ""} onClick={() => setMode("analyst")}>{t.analyst}</button>
            <button className={mode === "director" ? "active" : ""} onClick={() => setMode("director")}>{t.director}</button>
          </div>
          <select aria-label={t.language} value={language} onChange={(event) => setLanguage(event.target.value)}><option value="ro">RO</option><option value="it">IT</option><option value="en">EN</option></select>
        </div>
      </header>

      <section className="clean-scorebar">
        <div className="score-team"><span style={{ background: TEAM_COLORS[payload.match.home_team]?.primary }} />{payload.match.home_team}</div>
        <strong>{currentSnapshot.score?.[payload.match.home_team] ?? 0} <i>—</i> {currentSnapshot.score?.[payload.match.away_team] ?? 0}</strong>
        <div className="score-team away">{payload.match.away_team}<span style={{ background: TEAM_COLORS[payload.match.away_team]?.primary }} /></div>
        <time>{displayedInsight?.match_time || "00:00"}</time>
      </section>

      <section className="clean-settings">
        <select aria-label={t.favoriteTeam} value={selectedTeam} onChange={(event) => setSelectedTeam(event.target.value)}>{teamNames.map((team) => <option key={team}>{team}</option>)}</select>
        <select aria-label={t.favoritePlayer} value={selectedPlayer} onChange={(event) => setSelectedPlayer(event.target.value)}>{players.map((player) => <option key={player.player}>{player.player}</option>)}</select>
        <button className="start-button" onClick={startMatch} disabled={isPlaying}>{t.start}</button>
        <button className="restart-button" onClick={restartMatch}>{t.restart}</button>
      </section>

      {page === "match" ? (
        <section className="clean-match-layout">
          <div className="clean-pitch-column">
            <Pitch teams={currentTeams} score={currentSnapshot.score} lineups={liveLineups} selectedTeam={selectedTeam} goalInsight={goalInsight} teamColors={TEAM_COLORS} ballEvent={ballEvent} />
            <MatchTimeline insights={revealedInsights} timeline={visibleTimeline} selectedInsightId={selectedInsightId} onSelect={selectInsight} t={t} teams={teamNames} />
          </div>
          <aside className="clean-event-column">
            {displayedInsight ? <div className="current-insight"><span>{displayedInsight.match_time || "FT"}</span><strong>{displayedInsight.title}</strong><p>{displayedInsight.description}</p></div> : <div className="current-insight empty"><p>{t.noEvents}</p></div>}
            {mode === "director" ? <DirectorPanel insights={revealedInsights} selectedInsight={displayedInsight} queue={overlayQueue} t={t} onSelect={selectInsight} onToggleQueue={toggleOverlay} /> : <SyntheticFeed events={payload.match.events || []} activeInsight={displayedInsight} isFinished={isMatchFinished} t={t} />}
            <div className="clean-insight-list" ref={insightListRef}>
              {revealedInsights.map((insight) => <button key={insight.id} data-insight-id={insight.id} className={displayedInsight?.id === insight.id ? "active" : ""} onClick={() => selectInsight(insight.id)}><time>{insight.match_time || "FT"}</time><span>{insight.title}</span></button>)}
            </div>
          </aside>
        </section>
      ) : (
        <section className="clean-stats-layout">
          <div className="stats-stack"><TeamStats stats={currentSnapshot.stats} team={selectedTeam} t={t} color={accent} /><PlayerPanel player={activePlayer} t={t} detailed={mode === "analyst"} /></div>
          <div className="recap-stack"><RecapPanel recap={recap} loading={recapLoading} error={recapError} onGenerate={generateRecap} t={t} />{displayedInsight && <div className="simple-evidence"><strong>{displayedInsight.title}</strong><p>{displayedInsight.description}</p><EvidenceGrid evidence={displayedInsight.evidence} detailed={mode === "analyst"} t={t} /></div>}</div>
        </section>
      )}
    </main>
  );
}

createRoot(document.getElementById("root")).render(<App />);
