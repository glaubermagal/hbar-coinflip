export const revalidate = 60;

import { Donut } from '@/components/Donut';
import { StatCard } from '@/components/StatCard';
import { SimpleTable } from '@/components/SimpleTable';
import { fetchLastLogs } from '@/lib/mirror';
import { aggregate } from '@/lib/aggregate';
import type { Aggregates } from '@/lib/types';

const CONTRACT_ID = process.env.NEXT_PUBLIC_CONTRACT_ID as string; // or use a non-public env

export default async function Home() {
  let data: Aggregates | null = null;
  let error: string | null = null;

  try {
    if (!CONTRACT_ID) throw new Error('Missing NEXT_PUBLIC_CONTRACT_ID');
    const logs = await fetchLastLogs(CONTRACT_ID);
    data = aggregate(logs);
    console.log(data)
  } catch (e: any) {
    error = e?.message ?? 'Failed to load data';
  }

  if (error) {
    return <div className="text-red-600">Error: {error}</div>;
  }
  if (!data) {
    return <div className="text-sm text-neutral-500">Loading latest plays…</div>;
  }

  const donut = [
    { name: 'Win', value: data.winCount },
    { name: 'Loss', value: data.lossCount },
  ];

  return (
    <div>
      <header>
          <div className="logo-left">
              <h1 className="bet-on-title">HBAR COINFLIP</h1>
          </div>
          <div className="menu-buttons">
              <a href="/index.html">Home</a>
              <a href="/stats">Leaderboard</a>
          </div>
      </header>
      <div className="mx-auto max-w-7xl p-4 md:p-8">
        <div className="space-y-8">
          {/* <header className="flex items-end justify-between">
            <div>
              <h2 className="text-4xl md:text-5xl font-semibold">Latest Statistics</h2>
              <p className="text-sm text-neutral-500">Contract: {CONTRACT_ID}</p>
            </div>
          </header> */}

          <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="rounded-2xl bg-[rgba(12, 5, 15, 0.8)] text-gray-200 p-6 shadow-sm">
              <h2 className="text-3xl font-semibold mb-4">Top Gainers</h2>
              <SimpleTable
                columns={[
                  { key: 'wallet', title: 'Wallet ID' },
                  { key: 'net', title: 'Net Gain (ℏ)' },
                ]}
                rows={data.topGainers.map(x => ({ wallet: x.wallet, net: x.net.toLocaleString() }))}
              />
            </div>

            <div className="rounded-2xl bg-[rgba(12, 5, 15, 0.8)] text-gray-200 p-6 shadow-sm">
              {/* <h3 className="text-2xl font-semibold mb-2">Win Vs Loss</h3> */}
              <h2 className="text-3xl font-semibold mb-4">Win Vs Loss</h2>
              <Donut data={donut} />
              <p className="text-center text-xl mt-6">
                Win Rate: {(data.winRate * 100).toFixed(2)}%
              </p>
            </div>
          </section>

          <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="rounded-2xl bg-[rgba(12, 5, 15, 0.8)] text-gray-200 p-6 shadow-sm lg:col-span-2">
              <h2 className="text-3xl font-semibold mb-4">Top Volume Makers</h2>
              <SimpleTable
                columns={[
                  { key: 'wallet', title: 'Wallet ID' },
                  { key: 'vol', title: 'Volume (ℏ)' },
                ]}
                rows={data.topVolume.map(x => ({ wallet: x.wallet, vol: x.volume.toLocaleString() }))}
              />
            </div>

            <div className="rounded-2xl bg-[rgba(12, 5, 15, 0.8)] text-gray-200 p-6 shadow-sm space-y-6">
              <StatCard title="Highest Winning Streak" value={String(data.maxWinStreak)} />
              <StatCard title="Highest Losing Streak" value={String(data.maxLossStreak)} />
              <StatCard title="Total Flipped" value={`${data.totalWager.toLocaleString()} ℏ`} />
              <StatCard title="Total Matches" value={String(data.totalMatches)} />
            </div>
          </section>

          <section className="rounded-2xl bg-[rgba(12, 5, 15, 0.8)] text-gray-200 p-6 shadow-sm">
            <h2 className="text-3xl font-semibold mb-4">Overall Snapshot</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <StatCard title="Unique Players" value={String(data.uniquePlayers)} />
              <StatCard title="Median Wager" value={`${data.medianWager.toLocaleString()} ℏ`} />
              <StatCard title="Avg Wager" value={`${data.avgWager.toFixed(2)} ℏ`} />
            </div>
          </section>
        </div>
      </div>

      <footer style={{display: 'flex', flexDirection: 'column'}}>
        <ul>
            <li><a target="_blank" href="https://x.com/hbarcoinflip">x.com/hbarcoinflip</a></li>
            {/* <li><a href="https://discord.com/invite/hbarcoinflip">Discord</a></li> */}
        </ul>
        <p style={{color: '#82ff4a', position: 'relative', fontSize: '14px'}}>
          © {new Date().getFullYear()} HBAR Coinflip. All rights reserved.
        </p>
    </footer>
    </div>
  );
}


// 'use client'
// import { useEffect, useState, useMemo } from 'react'
// import type { Aggregates, ApiPayload } from '@/lib/types'
// import { Donut } from '../../components/Donut'
// import { StatCard } from '../../components/StatCard'
// import { SimpleTable } from '../../components/SimpleTable'


// const CONTRACT_ID = process.env.NEXT_PUBLIC_CONTRACT_ID as string

// export default function Home() {
//   const [data, setData] = useState<Aggregates | null>(null)
//   const [loading, setLoading] = useState(false)
//   const [error, setError] = useState<string | null>(null)


//   useEffect(() => {
//     const run = async () => {
//       try {
//         setLoading(true)
//         setError(null)
//         const res = await fetch(`/api/coinflip?contractId=${encodeURIComponent(CONTRACT_ID)}`)
//         if (!res.ok) throw new Error(`HTTP ${res.status}`)
//         const payload: ApiPayload = await res.json()
//         setData(payload.aggregates)
//       } catch (e: any) {
//         setError(e.message ?? 'Failed to load')
//       } finally {
//         setLoading(false)
//       }
//     }
//     run()
//   }, [])


//   if (error) return <div className="text-red-600">Error: {error}</div>
//   if (loading || !data) return <div className="text-sm text-neutral-500">Loading latest plays…</div>


//   const donut = [
//     { name: 'Win', value: data.winCount },
//     { name: 'Loss', value: data.lossCount },
//   ]

//   return (
//     <div className="space-y-8">
//       {/* <header className="flex items-end justify-between">
//         <div>
//           <h2 className="text-4xl md:text-5xl font-semibold">Latest Statistics</h2>
//           <p className="text-sm text-neutral-500">Contract: {CONTRACT_ID}</p>
//         </div>
//       </header> */}


//       <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
//         <div className="rounded-2xl bg-[rgba(12, 5, 15, 0.8)] text-gray-200 p-6 shadow-sm">
//           <h2 className="text-3xl font-semibold mb-4">Top Gainers</h2>
//           <SimpleTable
//             columns={[{ key: 'wallet', title: 'Wallet ID' }, { key: 'net', title: 'Net Gain (ℏ)' }]}
//             rows={data.topGainers.map(x => ({ wallet: x.wallet, net: x.net.toLocaleString() }))}
//           />
//         </div>
//         <div className="rounded-2xl bg-[rgba(12, 5, 15, 0.8)] text-gray-200 p-6 shadow-sm">
//           <h3 className="text-2xl font-semibold mb-2">Win Vs Loss</h3>
//           <Donut data={donut} />
//           <p className="text-center text-xl mt-6">Win Rate: {(data.winRate * 100).toFixed(2)}%</p>
//         </div>
//       </section>


//       <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
//         <div className="rounded-2xl bg-[rgba(12, 5, 15, 0.8)] text-gray-200 p-6 shadow-sm lg:col-span-2">
//           <h2 className="text-3xl font-semibold mb-4">Top Volume Makers</h2>
//           <SimpleTable
//             columns={[{ key: 'wallet', title: 'Wallet ID' }, { key: 'vol', title: 'Volume (ℏ)' }]}
//             rows={data.topVolume.map(x => ({ wallet: x.wallet, vol: x.volume.toLocaleString() }))}
//           />
//         </div>
//         <div className="rounded-2xl bg-[rgba(12, 5, 15, 0.8)] text-gray-200 p-6 shadow-sm space-y-6">
//           <StatCard title="Highest Winning Streak" value={String(data.maxWinStreak)} />
//           <StatCard title="Highest Losing Streak" value={String(data.maxLossStreak)} />
//           <StatCard title="Total Flipped" value={`${data.totalWager.toLocaleString()} ℏ`} />
//           <StatCard title="Total Matches" value={String(data.totalMatches)} />
//         </div>
//       </section>


//       <section className="rounded-2xl bg-[rgba(12, 5, 15, 0.8)] text-gray-200 p-6 shadow-sm">
//         <h2 className="text-3xl font-semibold mb-4">Overall Snapshot</h2>
//         <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//           <StatCard title="Unique Players" value={String(data.uniquePlayers)} />
//           <StatCard title="Median Wager" value={`${data.medianWager.toLocaleString()} ℏ`} />
//           <StatCard title="Avg Wager" value={`${data.avgWager.toFixed(2)} ℏ`} />
//         </div>
//       </section>
//     </div>
//   );
// }
