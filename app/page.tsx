import HeroSection from '@/components/home/HeroSection'
import EventCategoriesGrid from '@/components/home/EventCategoriesGrid'
import FeaturedPackages from '@/components/home/FeaturedPackages'
import TestimonialsCarousel from '@/components/home/TestimonialsCarousel'
import StatsCounter from '@/components/home/StatsCounter'

export default function HomePage() {
  return (
    <div className="space-y-16">
      <HeroSection />
      <EventCategoriesGrid />
      <FeaturedPackages />
      <StatsCounter />
      <TestimonialsCarousel />
    </div>
  )
}