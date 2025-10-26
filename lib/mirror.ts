import axios from 'axios'
import { Interface } from 'ethers'
import type { FlipLog } from './types'

const MIRROR = process.env.MIRROR_BASE || 'https://mainnet.mirrornode.hedera.com/api/v1'
const LEN = 5000;

// Event ABI for decoding
const EVENT_ABI = [
  'event FlipPlayed(address indexed player, uint256 indexed amountIndex, uint256 wager, bool playerChoice, bool coinResult, bool win, uint256 payout)',
]
const iface = new Interface(EVENT_ABI)
// v6: topic hash via fragment
const TOPIC0 = iface.getEvent('FlipPlayed')!.topicHash.toLowerCase()

async function evmToAccountId(evm: string): Promise<string> {
  try {
    if (!evm || !evm.startsWith('0x')) return evm
    const { data } = await axios.get(`${MIRROR}/accounts/${evm}`)
    return data.account ?? evm // “account” = 0.0.xxxx if found
  } catch {
    return evm
  }
}

export async function fetchLastLogs(contractId: string): Promise<FlipLog[]> {
  const base = `${MIRROR}/contracts/${encodeURIComponent(contractId)}/results/logs`
  // ❌ Do NOT include topic0 — Mirror requires a timestamp range if you do.
  let url = `${base}?limit=100&order=desc`

  const picked: any[] = []

  while (picked.length < LEN && url) {
    const { data } = await axios.get(url)

    if (Array.isArray(data.logs)) {
      for (const log of data.logs) {
        // Keep only FlipPlayed
        const t0 = String(log.topics?.[0] ?? '').toLowerCase()
        if (t0 === TOPIC0) picked.push(log)
        if (picked.length >= LEN) break
      }
    }

    const next = data.links?.next
    url = next ? `${MIRROR.replace('/api/v1','')}${next}` : ''
  }

  // Decode and normalize the selected (newest-first) logs
  const slice = picked.slice(0, LEN)
  // const HBAR = 1e8

  const decoded: FlipLog[] = await Promise.all(
    slice.map(async (log: any) => {
      const parsed = iface.parseLog({ data: log.data, topics: log.topics })
      const { player, amountIndex, wager, win, payout } = parsed?.args as any
      const ts = Number(String(log.timestamp).split('.')[0])
      const accountId = await evmToAccountId(player) // <-- convert here

      return {
        ts,
        player: accountId,
        amountIndex: Number(amountIndex.toString()),
        wager: Number(wager.toString()) / 1e8,
        win: Boolean(win),
        payout: Number(payout.toString()) / 1e8,
      }
    })
  )
  // const decoded: FlipLog[] = slice.map((log: any) => {
  //   const parsed = iface.parseLog({ data: log.data, topics: log.topics })
  //   const { player, amountIndex, wager, win, payout } = parsed?.args as any

  //   // Mirror timestamp like "1695912345.123456789" → seconds as number
  //   const ts = Number(String(log.timestamp).split('.')[0])

  //   return {
  //     ts,
  //     // Prefer parsed arg; if you really want 0.0.x, you can map via /accounts/{evmAddress}
  //     player: String(player),
  //     amountIndex: Number(amountIndex.toString()),
  //     wager: Number(wager.toString()) / HBAR,
  //     win: Boolean(win),
  //     payout: Number(payout.toString()) / HBAR,
  //   }
  // })

  return decoded
}
