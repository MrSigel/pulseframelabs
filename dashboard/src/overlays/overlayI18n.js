const strings = {
  en: {
    // General
    waiting: 'Waiting', drawing: 'Drawing...', live: 'Live', finished: 'Finished',
    joining: 'Joining Open', champion: 'Champion', winner: 'Winner', vs: 'VS',
    noSession: 'No session found', noTournament: 'No tournament found',
    noBossfight: 'No boss fight found', noWager: 'No wager session found',

    // Bonushunt
    totalWin: 'Total Win', requiredX: 'Required X', profit: 'Profit',
    games: 'Games', start: 'Start', totalBuyIn: 'Total Buy-In',
    startBalance: 'Start Balance', enterWin: 'Enter win',
    bonushunt: 'Bonushunt', multiplier: 'Multiplier',
    buyIn: 'Buy-In', win: 'Win', game: 'Game',

    // Tournament
    playerName: 'Player Name', gameName: 'Game', tournamentWinner: 'Tournament Winner',
    enterAmounts: 'Enter Amounts', determineWinner: 'Determine Winner',
    tie: 'Tie — enter new amounts', wins: 'wins!',
    player: 'Player', round: 'Round',

    // Boss Fight
    bossFight: 'BOSS FIGHT', challenger: 'Challenger', boss: 'Boss',
    bossLives: 'Boss Lives', challengers: 'Challengers',
    bossWins: 'BOSS WINS!', playersWin: 'PLAYERS WIN!',
    players: 'Players', score: 'Score',

    // Wager
    deposit: 'Deposit', bonus: 'Bonus', wager: 'Wager',
    wagered: 'Wagered', remaining: 'Remaining',
    casinoName: 'Casino Name', headerText: 'Header Text',

    // Predictions
    guessingGame: 'Guessing Game', predictionWall: 'Prediction Wall',
    optionA: 'Option A', optionB: 'Option B',
    votes: 'votes', guesses: 'guesses', target: 'Target',
    closestWin: 'Closest guess wins!',

    // Chat
    chatOverlay: 'Chat', moderator: 'MOD', subscriber: 'SUB', viewer: 'VWR',

    // Slot Requests
    slotRequests: 'Slot Requests', pending: 'Pending',
    selected: 'Selected', noRequests: 'No requests',

    // Hotwords
    hotWords: 'Hot Words', mentions: 'mentions',

    // Personal Bests
    personalBests: 'Personal Bests', appearances: 'appearances',
    bestWin: 'Best Win',

    // Join
    joinRaffle: 'Join Raffle', participants: 'Participants',
    drawWinner: 'Draw Winner',

    // Bot
    twitchBot: 'Twitch Bot', online: 'online', commands: 'Commands',
    features: 'Features', botActivity: 'Bot Activity',
    waitingActivity: 'Waiting for activity…',
  },

  de: {
    waiting: 'Warten', drawing: 'Ziehen...', live: 'Live', finished: 'Beendet',
    joining: 'Beitritt offen', champion: 'Champion', winner: 'Gewinner', vs: 'VS',
    noSession: 'Keine Sitzung gefunden', noTournament: 'Kein Turnier gefunden',
    noBossfight: 'Kein Boss Fight gefunden', noWager: 'Keine Wager-Sitzung gefunden',

    totalWin: 'Gesamtgewinn', requiredX: 'Benötigter X', profit: 'Gewinn',
    games: 'Spiele', start: 'Start', totalBuyIn: 'Gesamteinsatz',
    startBalance: 'Startguthaben', enterWin: 'Gewinn eingeben',
    bonushunt: 'Bonusjagd', multiplier: 'Multiplikator',
    buyIn: 'Einsatz', win: 'Gewinn', game: 'Spiel',

    playerName: 'Spielername', gameName: 'Spiel', tournamentWinner: 'Turniergewinner',
    enterAmounts: 'Beträge eingeben', determineWinner: 'Gewinner ermitteln',
    tie: 'Gleichstand — neue Beträge eingeben', wins: 'gewinnt!',
    player: 'Spieler', round: 'Runde',

    bossFight: 'BOSS FIGHT', challenger: 'Herausforderer', boss: 'Boss',
    bossLives: 'Boss-Leben', challengers: 'Herausforderer',
    bossWins: 'BOSS GEWINNT!', playersWin: 'SPIELER GEWINNEN!',
    players: 'Spieler', score: 'Punktestand',

    deposit: 'Einzahlung', bonus: 'Bonus', wager: 'Wager',
    wagered: 'Gewettet', remaining: 'Verbleibend',
    casinoName: 'Casino-Name', headerText: 'Überschrift',

    guessingGame: 'Ratespiel', predictionWall: 'Vorhersage-Wand',
    optionA: 'Option A', optionB: 'Option B',
    votes: 'Stimmen', guesses: 'Tipps', target: 'Zielwert',
    closestWin: 'Nächster Tipp gewinnt!',

    chatOverlay: 'Chat', moderator: 'MOD', subscriber: 'SUB', viewer: 'ZSR',

    slotRequests: 'Slot-Anfragen', pending: 'Offen',
    selected: 'Ausgewählt', noRequests: 'Keine Anfragen',

    hotWords: 'Hot Words', mentions: 'Erwähnungen',

    personalBests: 'Bestleistungen', appearances: 'Auftritte',
    bestWin: 'Bester Gewinn',

    joinRaffle: 'Verlosung', participants: 'Teilnehmer',
    drawWinner: 'Gewinner ziehen',

    twitchBot: 'Twitch-Bot', online: 'Online', commands: 'Befehle',
    features: 'Features', botActivity: 'Bot-Aktivität',
    waitingActivity: 'Warte auf Aktivität…',
  },
}

export function getOverlayStrings(lang) {
  return strings[lang] || strings.en
}
