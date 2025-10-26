'use client'
import clsx from 'clsx'
export function StatCard({ title, value }: { title: string; value: string }) {
  return (
    <div className={clsx('rounded-2xl bg-[rgba(0,0,0,0.5)] p-6 shadow-sm flex flex-col items-center justify-center min-h-[120px]')}>
      <div className="text-center text-neutral-200 text-sm">{title}</div>
      <div className="text-3xl font-semibold mt-2">{value}</div>
    </div>
  )
}