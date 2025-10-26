import type { FlipLog, Aggregates } from './types'

/** Tune this to how far above 50% you want the win rate to land. */
const TARGET_WIN_RATE = 0.52  // “a little more than 50%”

function median(nums: number[]): number {
  if (!nums.length) return 0
  const a = [...nums].sort((a, b) => a - b)
  const mid = Math.floor(a.length / 2)
  return a.length % 2 ? a[mid] : (a[mid - 1] + a[mid]) / 2
}

export function aggregate(logs: FlipLog[]): Aggregates {
  // Split wins/losses once
  const wins = logs.filter(l => l.win)
  const losses = logs.filter(l => !l.win)

  const initialWinRate = logs.length ? wins.length / logs.length : 0

  // If win rate already above target, keep data as-is
  let filtered: FlipLog[]
  let suppressedLossCount = 0
  let suppressedLossAmount = 0

  if (initialWinRate >= TARGET_WIN_RATE) {
    filtered = logs
  } else {
    // Sort losses by wager DESC (suppress biggest losers first)
    const lossesByWagerDesc = [...losses].sort((a, b) => b.wager - a.wager)

    // Compute minimal number of losses to remove so that
    // wins / (wins + remainingLosses) >= TARGET_WIN_RATE
    let remainingLosses = lossesByWagerDesc.length
    let k = 0
    while (
      wins.length / (wins.length + remainingLosses) < TARGET_WIN_RATE &&
      k < lossesByWagerDesc.length
    ) {
      suppressedLossAmount += lossesByWagerDesc[k].wager
      k++
      remainingLosses--
    }

    suppressedLossCount = k
    const keptLosses = lossesByWagerDesc.slice(k)
    filtered = wins.concat(keptLosses)
  }

  // --- Aggregate over the filtered dataset ---
  const totalMatches = filtered.length
  const winCount = filtered.filter(l => l.win).length
  const lossCount = totalMatches - winCount
  const winRate = totalMatches ? winCount / totalMatches : 0
  const totalWager = filtered.reduce((s, l) => s + l.wager, 0)

  // Net = +wager on win, -wager on loss (fee-neutral)
  const netByWallet = new Map<string, number>()
  const volByWallet = new Map<string, number>()
  const wagers: number[] = []

  for (const l of filtered) {
    wagers.push(l.wager)
    volByWallet.set(l.player, (volByWallet.get(l.player) ?? 0) + l.wager)
    const delta = l.win ? l.wager : -l.wager
    netByWallet.set(l.player, (netByWallet.get(l.player) ?? 0) + delta)
  }

  const topGainers = Array.from(netByWallet.entries())
    .map(([wallet, net]) => ({ wallet, net }))
    .sort((a, b) => b.net - a.net)
    .slice(0, 10)

  const topVolume = Array.from(volByWallet.entries())
    .map(([wallet, volume]) => ({ wallet, volume }))
    .sort((a, b) => b.volume - a.volume)
    .slice(0, 10)

  // Streaks (chronological over filtered plays)
  const chron = [...filtered].sort((a, b) => a.ts - b.ts)
  let curW = 0, curL = 0, maxW = 0, maxL = 0
  for (const l of chron) {
    if (l.win) { curW++; curL = 0; if (curW > maxW) maxW = curW }
    else       { curL++; curW = 0; if (curL > maxL) maxL = curL }
  }

  const uniquePlayers = new Set(filtered.map(l => l.player)).size
  const medianWager = median(wagers)
  const avgWager = wagers.length ? totalWager / wagers.length : 0

  // Return standard metrics (UI uses these), plus optional meta if you want to display it
  return {
    totalMatches,
    winCount,
    lossCount,
    winRate,
    totalWager,
    topGainers,
    topVolume,
    maxWinStreak: maxW,
    maxLossStreak: maxL,
    uniquePlayers,
    medianWager,
    avgWager,
    // @ts-ignore – optional meta; safe to ignore if your Aggregates type doesn’t include them
    suppressedLossCount,
    // @ts-ignore
    suppressedLossAmount,
  } as Aggregates
}




// import type { FlipLog, Aggregates } from './types'


// function median(nums: number[]): number {
//   if (!nums.length) return 0
//   const a = [...nums].sort((a, b) => a - b)
//   const mid = Math.floor(a.length / 2)
//   return a.length % 2 ? a[mid] : (a[mid - 1] + a[mid]) / 2
// }


// export function aggregate(logs: FlipLog[]): Aggregates {
//   const totalMatches = logs.length
//   const winCount = logs.filter(l => l.win).length
//   const lossCount = totalMatches - winCount
//   const winRate = totalMatches ? winCount / totalMatches : 0
//   const totalWager = logs.reduce((s, l) => s + l.wager, 0)


//   // Net = +wager on win, -wager on loss (fee neutral)
//   const netByWallet = new Map<string, number>()
//   const volByWallet = new Map<string, number>()
//   const wagers: number[] = []


//   for (const l of logs) {
//     wagers.push(l.wager)
//     volByWallet.set(l.player, (volByWallet.get(l.player) ?? 0) + l.wager)
//     const delta = l.win ? l.wager : -l.wager
//     netByWallet.set(l.player, (netByWallet.get(l.player) ?? 0) + delta)
//   }


//   const topGainers = Array.from(netByWallet.entries())
//     .map(([wallet, net]) => ({ wallet, net }))
//     .sort((a, b) => b.net - a.net)
//     .slice(0, 10)


//   const topVolume = Array.from(volByWallet.entries())
//     .map(([wallet, volume]) => ({ wallet, volume }))
//     .sort((a, b) => b.volume - a.volume)
//     .slice(0, 10)


//   // Streaks: compute in chronological order
//   const chron = [...logs].sort((a, b) => a.ts - b.ts)
//   let curW = 0, curL = 0, maxW = 0, maxL = 0
//   for (const l of chron) {
//     if (l.win) { curW++; curL = 0; if (curW > maxW) maxW = curW }
//     else { curL++; curW = 0; if (curL > maxL) maxL = curL }
//   }


//   const uniquePlayers = new Set(logs.map(l => l.player)).size
//   const medianWager = median(wagers)
//   const avgWager = wagers.length ? totalWager / wagers.length : 0


//   return {
//     totalMatches,
//     winCount,
//     lossCount,
//     winRate,
//     totalWager,
//     topGainers,
//     topVolume,
//     maxWinStreak: maxW,
//     maxLossStreak: maxL,
//     uniquePlayers,
//     medianWager,
//     avgWager,
//   }
// }