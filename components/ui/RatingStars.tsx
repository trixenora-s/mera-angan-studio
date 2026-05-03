import { Star } from 'lucide-react'
import { cn } from '@/lib/utils'

interface RatingStarsProps {
  rating: number | null
  count?: number
  size?: 'sm' | 'md' | 'lg'
  showCount?: boolean
  className?: string
}

const sizeClasses = {
  sm: 'w-3 h-3',
  md: 'w-4 h-4',
  lg: 'w-5 h-5'
}

export default function RatingStars({ 
  rating, 
  count, 
  size = 'md', 
  showCount = true,
  className 
}: RatingStarsProps) {
  // CRITICAL: Return null if no rating data
  if (!rating || rating === null || rating === undefined) {
    return null
  }

  return (
    <div className={cn('flex items-center space-x-0.5', className)}>
      {Array.from({ length: 5 }).map((_, i) => {
        const starValue = i + 1
        let status: 'full' | 'half' | 'empty' = 'empty'

        if (rating >= starValue) {
          status = 'full'
        } else if (rating >= starValue - 0.5) {
          status = 'half'
        }

        return (
          <Star
            key={i}
            className={cn(
              sizeClasses[size],
              status === 'full' && 'text-yellow-400 fill-yellow-400',
              status === 'half' && 'text-yellow-400 fill-yellow-200',
              status === 'empty' && 'text-gray-300'
            )}
            aria-hidden="true"
          />
        )
      })}
      
      {showCount && count && count > 0 && (
        <span className="ml-1.5 text-sm text-gray-500 font-medium">
          ({count})
        </span>
      )}
      
      <span className="sr-only">
        {rating} out of 5 stars{count ? `, ${count} reviews` : ''}
      </span>
    </div>
  )
}