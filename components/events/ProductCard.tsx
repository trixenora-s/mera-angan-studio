'use client'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { Heart, Star, ShoppingCart, Calendar, MapPin } from 'lucide-react'
import { useCartStore } from '@/hooks/useCart'
import { useWishlistStore } from '@/hooks/useWishlist'
import { useSession } from 'next-auth/react'
import { Product, Review } from '@/types'
import { useState } from 'react'
import RatingStars from '../ui/RatingStars'
import { cn } from '@/lib/utils'

interface ProductCardProps {
  product: Product & { reviews: Review[] }
  className?: string
}

export default function ProductCard({ product, className = '' }: ProductCardProps) {
  const { data: session } = useSession()
  const { addItem, items } = useCartStore()
  const { toggleProduct, productIds } = useWishlistStore()
  const [quantity, setQuantity] = useState(1)
  const [inCart, setInCart] = useState(false)
  const [imageIndex, setImageIndex] = useState(0)

  const isInWishlist = productIds.includes(product.id)
  const hasReviews = product.reviews && product.reviews.length > 0
  const avgRating = hasReviews 
    ? product.reviews.reduce((sum, r) => sum + r.rating, 0) / product.reviews.length 
    : null

  const handleAddToCart = () => {
    addItem({
      id: crypto.randomUUID(),
      product_id: product.id,
      product_name: product.name,
      product_image: product.images[0],
      price: product.discounted_price || product.price,
      quantity,
    } as any)
    setInCart(true)
  }

  return (
    <motion.div 
      className={cn(
        'group bg-white rounded-2xl shadow-lg hover:shadow-2xl overflow-hidden border border-gray-100 hover:border-primary-200 transition-all duration-500 h-full flex flex-col',
        className
      )}
      whileHover={{ y: -8 }}
      transition={{ duration: 0.3 }}
    >
      {/* Wishlist Button */}
      <button
        onClick={() => toggleProduct(product.id)}
        className={cn(
          'absolute top-4 right-4 z-10 p-2 rounded-full bg-white/90 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-200 group/wishlist',
          isInWishlist ? 'text-red-500 fill-red-500' : 'text-gray-400 hover:text-red-500'
        )}
      >
        <Heart className="w-5 h-5" />
      </button>

      {/* Product Image */}
      <div className="relative h-64 w-full overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100">
        <Image
          src={product.images[imageIndex] || '/placeholder.jpg'}
          alt={product.name}
          fill
          className="object-cover group-hover:scale-110 transition-transform duration-500"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        
        {/* Image Thumbnails on Hover */}
        <div className="absolute bottom-3 left-3 right-3 space-x-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          {product.images.slice(1, 4).map((img, idx) => (
            <button
              key={idx}
              onClick={() => setImageIndex(idx)}
              className={cn(
                'w-12 h-12 rounded-lg overflow-hidden border-2 bg-white/80 backdrop-blur-sm',
                imageIndex === idx ? 'border-primary-500 ring-2 ring-primary-500/50' : 'border-transparent'
              )}
            >
              <Image
                src={img}
                alt={`${product.name} ${idx + 1}`}
                width={48}
                height={48}
                className="object-cover"
              />
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="p-6 flex-1 flex flex-col">
        {/* Category Badge */}
        <span className="inline-block bg-primary-100 text-primary-800 text-xs font-medium px-2.5 py-1 rounded-full mb-3 max-w-max">
          {product.category_name}
        </span>

        {/* Product Name */}
        <h3 className="font-bold text-lg text-gray-900 leading-tight line-clamp-2 mb-3 group-hover:text-primary-600 transition-colors">
          {product.name}
        </h3>

        {/* Rating - ONLY if reviews exist */}
        {hasReviews && (
          <div className="flex items-center space-x-2 mb-4">
            <RatingStars rating={avgRating!} size="sm" />
            <span className="text-sm text-gray-500">({product.reviews.length})</span>
          </div>
        )}

        {/* Price */}
        <div className="mb-6">
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-bold text-gray-900">
              ₹{product.discounted_price?.toLocaleString() || product.price.toLocaleString()}
            </span>
            {product.discounted_price && (
              <>
                <span className="text-lg text-gray-400 line-through">
                  ₹{product.price.toLocaleString()}
                </span>
                <span className="bg-gold-400 text-gold-900 text-xs font-bold px-2 py-1 rounded-full">
                  {Math.round(
                    ((product.price - product.discounted_price) / product.price) * 100
                  )}%
                </span>
              </>
            )}
          </div>
        </div>

        {/* Includes */}
        {product.includes && product.includes.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-6">
            {product.includes.slice(0, 3).map((item, idx) => (
              <span key={idx} className="text-xs text-gray-500 flex items-center">
                {getIncludeIcon(item)} {item}
              </span>
            ))}
            {product.includes.length > 3 && (
              <span className="text-xs text-gray-400">+{product.includes.length - 3} more</span>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-2 mt-auto">
          {inCart ? (
            <div className="flex space-x-2">
              <button className="flex-1 bg-gray-100 hover:bg-gray-200 p-3 rounded-xl flex items-center justify-center space-x-2 text-sm font-medium transition-colors">
                <span>-</span>
                <span className="font-bold">{quantity}</span>
                <span>+</span>
              </button>
              <button className="px-6 py-3 bg-primary-500 hover:bg-primary-600 text-white rounded-xl font-bold text-sm transition-colors">
                Checkout →
              </button>
            </div>
          ) : (
            <button
              onClick={handleAddToCart}
              className="w-full bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200 flex items-center justify-center space-x-2"
            >
              <ShoppingCart className="w-5 h-5" />
              <span>Add to Cart</span>
            </button>
          )}
          
          <Link
            href={`/product/${product.id}`}
            className="w-full block text-center py-3 border-2 border-gray-200 hover:border-primary-300 hover:text-primary-600 rounded-xl font-medium text-sm transition-all duration-200"
          >
            View Details →
          </Link>
        </div>
      </div>
    </motion.div>
  )
}

function getIncludeIcon(item: string): string {
  if (item.toLowerCase().includes('balloon')) return '🎈'
  if (item.toLowerCase().includes('flower')) return '🌸'
  if (item.toLowerCase().includes('light')) return '🕯️'
  if (item.toLowerCase().includes('stage')) return '🎪'
  return '✨'
}