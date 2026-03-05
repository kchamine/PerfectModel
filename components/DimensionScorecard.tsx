import type { Model } from '@/lib/types'
import { REVIEW_DIMENSIONS } from '@/lib/types'
import { formatScore } from '@/lib/utils'

interface Props {
  model: Model
}

export default function DimensionScorecard({ model }: Props) {
  return (
    <div className="card p-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {REVIEW_DIMENSIONS.map((dim) => {
          const score = model[dim.key as keyof Model] as number
          const pct = (score / 5) * 100

          return (
            <div key={dim.key}>
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm text-slate-300">{dim.label}</span>
                <span className="text-sm font-semibold text-white">{formatScore(score)}</span>
              </div>
              <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${pct}%`,
                    backgroundColor: score >= 4
                      ? '#22c55e'
                      : score >= 3
                      ? '#eab308'
                      : '#ef4444',
                  }}
                />
              </div>
              <p className="text-xs text-slate-500 mt-0.5">{dim.description}</p>
            </div>
          )
        })}
      </div>
    </div>
  )
}
