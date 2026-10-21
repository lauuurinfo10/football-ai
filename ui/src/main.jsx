import React, { useEffect, useMemo, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import "./styles.css";

const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

const TEAM_COLORS = {
  Arsenal: { primary: "#ff2a5f", secondary: "#ffd166", text: "#ffffff" },
  Liverpool: { primary: "#00f5d4", secondary: "#00bbf9", text: "#041c18" },
  Chelsea: { primary: "#3a86ff", secondary: "#a8dadc", text: "#ffffff" },
  "Manchester City": { primary: "#4cc9f0", secondary: "#ffffff", text: "#061a23" },
  "Manchester United": { primary: "#f72585", secondary: "#ffbe0b", text: "#ffffff" },
  Tottenham: { primary: "#e2e8f0", secondary: "#38bdf8", text: "#090a0f" },
};

const ALL_TEAMS = Object.keys(TEAM_COLORS);

const translations = {
  ro: {
    studio: "Football for Everyone",
    eyebrow: "TELEMETRIE LIVE & COMENTARIU EXPLICABIL",
    fan: "Mod Fan",
    analyst: "Mod Analist",
    director: "Regie TV",
    restart: "Reset (0')",
    start: "Pornește Transmisiunea",
    pause: "Pauză",
    stepForward: "Faza +1",
    language: "Limbă",
    favoriteTeam: "Echipă Focus",
    favoritePlayer: "Jucător Focus",
    headToHead: "Telemetrie Comparativă (Live H2H)",
    playerAnalysis: "Dosar Jucător",
    possession: "Posesie",
    passes: "Pase",
    passAccuracy: "Precizie Pase",
    shots: "Șuturi Totale",
    shotsOnTarget: "Șuturi pe Poartă",
    xg: "Expected Goals (xG)",
    pressure: "Acțiuni Pressing",
    corners: "Cornere",
    fouls: "Faulturi",
    insights: "Cronologie Faze & Comentariu",
    insightCount: "faze",
    keyEvidence: "Dovezi Verificate (Anti-Halucinație)",
    matchDna: "ADN-ul Meciului & Faze Cheie",
    matchState: "Stare Joc",
    directorTitle: "Regie Broadcast Overlay",
    directorSubtitle: "Selectează fazele pentru burtiera TV.",
    generateRecap: "Generează Cronică Azure OpenAI",
    recapLoading: "Se redactează cronica...",
    recapUnavailable: "Recap-ul nu este disponibil momentan.",
    control: "Control",
    pressureState: "Presiune",
    chaos: "Haos",
    clutch: "Clutch",
    forYou: "FOCUSUL TĂU PERSONALIZAT",
    syntheticFeed: "Stream Evenimente Brute",
    incomingEvent: "Se așteaptă fluierul de start...",
    pipeline: "Eveniment → Context → Comentator AI → Overlay",
    overlayQueue: "Coadă TV",
    queued: "active",
    onAir: "ON AIR",
    addOverlay: "+ TV",
    removeOverlay: "× TV",
    recapTitle: "Cronica Meciului (Azure OpenAI)",
    recapHint: "Sinteză generată strict din datele validate ale partidei.",
    noEvents: "Apasă «Pornește Transmisiunea» pentru a începe comentariul.",
    voiceOn: "Voce ON",
    voiceOff: "Voce OFF",
    speakNow: "Audio",
    newMatch: "Simulează Meci Nou",
    generatingMatch: "Generare...",
    clickPlayerHint: "Click pe orice jucător de pe gazon pentru a-i vedea telemetria",
    shotMapToggle: "Hartă Șuturi (xG)",
    goals: "Goluri",
    loading: "Se inițializează Football for Everyone...",
    error: "Eroare conexiune API (verifică serverul FastAPI pe portul 8000).",
    attackRight: "Atacă →",
    attackLeft: "← Atacă",
    ballCoords: "Coordonate minge",
    simKicker: "GENERATOR MECI SINTETIC",
    playSequence: "Succesiune acțiune",
    stepBackward: "Faza -1",
    stepForwardLocked: "Faza următoare nu s-a derulat încă. Pornește redarea automată!",
    stepBackwardLocked: "Ești la începutul meciului.",
    voiceMutedSpeed: "Mute (>1x)",
    voiceSpeedNotice: "Vocea funcționează exclusiv la viteza normală (1x) pentru a păstra claritatea comentariului.",
    recapLocked: "Disponibil la Final (90')",
    recapLockedHint: "Cronica AI se deblochează doar după fluierul final (90'). Urmărește partida până la capăt!",
    evidenceLabels: {
      team_pressure: "Presiune Echipă",
      opponent_pressure: "Presiune Adversar",
      turnover_reason: "Cauză Recuperare",
      speed_kmh: "Viteză Șut (km/h)",
      outcome: "Rezultat",
      player: "Jucător",
      fouled_player: "Jucător Faultat",
      player_in: "Intrat",
      player_out: "Ieșit",
      reason: "Motiv",
      shots: "Șuturi",
      shots_on_target: "Pe Poartă",
      xg: "Valoare xG",
    },
  },
  it: {
    studio: "Football for Everyone",
    eyebrow: "TELEMETRIA LIVE & TELECRONACA SPIEGABILE",
    fan: "Tifoso",
    analyst: "Analista",
    director: "Regia TV",
    restart: "Reset (0')",
    start: "Avvia Diretta",
    pause: "Pausa",
    stepForward: "Azione +1",
    language: "Lingua",
    favoriteTeam: "Squadra Focus",
    favoritePlayer: "Giocatore Focus",
    headToHead: "Telemetria Comparativa (H2H)",
    playerAnalysis: "Dossier Giocatore",
    possession: "Possesso",
    passes: "Passaggi",
    passAccuracy: "Precisione Pass.",
    shots: "Tiri Totali",
    shotsOnTarget: "Tiri in Porta",
    xg: "Expected Goals (xG)",
    pressure: "Azioni Pressione",
    corners: "Calci d'Angolo",
    fouls: "Falli",
    insights: "Cronologia Telecronaca",
    insightCount: "azioni",
    keyEvidence: "Prove Verificate (Zero Allucinazioni)",
    matchDna: "DNA Partita & Momentum",
    matchState: "Stato Match",
    directorTitle: "Regia Broadcast Overlay",
    directorSubtitle: "Invia gli insight in sovrimpressione TV.",
    generateRecap: "Genera Sintesi Azure OpenAI",
    recapLoading: "Scrittura sintesi...",
    recapUnavailable: "Sintesi non disponibile.",
    control: "Controllo",
    pressureState: "Pressione",
    chaos: "Caos",
    clutch: "Clutch",
    forYou: "FOCUS PERSONALIZZATO",
    syntheticFeed: "Stream Eventi Grezzi",
    incomingEvent: "In attesa del calcio d'inizio...",
    pipeline: "Evento → Contesto → AI → Overlay",
    overlayQueue: "Coda TV",
    queued: "attivi",
    onAir: "IN ONDA",
    addOverlay: "+ TV",
    removeOverlay: "× TV",
    recapTitle: "Sintesi Match (Azure OpenAI)",
    recapHint: "Racconto generato rigorosamente dai dati validati.",
    noEvents: "Premi «Avvia Diretta» per iniziare.",
    voiceOn: "Voce ON",
    voiceOff: "Voce OFF",
    speakNow: "Audio",
    newMatch: "Simula Nuovo Match",
    generatingMatch: "Simulazione...",
    clickPlayerHint: "Clicca su un giocatore in campo per ispezionare i dati",
    shotMapToggle: "Mappa Tiri (xG)",
    goals: "Gol",
    loading: "Inizializzazione Football for Everyone...",
    error: "Errore connessione API (porta 8000).",
    attackRight: "Attacca →",
    attackLeft: "← Attacca",
    ballCoords: "Coordinate pallone",
    simKicker: "SIMULATORE MATCH SINTETICO",
    playSequence: "Sequenza azione",
    stepBackward: "Azione -1",
    stepForwardLocked: "La prossima azione non è ancora avvenuta. Avvia la riproduzione!",
    stepBackwardLocked: "Sei all'inizio della partita.",
    voiceMutedSpeed: "Muto (>1x)",
    voiceSpeedNotice: "La voce è attiva solo a velocità 1x per mantenere la chiarezza del commento.",
    recapLocked: "Disponibile al 90'",
    recapLockedHint: "La sintesi AI si sblocca solo al fischio finale (90'). Segui la partita fino al termine!",
    evidenceLabels: {
      team_pressure: "Pressione Squadra",
      opponent_pressure: "Pressione Avversario",
      turnover_reason: "Causa Recupero",
      speed_kmh: "Velocità Tiro (km/h)",
      outcome: "Esito",
      player: "Giocatore",
      fouled_player: "Giocatore Subito Fallo",
      player_in: "Entrato",
      player_out: "Uscito",
      reason: "Motivo",
      shots: "Tiri",
      shots_on_target: "Nello Specchio",
      xg: "Valore xG",
    },
  },
  en: {
    studio: "Football for Everyone",
    eyebrow: "LIVE TELEMETRY & EXPLAINABLE COMMENTARY",
    fan: "Fan Mode",
    analyst: "Analyst Mode",
    director: "TV Director",
    restart: "Reset (0')",
    start: "Start Broadcast",
    pause: "Pause",
    stepForward: "Step +1",
    language: "Language",
    favoriteTeam: "Team Focus",
    favoritePlayer: "Player Focus",
    headToHead: "Head-to-Head Telemetry",
    playerAnalysis: "Player Dossier",
    possession: "Possession",
    passes: "Passes",
    passAccuracy: "Pass Accuracy",
    shots: "Total Shots",
    shotsOnTarget: "Shots on Target",
    xg: "Expected Goals (xG)",
    pressure: "Pressing Actions",
    corners: "Corners",
    fouls: "Fouls",
    insights: "Commentary Timeline",
    insightCount: "moments",
    keyEvidence: "Verified Telemetry Evidence",
    matchDna: "Match DNA & Momentum",
    matchState: "Match State",
    directorTitle: "Broadcast Overlay Director",
    directorSubtitle: "Queue moments for the live lower-third graphic.",
    generateRecap: "Generate Azure OpenAI Recap",
    recapLoading: "Generating recap...",
    recapUnavailable: "AI recap unavailable.",
    control: "Control",
    pressureState: "Pressure",
    chaos: "Chaos",
    clutch: "Clutch",
    forYou: "PERSONALIZED FOCUS",
    syntheticFeed: "Raw Event Stream",
    incomingEvent: "Waiting for kick-off...",
    pipeline: "Event → Context → AI Narrator → Overlay",
    overlayQueue: "TV Queue",
    queued: "queued",
    onAir: "ON AIR",
    addOverlay: "+ TV",
    removeOverlay: "× TV",
    recapTitle: "AI Match Report (Azure OpenAI)",
    recapHint: "Grounded storytelling backed by match telemetry.",
    noEvents: "Press «Start Broadcast» to begin.",
    voiceOn: "Voice ON",
    voiceOff: "Voice OFF",
    speakNow: "Audio",
    newMatch: "Simulate New Match",
    generatingMatch: "Simulating...",
    clickPlayerHint: "Click any player on the pitch to inspect live telemetry",
    shotMapToggle: "xG Shot Map",
    goals: "Goals",
    loading: "Initializing Football for Everyone...",
    error: "API connection failed (check FastAPI on port 8000).",
    attackRight: "Attacking →",
    attackLeft: "← Attacking",
    ballCoords: "Ball coordinates",
    simKicker: "SYNTHETIC MATCH GENERATOR",
    playSequence: "Play sequence",
    stepBackward: "Step -1",
    stepForwardLocked: "Next phase hasn't unfolded yet. Resume auto-play!",
    stepBackwardLocked: "You are at the start of the match.",
    voiceMutedSpeed: "Muted (>1x)",
    voiceSpeedNotice: "Voice commentary is only available at 1x normal speed for speech clarity.",
    recapLocked: "Available at Full Time (90')",
    recapLockedHint: "The AI match recap unlocks only after full time (90'). Follow the broadcast to the final whistle!",
    evidenceLabels: {
      team_pressure: "Team Pressure",
      opponent_pressure: "Opponent Pressure",
      turnover_reason: "Turnover Cause",
      speed_kmh: "Shot Speed (km/h)",
      outcome: "Outcome",
      player: "Player",
      fouled_player: "Fouled Player",
      player_in: "Sub In",
      player_out: "Sub Out",
      reason: "Reason",
      shots: "Shots",
      shots_on_target: "On Target",
      xg: "xG Value",
    },
  },
};

function computeClientShotXg(event) {
  if (!event) return 0;
  if (event.type === "penalty") return 0.78;
  if (event.type !== "shot" && event.type !== "goal") return 0;
  const pos = event.position || [82, 50];
  const x = Number(pos[0]);
  const y = Number(pos[1]);
  const distLeft = Math.hypot(x * 1.05, (y - 50) * 0.68);
  const distRight = Math.hypot((100 - x) * 1.05, (y - 50) * 0.68);
  const dist = Math.min(distLeft, distRight);
  const offset = Math.abs(y - 50) / 50;
  let xg = 0.68 * Math.exp(-0.085 * Math.max(0, dist - 5)) * (1 - 0.45 * offset);
  if (event.body_part === "head") xg *= 0.65;
  if (event.under_pressure) xg *= 0.78;
  if (event.on_target) xg *= 1.12;
  return Number(Math.min(0.92, Math.max(0.02, xg)).toFixed(2));
}

let cachedVoices = [];
function initVoiceCache() {
  if (typeof window !== "undefined" && "speechSynthesis" in window) {
    cachedVoices = window.speechSynthesis.getVoices();
    if (!cachedVoices.length) {
      window.speechSynthesis.onvoiceschanged = () => {
        cachedVoices = window.speechSynthesis.getVoices();
      };
    }
  }
}
initVoiceCache();

function speakCommentary(text, language, enabled = true, onEnd = null) {
  if (!enabled || typeof window === "undefined" || !("speechSynthesis" in window) || !text) {
    if (onEnd) onEnd();
    return;
  }
  try {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    const langMap = { ro: "ro-RO", it: "it-IT", en: "en-GB" };
    const targetLang = langMap[language] || "en-GB";
    utterance.lang = targetLang;
    utterance.rate = 1.0;

    const voices = (window.speechSynthesis.getVoices() || []).length
      ? window.speechSynthesis.getVoices()
      : cachedVoices;

    const prefix = language.toLowerCase();
    const matchingVoice =
      voices.find((v) => v.lang && v.lang.toLowerCase().replace("_", "-").startsWith(prefix)) ||
      voices.find((v) => v.lang && v.lang.toLowerCase().startsWith(prefix));

    if (matchingVoice) {
      utterance.voice = matchingVoice;
      utterance.lang = matchingVoice.lang;
    }

    if (onEnd) {
      let called = false;
      const safeEnd = () => {
        if (!called) {
          called = true;
          onEnd();
        }
      };
      utterance.onend = safeEnd;
      utterance.onerror = safeEnd;
    }

    window.speechSynthesis.speak(utterance);
  } catch {
    if (onEnd) onEnd();
  }
}

function localizeInsight(insight, language, mode) {
  const evidence = insight.evidence || {};
  const team = insight.team || "";
  const opponent = evidence.opponent || evidence.team_under_pressure || "";
  const counts = evidence.follow_up_counts || {};
  const player = evidence.player || evidence.fouled_by || evidence.player_out || "";
  const start = evidence.start;
  const end = evidence.end;
  const minute = insight.match_time || "";
  const analyst = mode === "analyst";

  if (language === "ro") {
    if (insight.type === "shot_on_target") {
      return {
        title: analyst ? `${player} — Șut cadrat (${evidence.speed_kmh || "—"} km/h)` : `Ocazie pentru ${team}! Șut ${player}`,
        description: analyst
          ? `${player} a finalizat pe spațiul porții cu ${evidence.speed_kmh || "—"} km/h. Rezultat: ${evidence.outcome || "—"}.`
          : `${player} prinde un șut puternic pe poartă pentru ${team} și ridică tribuna în picioare!`,
      };
    }
    if (insight.type === "foul_event") {
      return {
        title: analyst ? `Fault tactic comis de ${player}` : `Fault făcut de ${player}`,
        description: analyst
          ? `${player} (${team}) a întrerupt faza faultându-l pe ${evidence.fouled_player || "un adversar"}.`
          : `Intervenție neregulamentară a lui ${player} asupra lui ${evidence.fouled_player || "unui adversar"}.`,
      };
    }
    if (insight.type === "penalty_event") {
      return {
        title: analyst ? `Lovitură de pedeapsă (0.78 xG) · ${player}` : `PENALTY pentru ${team}!`,
        description: `${player} execută de la 11 metri. Rezultat: ${evidence.outcome || "—"}.`,
      };
    }
    if (insight.type === "card_event") {
      const card = evidence.card === "red_card" ? "cartonaș roșu" : "cartonaș galben";
      return {
        title: analyst ? `Avertisment disciplinar (${card}) · ${player}` : `${player} primește ${card}!`,
        description: `Motiv înregistrat în telemetrie: ${evidence.reason || "neprecizat"}.`,
      };
    }
    if (insight.type === "substitution_event") {
      return {
        title: analyst ? `Mutare tactică la ${team}` : `Schimbare efectuată de ${team}`,
        description: `Intră ${evidence.player_in || "un jucător"} în locul lui ${evidence.player_out || "un jucător"}.`,
      };
    }
    if (insight.type === "key_moment") {
      return {
        title: analyst ? `${team} fructifică secvența ofensivă (${minute})` : `GOOOOL ${team}! Marchează ${player}!`,
        description: analyst
          ? `${player} înscrie la minutul ${minute}. Reușită confirmată prin telemetrie (xG: ${evidence.xg || "0.68"}).`
          : `Finalizare impecabilă a lui ${player} la ${minute}! ${team} modifică tabela!`,
      };
    }
    if (insight.type === "pressure_window") {
      const followUp = [];
      if (counts.goal) followUp.push(`${counts.goal} gol`);
      if (counts.shot) followUp.push(`${counts.shot} șut`);
      if (counts.corner) followUp.push(`${counts.corner} corner`);
      return {
        title: analyst ? `Fereastră de pressing avansat: ${team} (${start}-${end}')` : `${team} sufocă adversarul (${start}-${end}')`,
        description: analyst
          ? `${team} a înregistrat ${evidence.team_pressure} acțiuni de presiune vs ${evidence.opponent_pressure} ale lui ${opponent}. Urmare: ${followUp.length ? followUp.join(", ") : "control teritorial"}.`
          : `${team} pune o presiune uriașă pe ${opponent}! ${followUp.length ? `Din această dominare a rezultat: ${followUp.join(", ")}.` : ""}`,
      };
    }
    if (insight.type === "pressure_turnover") {
      return {
        title: analyst ? `Recuperare în zonă avansată: ${team}` : `${team} recuperează mingea sub presiune!`,
        description: analyst
          ? `${team} a forțat deposedarea lui ${evidence.team_under_pressure} la ${minute} (${evidence.turnover_reason || "pressing"}).`
          : `${team} fură mingea celor de la ${evidence.team_under_pressure} și declanșează tranziția!`,
      };
    }
    if (insight.type === "tactical_pattern") {
      return {
        title: analyst ? `Tipar tactic: Presiune superioară ${team}` : `${team} sufocă terenul cu un pressing necruțător!`,
        description: analyst
          ? `${team} a dominat net acțiunile de presiune (${evidence.team_pressure} vs ${evidence.opponent_pressure} ale adversarei).`
          : `${team} aleargă fără oprire și nu oferă niciun moment de respiro adversarilor!`,
      };
    }
    if (insight.type === "attacking_pattern") {
      return {
        title: analyst ? `Volum ofensiv ridicat: ${team}` : `Asediu la poartă pentru ${team}!`,
        description: analyst
          ? `${team} a totalizat ${evidence.team_shots || "multe"} șuturi spre poartă (${evidence.team_shots_on_target || "—"} pe spațiul porții).`
          : `${team} bombardează poarta adversă și creează pericol la fiecare acțiune!`,
      };
    }
    if (insight.type === "finishing_pattern") {
      return {
        title: analyst ? `Eficiență chirurgicală la finalizare: ${team}` : `${team} are o precizie letală în fața porții!`,
        description: analyst
          ? `${evidence.shots_on_target || 0} din ${evidence.shots || 0} șuturi au fost pe poartă (${evidence.on_target_rate || 50}% precizie).`
          : `Atacanții celor de la ${team} nu iartă nimic, fiecare minge trimisă pe poartă pune presiune maximă!`,
      };
    }
    if (insight.type === "control_pattern") {
      return {
        title: analyst ? `Control prelungit al posesiei: ${team}` : `${team} dirijează meciul ca o orchestră!`,
        description: analyst
          ? `Posesiile au durat în medie ${evidence.average_duration || 3} minute, cu ${evidence.passes_per_possession || 20} pase per secvență.`
          : `Circulație sigură a mingii și ritm dictat cap-coadă de ${team}!`,
      };
    }
    if (insight.type === "match_state") {
      return {
        title: analyst ? "Echilibru tactic pe teren" : "Luptă crâncenă pentru fiecare minge!",
        description: analyst
          ? "Distribuție simetrică a posesiei și a indicilor de pericol între cele două formații."
          : "Partidă de o intensitate incredibilă, ambele echipe luptă pentru fiecare centimetru!",
      };
    }
  }

  if (language === "it") {
    if (insight.type === "shot_on_target") {
      return {
        title: analyst ? `${player} — Conclusione nello specchio (${evidence.speed_kmh || "—"} km/h)` : `Occasione per ${team}! Tiro di ${player}`,
        description: analyst
          ? `${player} calcia verso la porta a ${evidence.speed_kmh || "—"} km/h. Esito: ${evidence.outcome || "—"}.`
          : `${player} scarica un destro potente verso la porta di ${team} ed accende lo stadio!`,
      };
    }
    if (insight.type === "foul_event") {
      return {
        title: analyst ? `Fallo tattico commesso da ${player}` : `Fallo di ${player}!`,
        description: analyst
          ? `${player} (${team}) arresta la transizione avversaria commettendo fallo su ${evidence.fouled_player || "un avversario"}.`
          : `Intervento duro di ${player} ai danni di ${evidence.fouled_player || "un avversario"}.`,
      };
    }
    if (insight.type === "penalty_event") {
      return {
        title: analyst ? `Calcio di rigore (0.78 xG) · ${player}` : `CALCIO DI RIGORE per ${team}!`,
        description: `${player} dal dischetto degli undici metri. Esito: ${evidence.outcome || "—"}.`,
      };
    }
    if (insight.type === "card_event") {
      const card = evidence.card === "red_card" ? "cartellino rosso" : "cartellino giallo";
      return {
        title: analyst ? `Sanzione disciplinare (${card}) · ${player}` : `${player} riceve un ${card}!`,
        description: `Motivazione registrata nella telemetria: ${evidence.reason || "non specificata"}.`,
      };
    }
    if (insight.type === "substitution_event") {
      return {
        title: analyst ? `Sostituzione tattica per ${team}` : `Cambio nelle file di ${team}`,
        description: `Esce dal campo ${evidence.player_out || "un giocatore"}, fa il suo ingresso ${evidence.player_in || "un giocatore"}.`,
      };
    }
    if (insight.type === "key_moment") {
      return {
        title: analyst ? `${team} concretizza la manovra offensiva (${minute})` : `GOOOL ${team}! Ha segnato ${player}!`,
        description: analyst
          ? `${player} sigla la rete al minuto ${minute}. Marcatura confermata da telemetria (xG: ${evidence.xg || "0.68"}).`
          : `Rete straordinaria di ${player} al minuto ${minute}! Esplode la gioia per ${team}!`,
      };
    }
    if (insight.type === "pressure_window") {
      const followUp = [];
      if (counts.goal) followUp.push(`${counts.goal} gol`);
      if (counts.shot) followUp.push(`${counts.shot} tiro/i`);
      if (counts.corner) followUp.push(`${counts.corner} corner`);
      return {
        title: analyst ? `Finestra di pressing alto: ${team} (${start}-${end}')` : `${team} assedia gli avversari (${start}-${end}')`,
        description: analyst
          ? `${team} ha registrato ${evidence.team_pressure} azioni di pressing contro ${evidence.opponent_pressure} di ${opponent}. Esito: ${followUp.length ? followUp.join(", ") : "controllo territoriale"}.`
          : `Pressione asfissiante di ${team} su ${opponent}! ${followUp.length ? `Frutto della pressione: ${followUp.join(", ")}.` : ""}`,
      };
    }
    if (insight.type === "pressure_turnover") {
      return {
        title: analyst ? `Recupero palla alto: ${team}` : `${team} strappa la palla e riparte!`,
        description: analyst
          ? `${team} costringe ${evidence.team_under_pressure} all'errore al minuto ${minute} (${evidence.turnover_reason || "pressing"}).`
          : `${team} ruba palla a ${evidence.team_under_pressure} e scatena immediatamente il contropiede!`,
      };
    }
    if (insight.type === "tactical_pattern") {
      return {
        title: analyst ? `Pattern tattico: Predominio nel pressing di ${team}` : `${team} non concede un attimo di respiro!`,
        description: analyst
          ? `${team} fa valere una marcata superiorità nei duelli di pressione (${evidence.team_pressure} vs ${evidence.opponent_pressure}).`
          : `Pressing implacabile dei giocatori di ${team}, avversari costantemente sotto assedio!`,
      };
    }
    if (insight.type === "attacking_pattern") {
      return {
        title: analyst ? `Volume offensivo elevato: ${team}` : `Raffica di conclusioni per ${team}!`,
        description: analyst
          ? `${team} ha totalizzato ${evidence.team_shots || "numerosi"} tiri verso la porta (${evidence.team_shots_on_target || "—"} nello specchio).`
          : `${team} martella l'area avversaria e va alla conclusione in continuazione!`,
      };
    }
    if (insight.type === "finishing_pattern") {
      return {
        title: analyst ? `Efficienza letale sotto porta: ${team}` : `${team} ha una precisione chirurgica!`,
        description: analyst
          ? `${evidence.shots_on_target || 0} su ${evidence.shots || 0} conclusioni hanno centrato lo specchio (${evidence.on_target_rate || 50}%).`
          : `Freddezza micidiale per gli attaccanti di ${team}: quasi ogni tiro centra lo specchio della porta!`,
      };
    }
    if (insight.type === "control_pattern") {
      return {
        title: analyst ? `Gestione prolungata del possesso: ${team}` : `${team} padrone assoluto del campo!`,
        description: analyst
          ? `Possessi della durata media di ${evidence.average_duration || 3} minuti con ${evidence.passes_per_possession || 20} passaggi a sequenza.`
          : `Giro palla autoritario e padronanza assoluta dei tempi di gioco per ${team}!`,
      };
    }
    if (insight.type === "match_state") {
      return {
        title: analyst ? "Equilibrio tattico in campo" : "Battaglia aperta su ogni zolla!",
        description: analyst
          ? "Distribuzione equilibrata del possesso palla e dei volumi di gioco tra le due squadre."
          : "Match vibrante e combattuto, nessuna delle due formazioni cede un solo centimetro!",
      };
    }
  }

  if (language === "en") {
    if (insight.type === "shot_on_target") {
      return {
        title: analyst ? `${player} — Shot on Target (${evidence.speed_kmh || "—"} km/h)` : `Chance for ${team}! Shot by ${player}`,
        description: analyst
          ? `${player} struck on target with recorded velocity ${evidence.speed_kmh || "—"} km/h. Outcome: ${evidence.outcome || "—"}.`
          : `${player} fires a thunderous strike on goal for ${team}, igniting the stands!`,
      };
    }
    if (insight.type === "foul_event") {
      return {
        title: analyst ? `Tactical foul by ${player}` : `Foul committed by ${player}!`,
        description: analyst
          ? `${player} (${team}) disrupted the attacking break with a foul on ${evidence.fouled_player || "an opponent"}.`
          : `Illegal challenge from ${player} on ${evidence.fouled_player || "an opponent"}.`,
      };
    }
    if (insight.type === "penalty_event") {
      return {
        title: analyst ? `Penalty kick (0.78 xG) · ${player}` : `PENALTY awarded to ${team}!`,
        description: `${player} steps up to take the spot kick. Outcome: ${evidence.outcome || "—"}.`,
      };
    }
    if (insight.type === "card_event") {
      const card = evidence.card === "red_card" ? "red card" : "yellow card";
      return {
        title: analyst ? `Disciplinary booking (${card}) · ${player}` : `${card.toUpperCase()} shown to ${player}!`,
        description: `Reason recorded in telemetry: ${evidence.reason || "unspecified"}.`,
      };
    }
    if (insight.type === "substitution_event") {
      return {
        title: analyst ? `Tactical substitution: ${team}` : `Substitution made by ${team}`,
        description: `${evidence.player_in || "A player"} enters the pitch replacing ${evidence.player_out || "a player"}.`,
      };
    }
    if (insight.type === "key_moment") {
      return {
        title: analyst ? `${team} converts attacking phase (${minute})` : `GOAAAL ${team}! Struck by ${player}!`,
        description: analyst
          ? `${player} scores at ${minute}. Verified goal telemetry linked to on-target shot data (xG: ${evidence.xg || "0.68"}).`
          : `Sensational finish by ${player} at ${minute}! ${team} breaks through!`,
      };
    }
    if (insight.type === "pressure_window") {
      const followUp = [];
      if (counts.goal) followUp.push(`${counts.goal} goal`);
      if (counts.shot) followUp.push(`${counts.shot} shot(s)`);
      if (counts.corner) followUp.push(`${counts.corner} corner`);
      return {
        title: analyst ? `High-pressure window: ${team} (${start}-${end}')` : `${team} suffocates the opponent (${start}-${end}')`,
        description: analyst
          ? `${team} applied ${evidence.team_pressure} pressure moments vs ${evidence.opponent_pressure} by ${opponent}. Outcome: ${followUp.length ? followUp.join(", ") : "territorial control"}.`
          : `Relentless pressing from ${team} pinning ${opponent} deep! ${followUp.length ? `Resulting chances: ${followUp.join(", ")}.` : ""}`,
      };
    }
    if (insight.type === "pressure_turnover") {
      return {
        title: analyst ? `High turnover won: ${team}` : `${team} wins possession under pressure!`,
        description: analyst
          ? `${team} forced the turnover from ${evidence.team_under_pressure} at ${minute} (${evidence.turnover_reason || "pressing"}).`
          : `${team} robs ${evidence.team_under_pressure} of the ball and triggers an instant counter-attack!`,
      };
    }
    if (insight.type === "tactical_pattern") {
      return {
        title: analyst ? `Tactical Pattern: Pressing Dominance by ${team}` : `${team} hunting in packs with intense pressure!`,
        description: analyst
          ? `${team} registered superior pressing volume (${evidence.team_pressure} vs ${evidence.opponent_pressure} opponent actions).`
          : `Non-stop work rate from ${team}, suffocating the opposition and winning second balls!`,
      };
    }
    if (insight.type === "attacking_pattern") {
      return {
        title: analyst ? `High Shot Volume: ${team}` : `Shooting barrage by ${team}!`,
        description: analyst
          ? `${team} generated ${evidence.team_shots || "multiple"} total shots (${evidence.team_shots_on_target || "—"} on target).`
          : `${team} is relentless in the final third, peppering the target from every angle!`,
      };
    }
    if (insight.type === "finishing_pattern") {
      return {
        title: analyst ? `Clinical Finishing Efficiency: ${team}` : `${team} showing deadly accuracy in the box!`,
        description: analyst
          ? `${evidence.shots_on_target || 0} of ${evidence.shots || 0} attempts tested the goalkeeper (${evidence.on_target_rate || 50}% on target rate).`
          : `Razor-sharp precision from ${team}'s forwards, finding the target with ruthless efficiency!`,
      };
    }
    if (insight.type === "control_pattern") {
      return {
        title: analyst ? `Possession Dominance: ${team}` : `${team} orchestrating the tempo!`,
        description: analyst
          ? `Possession spells averaged ${evidence.average_duration || 3} minutes with ${evidence.passes_per_possession || 20} passes per sequence.`
          : `Fluid passing sequences and total match command from ${team}!`,
      };
    }
    if (insight.type === "match_state") {
      return {
        title: analyst ? "Tactical equilibrium on the pitch" : "Fierce toe-to-toe battle!",
        description: analyst
          ? "Balanced possession and shot distributions between both sides."
          : "An electric contest with neither side conceding an inch of ground!",
      };
    }
  }

  return { title: insight.title, description: insight.description };
}

function getStateLabel(state, t) {
  return {
    control: t.control,
    pressure: t.pressureState,
    chaos: t.chaos,
    clutch: t.clutch,
  }[state] || state;
}

function InsightIcon({ type }) {
  const imageByType = {
    key_moment: "/resources/knee-slide-celebration.png",
    shot_on_target: "/resources/shot-on-target.png",
    foul_event: "/resources/tackle.png",
    penalty_event: "/resources/soccer.png",
    card_event: "/resources/soccer-card.png",
    substitution_event: "/resources/substitution.png",
    pressure_window: "/resources/tackle.png",
    pressure_turnover: "/resources/tackle.png",
  };
  const image = imageByType[type] || "/resources/soccer.png";
  return (
    <div className="os-icon-box">
      <img src={image} alt="" />
    </div>
  );
}

function Pitch({
  teams,
  score,
  lineups,
  selectedTeam,
  selectedPlayer,
  onSelectPlayer,
  goalInsight,
  teamColors,
  ballEvent,
  activeInsight,
  matchState,
  recentShots,
  showShotMap,
  onToggleShotMap,
  eventsUntilNow = [],
  t,
}) {
  const formationPositions = [
    [7, 50],
    [21, 15], [20, 38], [20, 62], [21, 85],
    [35, 24], [33, 50], [35, 76],
    [46, 20], [47, 50], [46, 80],
  ];

  const teamNames = Object.keys(teams);
  const homeTeam = teamNames[0] || "Home";
  const awayTeam = teamNames[1] || "Away";

  const activeEvent = useMemo(() => {
    if (activeInsight?.evidence?.event_id) {
      const match = eventsUntilNow.find((e) => e.event_id === activeInsight.evidence.event_id);
      if (match) return match;
    }
    if (activeInsight?.id) {
      const match = eventsUntilNow.find((e) => e.event_id === activeInsight.id);
      if (match) return match;
    }
    return ballEvent;
  }, [activeInsight, eventsUntilNow, ballEvent]);

  const ballPosition = activeEvent?.position || ballEvent?.position || [50, 50];

  const prevEvent = useMemo(() => {
    if (!activeEvent) return null;
    const positioned = eventsUntilNow.filter((e) => Array.isArray(e.position));
    const idx = positioned.findIndex((e) => e.event_id === activeEvent.event_id);
    if (idx > 0) return positioned[idx - 1];
    return null;
  }, [activeEvent, eventsUntilNow]);

  const recentSequence = useMemo(() => {
    return eventsUntilNow.filter((e) => Array.isArray(e.position)).slice(-3);
  }, [eventsUntilNow]);

  const isShot = activeEvent?.type === "shot" || activeEvent?.type === "goal" || activeEvent?.type === "penalty";
  const isGoal = activeEvent?.type === "goal" || activeEvent?.outcome === "goal" || goalInsight !== null;
  const targetGoalX = activeEvent?.team === homeTeam ? 100 : activeEvent?.team === awayTeam ? 0 : (ballPosition[0] > 50 ? 100 : 0);
  const targetGoalY = 50;

  const activePlayerName =
    activeInsight?.evidence?.player ||
    activeInsight?.evidence?.fouled_by ||
    activeInsight?.evidence?.player_in ||
    activeEvent?.player ||
    ballEvent?.player;

  const playerDots = Object.entries(lineups).flatMap(([team, lineup]) => {
    const isHome = team === homeTeam;
    const players = lineup.map((entry) => ({
      ...(teams[team]?.[entry.player] || {}),
      ...entry,
      team,
    }));
    return players.map((player, index) => {
      const [baseX, baseY] = formationPositions[index] || formationPositions[formationPositions.length - 1];
      let x = isHome ? baseX : 100 - baseX;
      let y = baseY;

      const ballX = ballPosition[0];
      const tacticalShift = (ballX - 50) * 0.22;
      const roleWeight =
        player.role === "forward" ? 1.25 :
        player.role === "midfielder" ? 1.0 :
        player.role === "defender" ? 0.72 : 0.12;

      x = Math.max(3, Math.min(97, x + tacticalShift * roleWeight));

      const isProtagonist = player.player === activePlayerName;
      if (isProtagonist) {
        x = x * 0.15 + ballPosition[0] * 0.85;
        y = y * 0.15 + ballPosition[1] * 0.85;
      }

      return {
        ...player,
        x,
        y,
        isProtagonist,
        isSelected: player.player === selectedPlayer && player.team === selectedTeam,
        color: teamColors[team]?.primary || "#ccff00",
        textColor: teamColors[team]?.text || "#ffffff",
      };
    });
  });

  const protagonistDot = playerDots.find((p) => p.isProtagonist);
  const currentShotXg = activeEvent ? computeClientShotXg(activeEvent) : (ballEvent ? computeClientShotXg(ballEvent) : 0);

  const hasPrevVector =
    prevEvent?.position &&
    (Math.abs(prevEvent.position[0] - ballPosition[0]) > 2 || Math.abs(prevEvent.position[1] - ballPosition[1]) > 2);

  return (
    <div className="os-pitch-card">
      <div className="os-pitch-header">
        <div className="os-pitch-legend">
          <span>
            <i style={{ background: teamColors[homeTeam]?.primary }} />
            {homeTeam} ({t.attackRight || "Atacă →"})
          </span>
          <span>
            <i style={{ background: teamColors[awayTeam]?.primary }} />
            ({t.attackLeft || "← Atacă"}) {awayTeam}
          </span>
        </div>
        <div className="os-pitch-tools">
          {matchState?.state && (
            <span className={`os-state-chip state-${matchState.state}`}>
              {t.matchState}: {getStateLabel(matchState.state, t)}
            </span>
          )}
          <button
            type="button"
            className={`os-map-toggle ${showShotMap ? "active" : ""}`}
            onClick={onToggleShotMap}
          >
            🎯 {t.shotMapToggle}
          </button>
        </div>
      </div>

      <div className="os-pitch-canvas">
        <div className="pitch-grid-overlay" />
        <div className="halfway" />
        <div className="center-circle" />
        <div className="center-spot" />
        <div className="penalty-box left-box" />
        <div className="penalty-box right-box" />
        <div className="six-yard-box left-six" />
        <div className="six-yard-box right-six" />
        <div className="goal left-goal" />
        <div className="goal right-goal" />

        <div className="pitch-zone pitch-zone-left">DEFENSIVE THIRD</div>
        <div className="pitch-zone pitch-zone-center">CONTROL ZONE</div>
        <div className="pitch-zone pitch-zone-right">ATTACKING THIRD</div>

        <svg className="pitch-svg-overlay" viewBox="0 0 100 100" preserveAspectRatio="none">
          <defs>
            <filter id="glow-lime" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="0.8" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <filter id="glow-goal" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="1.2" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {hasPrevVector && (
            <g className="os-vector-build">
              <path
                d={`M ${prevEvent.position[0]} ${prevEvent.position[1]} Q ${(prevEvent.position[0] + ballPosition[0]) / 2} ${(prevEvent.position[1] + ballPosition[1]) / 2 - 3} ${ballPosition[0]} ${ballPosition[1]}`}
                fill="none"
                stroke="rgba(204, 255, 0, 0.75)"
                strokeWidth="0.6"
                strokeDasharray="2 1.2"
                filter="url(#glow-lime)"
              />
              <circle
                cx={prevEvent.position[0]}
                cy={prevEvent.position[1]}
                r="1.2"
                fill="rgba(204, 255, 0, 0.6)"
              />
            </g>
          )}

          {isShot && (
            <g className="os-vector-shot">
              <line
                x1={ballPosition[0]}
                y1={ballPosition[1]}
                x2={targetGoalX}
                y2={targetGoalY}
                stroke={isGoal ? "#ffd166" : "#ff2a5f"}
                strokeWidth={isGoal ? "0.95" : "0.7"}
                strokeDasharray="2.5 1.5"
                filter={isGoal ? "url(#glow-goal)" : "none"}
              />
              <circle
                cx={targetGoalX}
                cy={targetGoalY}
                r={isGoal ? "3.2" : "2.0"}
                fill="none"
                stroke={isGoal ? "#ffd166" : "#ff2a5f"}
                strokeWidth="0.5"
              />
            </g>
          )}

          {protagonistDot && (
            <line
              x1={protagonistDot.x}
              y1={protagonistDot.y}
              x2={ballPosition[0]}
              y2={ballPosition[1]}
              stroke="#ccff00"
              strokeWidth="0.45"
              strokeDasharray="1.2 0.8"
            />
          )}
        </svg>

        {showShotMap &&
          recentShots.map((shot) => {
            const xg = computeClientShotXg(shot);
            const size = Math.max(10, Math.round(xg * 34));
            const isGoalOutcome = shot.outcome === "goal" || shot.type === "goal";
            return (
              <div
                key={shot.event_id}
                className={`xg-shot-marker ${isGoalOutcome ? "is-goal" : ""}`}
                style={{
                  left: `${shot.position[0]}%`,
                  top: `${shot.position[1]}%`,
                  width: `${size}px`,
                  height: `${size}px`,
                  borderColor: teamColors[shot.team]?.primary || "#ccff00",
                }}
                title={`${shot.player} (${shot.team}) · ${xg} xG · ${shot.outcome || shot.type}`}
              />
            );
          })}

        <div
          className="os-ball-shadow"
          style={{ left: `${ballPosition[0]}%`, top: `${Math.min(98, ballPosition[1] + 1.6)}%` }}
        />

        <div
          key={activeEvent?.event_id || `${ballPosition[0]}-${ballPosition[1]}`}
          className={`os-ball-ripple ${isGoal ? "goal-ripple" : ""}`}
          style={{ left: `${ballPosition[0]}%`, top: `${ballPosition[1]}%` }}
        />

        <div
          className={`os-ball ${isShot ? "ball-in-flight" : ""}`}
          style={{ left: `${ballPosition[0]}%`, top: `${ballPosition[1]}%` }}
          title={activeEvent ? `${activeEvent.player} · ${activeEvent.type} [${ballPosition[0]}, ${ballPosition[1]}]` : "Ball"}
        >
          <span className="os-ball-pattern" />
        </div>

        {activeEvent && (
          <div
            className="os-ball-action-tag"
            style={{ left: `${ballPosition[0]}%`, top: `${Math.max(6, ballPosition[1] - 5.5)}%` }}
          >
            <b>{activeEvent.player || activeEvent.team}</b>
            <span>{activeEvent.type}</span>
          </div>
        )}

        {playerDots.map((player) => (
          <button
            type="button"
            key={`${player.team}-${player.player}`}
            className={`os-player-node ${player.isProtagonist ? "protagonist" : ""} ${player.isSelected ? "selected" : ""}`}
            style={{
              left: `${player.x}%`,
              top: `${player.y}%`,
              background: player.color,
              color: player.textColor,
            }}
            onClick={() => onSelectPlayer(player.team, player.player)}
          >
            <span>{player.shirt_number || "—"}</span>
            {(player.isProtagonist || player.isSelected) && (
              <em className="os-player-label">{player.player}</em>
            )}
          </button>
        ))}


        {goalInsight && (
          <div className="os-goal-fx">
            <div className="os-goal-card">
              <span className="os-goal-kicker">⚽ GOAL CONFIRMED // TELEMETRY VERIFIED</span>
              <strong>{goalInsight.title}</strong>
              <small>{goalInsight.match_time} · {goalInsight.evidence?.player}</small>
            </div>
          </div>
        )}
      </div>

      <div className="os-pitch-subbar">
        <div className="os-subbar-coords">
          <span>📍 {t.ballCoords || "Coordonate minge"}: [{ballPosition[0]}, {ballPosition[1]}]</span>
          <span>💡 {t.clickPlayerHint}</span>
        </div>
        {recentSequence.length > 0 && (
          <div className="os-subbar-sequence">
            <small>{t.playSequence || "Succesiune"}:</small>
            {recentSequence.map((e, idx) => (
              <span key={e.event_id || idx} className={`os-seq-pill ${e.event_id === activeEvent?.event_id ? "active" : ""}`}>
                {e.player || e.team} <i>({e.type})</i>
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function TelemetryComparison({ stats, teams, teamColors, shotXgByTeam, t }) {
  const [home, away] = teams;
  if (!home || !away || !stats?.[home] || !stats?.[away]) return null;
  const h = stats[home];
  const a = stats[away];

  const homeXg = h.xg !== undefined ? h.xg : shotXgByTeam[home] || 0;
  const awayXg = a.xg !== undefined ? a.xg : shotXgByTeam[away] || 0;

  const metrics = [
    { label: t.xg, left: Number(homeXg).toFixed(2), right: Number(awayXg).toFixed(2), rawL: Number(homeXg), rawR: Number(awayXg) },
    { label: t.possession, left: `${h.possession}%`, right: `${a.possession}%`, rawL: h.possession, rawR: a.possession },
    { label: t.shots, left: h.shots, right: a.shots, rawL: h.shots, rawR: a.shots },
    { label: t.shotsOnTarget, left: h.shots_on_target, right: a.shots_on_target, rawL: h.shots_on_target, rawR: a.shots_on_target },
    { label: t.passes, left: h.passes, right: a.passes, rawL: h.passes, rawR: a.passes },
    { label: t.passAccuracy, left: `${h.pass_accuracy}%`, right: `${a.pass_accuracy}%`, rawL: h.pass_accuracy, rawR: a.pass_accuracy },
    { label: t.pressure, left: h.pressure, right: a.pressure, rawL: h.pressure, rawR: a.pressure },
    { label: t.corners, left: h.corners, right: a.corners, rawL: h.corners, rawR: a.corners },
  ];

  const hColor = teamColors[home]?.primary || "#ff2a5f";
  const aColor = teamColors[away]?.primary || "#00f5d4";

  return (
    <section className="os-panel">
      <div className="os-panel-header">
        <h2>{t.headToHead}</h2>
        <div className="os-h2h-badges">
          <span style={{ color: hColor }}>{home}</span>
          <i>vs</i>
          <span style={{ color: aColor }}>{away}</span>
        </div>
      </div>
      <div className="os-h2h-list">
        {metrics.map((m) => {
          const total = (m.rawL || 0) + (m.rawR || 0);
          const lPct = total > 0 ? Math.round((m.rawL / total) * 100) : 50;
          const rPct = 100 - lPct;
          return (
            <div className="os-h2h-item" key={m.label}>
              <div className="os-h2h-numbers">
                <b style={{ color: hColor }}>{m.left}</b>
                <span>{m.label}</span>
                <b style={{ color: aColor }}>{m.right}</b>
              </div>
              <div className="os-h2h-bar">
                <div style={{ width: `${lPct}%`, background: hColor }} />
                <div style={{ width: `${rPct}%`, background: aColor }} />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function PlayerDossier({ player, teamColor, playerXg, t }) {
  if (!player) return null;
  const rating = Math.min(
    99,
    68 + player.goals * 8 + Math.round(player.pass_accuracy / 8) + Math.min(6, player.shots_on_target * 2),
  );
  const xgVal = player.xg !== undefined ? player.xg : playerXg;

  return (
    <section className="os-panel os-player-dossier" style={{ "--team-accent": teamColor }}>
      <div className="os-dossier-top">
        <div className="os-ovr-box">
          <strong>{rating}</strong>
          <span>OVR</span>
        </div>
        <div className="os-dossier-id">
          <span className="os-role-tag">{player.role?.toUpperCase()} // #{player.shirt_number || "—"}</span>
          <h3>{player.player}</h3>
          <small>{player.team}</small>
        </div>
      </div>
      <div className="os-dossier-grid">
        <div><span>{t.goals}</span><b>{player.goals}</b></div>
        <div><span>xG</span><b>{Number(xgVal || 0).toFixed(2)}</b></div>
        <div><span>{t.shots}</span><b>{player.shots} ({player.shots_on_target})</b></div>
        <div><span>{t.passes}</span><b>{player.passes}</b></div>
        <div><span>{t.passAccuracy}</span><b>{player.pass_accuracy}%</b></div>
        <div><span>{t.pressure}</span><b>{player.pressure_events}</b></div>
      </div>
    </section>
  );
}

function EvidenceGrid({ evidence, t }) {
  const labels = {
    team_pressure: "Presiune Echipă",
    opponent_pressure: "Presiune Adversar",
    turnover_reason: "Cauză Recuperare",
    speed_kmh: "Viteză Șut (km/h)",
    outcome: "Rezultat",
    player: "Jucător",
    fouled_player: "Jucător Faultat",
    player_in: "Intrat",
    player_out: "Ieșit",
    reason: "Motiv",
    shots: "Șuturi",
    shots_on_target: "Pe Poartă",
    xg: "Valoare xG",
  };
  const entries = Object.entries(evidence || {}).filter(
    ([key, value]) => typeof value !== "object" && value !== null && labels[key],
  );
  if (!entries.length) return null;

  return (
    <div className="os-evidence-block">
      <span className="os-kicker">🛡️ {t.keyEvidence}</span>
      <div className="os-evidence-cells">
        {entries.slice(0, 6).map(([key, value]) => (
          <div key={key} className="os-evidence-cell">
            <small>{t.evidenceLabels?.[key] || labels[key] || key}</small>
            <strong>{String(value)}</strong>
          </div>
        ))}
      </div>
    </div>
  );
}

function App() {
  const [payload, setPayload] = useState(null);
  const [mode, setMode] = useState("analyst");
  const [language, setLanguage] = useState("ro");
  const [selectedTeam, setSelectedTeam] = useState("");
  const [selectedPlayer, setSelectedPlayer] = useState("");
  const [selectedInsightId, setSelectedInsightId] = useState(null);
  const [maxRevealedIndex, setMaxRevealedIndex] = useState(0);
  const [error, setError] = useState(false);
  const [recap, setRecap] = useState("");
  const [recapLoading, setRecapLoading] = useState(false);
  const [recapError, setRecapError] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [showShotMap, setShowShotMap] = useState(true);
  const [overlayQueue, setOverlayQueue] = useState([]);
  const [simHome, setSimHome] = useState("Arsenal");
  const [simAway, setSimAway] = useState("Liverpool");
  const [simulating, setSimulating] = useState(false);

  const insightListRef = useRef(null);
  const t = translations[language];

  useEffect(() => {
    fetch(`${API_URL}/api/match`)
      .then((res) => {
        if (!res.ok) throw new Error("Match failed");
        return res.json();
      })
      .then((data) => {
        setPayload(data);
        setSelectedTeam(data.match.home_team);
        setSimHome(data.match.home_team);
        setSimAway(data.match.away_team);
        setMaxRevealedIndex(0);
        if (data.insights?.length) {
          setSelectedInsightId(data.insights[0].id);
        }
      })
      .catch(() => setError(true));
  }, []);

  const teams = payload?.player_stats || {};
  const teamNames = Object.keys(teams);
  const players = selectedTeam ? Object.values(teams[selectedTeam] || {}) : [];

  const localizedInsights = useMemo(
    () =>
      (payload?.insights || [])
        .map((insight) => ({
          ...insight,
          ...localizeInsight(insight, language, mode),
        }))
        .sort((a, b) => {
          const tA = a.timestamp == null ? Number.POSITIVE_INFINITY : a.timestamp;
          const tB = b.timestamp == null ? Number.POSITIVE_INFINITY : b.timestamp;
          return tA - tB;
        }),
    [payload, language, mode],
  );

  const playbackInsights = useMemo(() => {
    const moments = localizedInsights.filter((i) => i.match_time);
    const summaries = localizedInsights.filter((i) => !i.match_time);
    return [...moments, ...summaries];
  }, [localizedInsights]);

  const revealedInsights = useMemo(() => {
    if (!playbackInsights.length) return [];
    const limit = Math.min(playbackInsights.length, maxRevealedIndex + 1);
    return playbackInsights.slice(0, limit);
  }, [playbackInsights, maxRevealedIndex]);

  const displayedInsight =
    revealedInsights.find((i) => i.id === selectedInsightId) ||
    revealedInsights[revealedInsights.length - 1];

  const isMatchFinished =
    playbackInsights.length > 0 &&
    maxRevealedIndex >= playbackInsights.length - 1;

  const visibleTimeline = useMemo(() => {
    if (isMatchFinished) return payload?.timeline || [];
    const maxInsight = playbackInsights[maxRevealedIndex];
    const maxTime = maxInsight?.timestamp ?? 0;
    return (payload?.timeline || []).filter((s) => s.timestamp <= maxTime);
  }, [payload, playbackInsights, maxRevealedIndex, isMatchFinished]);

  const currentSnapshot = useMemo(() => {
    const timeline = payload?.timeline || [];
    if (!payload) return { score: {}, stats: {}, player_stats: {}, lineups: {}, state: null };
    const fullTimeSnapshot = timeline.length
      ? timeline[timeline.length - 1]
      : {
          score: payload.match.score,
          stats: payload.stats,
          player_stats: payload.player_stats,
          lineups: payload.match.lineups,
          state: payload.match_state || null,
        };

    if (displayedInsight?.timestamp == null) {
      return fullTimeSnapshot;
    }
    return timeline.reduce(
      (curr, snap) => (snap.timestamp <= displayedInsight.timestamp ? snap : curr),
      timeline[0] || fullTimeSnapshot,
    );
  }, [payload, displayedInsight]);

  const clock = displayedInsight?.timestamp ?? 90;

  const eventsUntilNow = useMemo(
    () =>
      [...(payload?.match.events || [])]
        .sort((a, b) => a.timestamp - b.timestamp)
        .filter((e) => e.timestamp <= clock),
    [payload, clock],
  );

  const recentShots = useMemo(
    () => eventsUntilNow.filter((e) => e.type === "shot" && Array.isArray(e.position)),
    [eventsUntilNow],
  );

  const shotXgByTeam = useMemo(() => {
    const acc = {};
    for (const e of eventsUntilNow) {
      if (e.type === "shot" || e.type === "penalty") {
        acc[e.team] = (acc[e.team] || 0) + computeClientShotXg(e);
      }
    }
    return acc;
  }, [eventsUntilNow]);

  const activePlayerXg = useMemo(() => {
    return eventsUntilNow
      .filter((e) => e.player === selectedPlayer && (e.type === "shot" || e.type === "penalty"))
      .reduce((sum, e) => sum + computeClientShotXg(e), 0);
  }, [eventsUntilNow, selectedPlayer]);

  const ballEvent = useMemo(
    () => eventsUntilNow.filter((e) => Array.isArray(e.position)).at(-1) || null,
    [eventsUntilNow],
  );

  const currentTeams = currentSnapshot.player_stats || teams;
  const activePlayer =
    currentTeams[selectedTeam]?.[selectedPlayer] ||
    players.find((p) => p.player === selectedPlayer);
  const goalInsight = displayedInsight?.type === "key_moment" ? displayedInsight : null;

  const advanceInsight = () => {
    setSelectedInsightId((currentId) => {
      if (!currentId) {
        setMaxRevealedIndex(0);
        return playbackInsights[0]?.id || null;
      }
      const idx = playbackInsights.findIndex((i) => i.id === currentId);
      const nextIdx = idx + 1;
      if (nextIdx >= playbackInsights.length) {
        setIsPlaying(false);
        setMaxRevealedIndex(playbackInsights.length - 1);
        return playbackInsights[playbackInsights.length - 1].id;
      }
      setMaxRevealedIndex((prev) => Math.max(prev, nextIdx));
      return playbackInsights[nextIdx].id;
    });
  };

  useEffect(() => {
    if (!displayedInsight) return undefined;
    const commentaryText = `${displayedInsight.title}. ${displayedInsight.description}`;
    const isVoiceActive = voiceEnabled && playbackSpeed === 1;

    if (!isPlaying) {
      if (isVoiceActive) {
        speakCommentary(commentaryText, language, true);
      }
      return undefined;
    }

    let timerId = null;
    let didAdvance = false;

    const triggerNext = (delayMs) => {
      if (didAdvance) return;
      timerId = window.setTimeout(() => {
        if (!didAdvance) {
          didAdvance = true;
          advanceInsight();
        }
      }, delayMs);
    };

    if (isVoiceActive) {
      speakCommentary(commentaryText, language, true, () => {
        triggerNext(1800);
      });

      const maxEstimatedMs = Math.max(7500, commentaryText.length * 85);
      const safetyTimer = window.setTimeout(() => {
        triggerNext(0);
      }, maxEstimatedMs);

      return () => {
        didAdvance = true;
        if (timerId) window.clearTimeout(timerId);
        window.clearTimeout(safetyTimer);
      };
    } else {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
      const readingDelay = Math.round(3600 / playbackSpeed);
      triggerNext(readingDelay);

      return () => {
        didAdvance = true;
        if (timerId) window.clearTimeout(timerId);
      };
    }
  }, [displayedInsight?.id, isPlaying, voiceEnabled, language, playbackSpeed]);

  useEffect(() => {
    if (!insightListRef.current || !displayedInsight?.id) return;
    const list = insightListRef.current;
    const item = list.querySelector(`[data-insight-id="${displayedInsight.id}"]`);
    if (item && list.scrollHeight > list.clientHeight) {
      list.scrollTo({ top: Math.max(0, item.offsetTop - list.offsetTop - 16), behavior: "smooth" });
    }
  }, [displayedInsight?.id]);

  useEffect(() => {
    if (players.length && !players.some((p) => p.player === selectedPlayer)) {
      setSelectedPlayer(players[0].player);
    }
  }, [selectedTeam, players, selectedPlayer]);

  const generateRecap = () => {
    setRecapLoading(true);
    setRecapError(false);
    const recapMode = mode === "director" ? "fan" : mode;
    fetch(`${API_URL}/api/recap?mode=${recapMode}&language=${language}`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed");
        return res.json();
      })
      .then((data) => {
        setRecap(data.text || "");
        if (voiceEnabled && data.text) speakCommentary(data.text, language, true);
      })
      .catch(() => {
        setRecap("");
        setRecapError(true);
      })
      .finally(() => setRecapLoading(false));
  };

  const simulateNewMatch = () => {
    if (simHome === simAway) return;
    setSimulating(true);
    setIsPlaying(false);
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    fetch(
      `${API_URL}/api/match/generate?home_team=${encodeURIComponent(simHome)}&away_team=${encodeURIComponent(simAway)}`,
      { method: "POST" },
    )
      .then((res) => {
        if (!res.ok) throw new Error("Failed");
        return res.json();
      })
      .then((data) => {
        setPayload(data);
        setSelectedTeam(data.match.home_team);
        setRecap("");
        setMaxRevealedIndex(0);
        if (data.insights?.length) setSelectedInsightId(data.insights[0].id);
      })
      .catch(() => {})
      .finally(() => setSimulating(false));
  };

  const selectInsight = (id) => {
    setIsPlaying(false);
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    setSelectedInsightId(id);
  };

  const currentIdx = playbackInsights.findIndex((i) => i.id === selectedInsightId);
  const canStepBackward = currentIdx > 0;
  const canStepForward =
    currentIdx >= 0 &&
    currentIdx < maxRevealedIndex &&
    currentIdx < playbackInsights.length - 1;

  const togglePlay = () => {
    if (!playbackInsights.length) return;
    if (isPlaying) {
      setIsPlaying(false);
      return;
    }
    if (
      !selectedInsightId ||
      (maxRevealedIndex >= playbackInsights.length - 1 && currentIdx >= playbackInsights.length - 1)
    ) {
      setMaxRevealedIndex(0);
      setSelectedInsightId(playbackInsights[0].id);
    }
    setIsPlaying(true);
  };

  const stepBackward = () => {
    if (!canStepBackward) return;
    selectInsight(playbackInsights[currentIdx - 1].id);
  };

  const stepForward = () => {
    if (!canStepForward) return;
    selectInsight(playbackInsights[currentIdx + 1].id);
  };

  const restartMatch = () => {
    if (!playbackInsights.length) return;
    setIsPlaying(false);
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    setMaxRevealedIndex(0);
    setSelectedInsightId(playbackInsights[0].id);
    setRecap("");
  };

  const handleSetSpeed = (spd) => {
    if (spd > 1 && typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    setPlaybackSpeed(spd);
  };

  if (!payload) {
    return (
      <main className="os-shell os-centered">
        <p>{error ? t.error : t.loading}</p>
      </main>
    );
  }

  const homeTeam = payload.match.home_team;
  const awayTeam = payload.match.away_team;
  const homeColor = TEAM_COLORS[homeTeam]?.primary || "#ff2a5f";
  const awayColor = TEAM_COLORS[awayTeam]?.primary || "#00f5d4";
  const progressPct = Math.min(
    100,
    Math.max(0, (((displayedInsight?.timestamp ?? (isMatchFinished ? 90 : 0)) || 0) / 90) * 100),
  );

  return (
    <main className="os-shell">
      {/* COMPACT UNIFIED COCKPIT HEADER */}
      <header className="os-header">
        <div className="os-brand">
          <div className="os-logo">90'</div>
          <div>
            <h1>{t.studio}</h1>
          </div>
        </div>

        {/* INTEGRATED LIVE SCOREBUG */}
        <div className="os-scorebug">
          <div className="os-team-side home">
            <span className="os-team-name">{homeTeam}</span>
            <i className="os-team-bar" style={{ background: homeColor }} />
          </div>
          <div className="os-score-digits">
            <b>{currentSnapshot.score?.[homeTeam] ?? 0}</b>
            <span>:</span>
            <b>{currentSnapshot.score?.[awayTeam] ?? 0}</b>
          </div>
          <div className="os-team-side away">
            <i className="os-team-bar" style={{ background: awayColor }} />
            <span className="os-team-name">{awayTeam}</span>
          </div>
          <time className="os-clock">{displayedInsight?.match_time || (isMatchFinished ? "FT 90'" : "00:00")}</time>
        </div>

        {/* MODE & VOICE CONTROLS */}
        <div className="os-header-controls">
          <div className="os-mode-Tabs">
            <button className={mode === "fan" ? "active" : ""} onClick={() => setMode("fan")}>{t.fan}</button>
            <button className={mode === "analyst" ? "active" : ""} onClick={() => setMode("analyst")}>{t.analyst}</button>
            <button className={mode === "director" ? "active" : ""} onClick={() => setMode("director")}>{t.director}</button>
          </div>
          <button
            type="button"
            className={`os-btn-voice ${voiceEnabled ? "on" : ""} ${voiceEnabled && playbackSpeed > 1 ? "muted-speed" : ""}`}
            onClick={() => {
              const next = !voiceEnabled;
              setVoiceEnabled(next);
              if (!next && typeof window !== "undefined" && "speechSynthesis" in window) {
                window.speechSynthesis.cancel();
              }
            }}
            title={
              voiceEnabled && playbackSpeed > 1
                ? t.voiceSpeedNotice
                : voiceEnabled
                ? t.voiceOn
                : t.voiceOff
            }
          >
            {voiceEnabled
              ? playbackSpeed > 1
                ? `🔇 ${t.voiceMutedSpeed}`
                : `🔊 ${t.voiceOn}`
              : `🔇 ${t.voiceOff}`}
          </button>
          <select
            value={language}
            onChange={(e) => {
              const newLang = e.target.value;
              if (typeof window !== "undefined" && "speechSynthesis" in window) {
                window.speechSynthesis.cancel();
              }
              setRecap("");
              setLanguage(newLang);
            }}
          >
            <option value="ro">RO</option>
            <option value="it">IT</option>
            <option value="en">EN</option>
          </select>
        </div>
      </header>

      {/* 3-COLUMN WIDESCREEN TACTICAL COCKPIT */}
      <div className="os-cockpit-grid">
        {/* LEFT COLUMN: TELEMETRY H2H + PLAYER DOSSIER + SIMULATOR */}
        <aside className="os-col-left">
          <TelemetryComparison
            stats={currentSnapshot.stats}
            teams={teamNames}
            teamColors={TEAM_COLORS}
            shotXgByTeam={shotXgByTeam}
            t={t}
          />

          <div className="os-panel os-selector-strip">
            <label>
              <span>{t.favoriteTeam}</span>
              <select value={selectedTeam} onChange={(e) => setSelectedTeam(e.target.value)}>
                {teamNames.map((team) => <option key={team}>{team}</option>)}
              </select>
            </label>
            <label>
              <span>{t.favoritePlayer}</span>
              <select value={selectedPlayer} onChange={(e) => setSelectedPlayer(e.target.value)}>
                {players.map((p) => <option key={p.player}>{p.player}</option>)}
              </select>
            </label>
          </div>

          <PlayerDossier
            player={activePlayer}
            teamColor={TEAM_COLORS[selectedTeam]?.primary || "#ccff00"}
            playerXg={activePlayerXg}
            t={t}
          />

          <section className="os-panel os-sim-box">
            <span className="os-kicker">⚡ {t.simKicker || "GENERATOR MECI SINTETIC"}</span>
            <div className="os-sim-row">
              <select value={simHome} onChange={(e) => setSimHome(e.target.value)}>
                {ALL_TEAMS.map((team) => <option key={team} value={team}>{team}</option>)}
              </select>
              <span>vs</span>
              <select value={simAway} onChange={(e) => setSimAway(e.target.value)}>
                {ALL_TEAMS.map((team) => <option key={team} value={team}>{team}</option>)}
              </select>
            </div>
            <button
              className="os-btn-sim"
              onClick={simulateNewMatch}
              disabled={simulating || simHome === simAway}
            >
              {simulating ? t.generatingMatch : t.newMatch}
            </button>
          </section>
        </aside>

        {/* CENTER COLUMN: INTERACTIVE 2D PITCH + PLAYBACK DECK + AZURE OPENAI RECAP */}
        <section className="os-col-center">
          <Pitch
            teams={currentTeams}
            score={currentSnapshot.score}
            lineups={currentSnapshot.lineups}
            selectedTeam={selectedTeam}
            selectedPlayer={selectedPlayer}
            onSelectPlayer={(team, player) => {
              setSelectedTeam(team);
              setSelectedPlayer(player);
            }}
            goalInsight={goalInsight}
            teamColors={TEAM_COLORS}
            ballEvent={ballEvent}
            activeInsight={displayedInsight}
            matchState={currentSnapshot.state}
            recentShots={recentShots}
            showShotMap={showShotMap}
            onToggleShotMap={() => setShowShotMap((s) => !s)}
            eventsUntilNow={eventsUntilNow}
            t={t}
          />

          {/* INTEGRATED TRANSPORT & TIMELINE DECK */}
          <div className="os-transport-deck">
            <div className="os-transport-buttons">
              <button className={`os-btn-play ${isPlaying ? "playing" : ""}`} onClick={togglePlay}>
                {isPlaying ? `⏸ ${t.pause}` : `▶ ${t.start}`}
              </button>
              <button
                className="os-btn-secondary"
                onClick={stepBackward}
                disabled={!canStepBackward}
                title={!canStepBackward ? t.stepBackwardLocked : t.stepBackward}
              >
                ⏮ {t.stepBackward}
              </button>
              <button
                className="os-btn-secondary"
                onClick={stepForward}
                disabled={!canStepForward}
                title={!canStepForward ? t.stepForwardLocked : t.stepForward}
              >
                {t.stepForward} ⏭
              </button>
              <button className="os-btn-secondary" onClick={restartMatch}>↺ {t.restart}</button>
              <div className="os-speed-group">
                {[1, 2, 4].map((spd) => (
                  <button
                    key={spd}
                    className={playbackSpeed === spd ? "active" : ""}
                    onClick={() => handleSetSpeed(spd)}
                  >
                    {spd}x
                  </button>
                ))}
              </div>
            </div>

            <div className="os-scrubber">
              <span>0'</span>
              <div className="os-scrubber-track" style={{ "--prog": `${progressPct}%` }}>
                <div className="os-scrubber-fill" />
                {(visibleTimeline || []).map((snap) => {
                  const matchIns = revealedInsights.find((i) => i.timestamp === snap.timestamp);
                  const st = snap.state?.state || "control";
                  return (
                    <button
                      key={`${snap.timestamp}-${st}`}
                      className={`os-scrubber-node state-${st} ${matchIns?.id === selectedInsightId ? "active" : ""}`}
                      style={{ left: `${Math.min(100, Math.max(0, (snap.timestamp / 90) * 100))}%` }}
                      onClick={() => matchIns && selectInsight(matchIns.id)}
                      title={`${snap.timestamp.toFixed(1)}' · ${matchIns?.title || st}`}
                    />
                  );
                })}
              </div>
              <span>45'</span>
              <span>90'</span>
            </div>
          </div>

          {/* AZURE OPENAI RECAP DOCK */}
          <section className="os-panel os-recap-dock">
            <div className="os-recap-top">
              <div>
                <span className="os-kicker">✨ MICROSOFT AZURE OPENAI // {mode.toUpperCase()} NARRATOR</span>
                <h2>{t.recapTitle}</h2>
                <p>{t.recapHint}</p>
              </div>
              <div className="os-recap-actions">
                <button
                  className={`os-btn-accent ${!isMatchFinished ? "is-locked" : ""}`}
                  onClick={generateRecap}
                  disabled={recapLoading || !isMatchFinished}
                  title={!isMatchFinished ? t.recapLockedHint : ""}
                >
                  {!isMatchFinished
                    ? `🔒 ${t.recapLocked}`
                    : recapLoading
                    ? t.recapLoading
                    : t.generateRecap}
                </button>
                {recap && (
                  <button
                    className="os-btn-secondary"
                    onClick={() => speakCommentary(recap, language, true)}
                  >
                    🔊 {t.speakNow}
                  </button>
                )}
              </div>
            </div>
            {recapError && <p className="os-error-text">{t.recapUnavailable}</p>}
            {recap && <blockquote className="os-recap-output">{recap}</blockquote>}
          </section>
        </section>

        {/* RIGHT COLUMN: AI COMMENTATOR BOOTH & EVIDENCE FEED */}
        <aside className="os-col-right">
          {displayedInsight ? (
            <section className="os-panel os-active-commentary">
              <div className="os-comm-header">
                <InsightIcon type={displayedInsight.type} />
                <div className="os-comm-title-wrap">
                  <div className="os-comm-badges">
                    <span className="os-badge-lime">{displayedInsight.match_time || "FT"}</span>
                    <span className="os-badge-dark">{displayedInsight.type.replaceAll("_", " ")}</span>
                    <button
                      type="button"
                      className="os-mini-audio"
                      onClick={() =>
                        speakCommentary(`${displayedInsight.title}. ${displayedInsight.description}`, language, true)
                      }
                    >
                      🔊 {t.speakNow}
                    </button>
                  </div>
                  <h3>{displayedInsight.title}</h3>
                </div>
              </div>
              <p className="os-comm-desc">{displayedInsight.description}</p>
              <EvidenceGrid evidence={displayedInsight.evidence} t={t} />
            </section>
          ) : (
            <section className="os-panel os-active-commentary">
              <p>{t.noEvents}</p>
            </section>
          )}

          {mode === "director" && (
            <section className="os-panel os-director-box">
              <div className="os-panel-header">
                <h2>{t.directorTitle}</h2>
                <span className="os-badge-onair">{t.onAir} ({overlayQueue.length})</span>
              </div>
              <p className="os-subtext">{t.directorSubtitle}</p>
              <div className="os-director-queue">
                {revealedInsights.filter((i) => i.match_time).slice(-4).map((ins) => (
                  <div key={ins.id} className="os-dir-row">
                    <span>{ins.match_time} · {ins.title}</span>
                    <button
                      onClick={() =>
                        setOverlayQueue((q) =>
                          q.includes(ins.id) ? q.filter((id) => id !== ins.id) : [...q, ins.id],
                        )
                      }
                    >
                      {overlayQueue.includes(ins.id) ? t.removeOverlay : t.addOverlay}
                    </button>
                  </div>
                ))}
              </div>
            </section>
          )}

          <section className="os-panel os-feed-container">
            <div className="os-panel-header">
              <h2>{t.insights}</h2>
              <span className="os-count-tag">
                {revealedInsights.length} / {playbackInsights.length} {t.insightCount}
              </span>
            </div>
            <div className="os-feed-scroll" ref={insightListRef}>
              {revealedInsights.map((insight) => (
                <button
                  key={insight.id}
                  data-insight-id={insight.id}
                  className={`os-feed-card ${displayedInsight?.id === insight.id ? "active" : ""}`}
                  onClick={() => {
                    selectInsight(insight.id);
                  }}
                >
                  <InsightIcon type={insight.type} />
                  <div className="os-feed-card-body">
                    <div className="os-feed-card-meta">
                      <time>{insight.match_time || "FT"}</time>
                      {insight.team && <span>{insight.team}</span>}
                    </div>
                    <strong>{insight.title}</strong>
                  </div>
                </button>
              ))}
            </div>
          </section>
        </aside>
      </div>
    </main>
  );
}

createRoot(document.getElementById("root")).render(<App />);