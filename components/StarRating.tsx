'use client'

import { useState } from 'react'
import { Star } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Props {
  value: number
  onChange: (value: number) => void
  size?: number
}

export default function StarRating({ value, onChange, size = 24 }: Props) {
  const [hovered, setHovered] = useState(0)

  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => {
        const filled = star <= (hovered || value)
        return (
          <button
            key={star}
            type="button"
            onMouseEnter={() => setHovered(star)}
            onMouseLeave={() => setHovered(0)}
            onClick={() => onChange(star)}
            className={cn(
              'transition-colors',
              filled ? 'text-yellow-400' : 'text-slate-700 hover:text-yellow-400/60'
            )}
          >
            <Star size={size} fill={filled ? 'currentColor' : 'none'} />
          </button>
        )
      })}
    </div>
  )
}
