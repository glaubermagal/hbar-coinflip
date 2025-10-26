'use client'
export function SimpleTable({ columns, rows }: { columns: { key: string; title: string }[]; rows: Record<string, any>[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b">
            {columns.map(c => (
              <th key={c.key} className="py-2 pr-4 font-semibold">{c.title}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} className="border-b last:border-b-0">
              {columns.map(c => (
                <td key={c.key} className="py-2 pr-4">{r[c.key]}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}