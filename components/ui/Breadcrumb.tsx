interface BreadcrumbItem {
  name: string
  href: string
}

interface BreadcrumbProps {
  items: BreadcrumbItem[]
}

export default function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <nav aria-label="Breadcrumb" className="flex gap-2">
      {items.map((item, index) => (
        <a key={`${item.name}-${index}`} href={item.href} className="text-sm font-medium text-white/90 hover:text-white">
          {item.name}
        </a>
      ))}
    </nav>
  )
}
