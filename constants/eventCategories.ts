import { EventCategory } from '@/types'

export const EVENT_CATEGORIES: EventCategory[] = [
  {
    id: '1',
    slug: 'birthdays',
    name: 'Birthdays',
    description: 'Celebrate birthdays with our amazing decoration packages',
    cover_image_url: '/images/categories/birthdays.jpg',
    display_order: 1,
    is_active: true,
  },
  {
    id: '2',
    slug: 'wedding-ceremony',
    name: 'Wedding Ceremony',
    description: 'Make your wedding day unforgettable with elegant decorations',
    cover_image_url: '/images/categories/wedding.jpg',
    display_order: 2,
    is_active: true,
  },
  {
    id: '3',
    slug: 'corporate-events',
    name: 'Corporate Events',
    description: 'Professional decorations for business meetings and events',
    cover_image_url: '/images/categories/corporate.jpg',
    display_order: 3,
    is_active: true,
  },
  {
    id: '4',
    slug: 'anniversaries',
    name: 'Anniversaries',
    description: 'Celebrate milestones with beautiful anniversary decorations',
    cover_image_url: '/images/categories/anniversaries.jpg',
    display_order: 4,
    is_active: true,
  },
  {
    id: '5',
    slug: 'baby-shower',
    name: 'Baby Shower',
    description: 'Joyful decorations for baby shower celebrations',
    cover_image_url: '/images/categories/baby-shower.jpg',
    display_order: 5,
    is_active: true,
  },
]