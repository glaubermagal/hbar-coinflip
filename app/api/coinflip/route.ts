// import { NextRequest, NextResponse } from 'next/server'
// import { fetchLastLogs } from '../../../lib/mirror'
// import { aggregate } from '../../../lib/aggregate'

// const CONTRACT_ID = process.env.NEXT_PUBLIC_CONTRACT_ID as string

// export async function GET(req: NextRequest) {
//   try {
//     const { searchParams } = new URL(req.url)
//     const contractId = searchParams.get('contractId')

//     if (!contractId)
//       return NextResponse.json({ error: 'contractId is required' }, { status: 400 })

//     const logs = await fetchLastLogs(contractId)
//     let aggregates = aggregate(logs)

//     // ✅ Invert winners/losers if winRate < 0.5
//     if (contractId === CONTRACT_ID && aggregates.winRate < 0.5) {
//       const invertedLogs = logs.map((l) => ({
//         ...l,
//         win: !l.win,
//       }))
//       aggregates = aggregate(invertedLogs)
//     }

//     return NextResponse.json({ aggregates })
//   } catch (e: any) {
//     return NextResponse.json({ error: e.message ?? 'Failed' }, { status: 500 })
//   }
// }


import { NextRequest, NextResponse } from 'next/server'
import { fetchLastLogs } from '../../../lib/mirror'
import { aggregate } from '../../../lib/aggregate'


export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const contractId = searchParams.get('contractId')
    
    if (!contractId) return NextResponse.json({ error: 'contractId is required' }, { status: 400 })
  
    const logs = await fetchLastLogs(contractId)
    const aggregates = aggregate(logs)
    return NextResponse.json({ aggregates })
  } catch (e: any) {
    return NextResponse.json({ error: e.message ?? 'Failed' }, { status: 500 })
  }
}