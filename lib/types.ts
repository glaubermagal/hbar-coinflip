export type FlipLog = {
    ts: number // unix seconds
    player: string
    amountIndex: number
    wager: number // in HBAR units
    win: boolean
    payout: number // in HBAR units
}


export type Aggregates = {
    totalMatches: number
    winCount: number
    lossCount: number
    winRate: number
    totalWager: number
    topGainers: { wallet: string; net: number }[]
    topVolume: { wallet: string; volume: number }[]
    maxWinStreak: number
    maxLossStreak: number
    uniquePlayers: number
    medianWager: number
    avgWager: number
}


export type ApiPayload = { aggregates: Aggregates }