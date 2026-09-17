import Link from 'next/link'

// The reference's logo(): three tilted bars + "Pageviz."
export default function Brand({ href = '/', small = false }) {
  return (
    <Link href={href} className={`brand ${small ? 'brand-small' : ''}`} aria-label="Pageviz home">
      <span className="brand-mark" aria-hidden="true"><i></i><i></i><i></i></span>
      <span>Pageviz<span className="brand-period">.</span></span>
    </Link>
  )
}
