import { createElement } from 'react'
import { ICONS } from '@/lib/icons'

// Lucide icon by its kebab-case name — the same names the reference passes to
// data-lucide — rendered with the reference's stroke width (1.7).
export default function Icon({ name, className = '' }) {
  const nodes = ICONS[name]
  if (!nodes) return null
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`lucide lucide-${name} icon ${className}`.trim()}
      aria-hidden="true"
    >
      {nodes.map(([tag, attrs], index) => createElement(tag, { key: index, ...attrs }))}
    </svg>
  )
}
