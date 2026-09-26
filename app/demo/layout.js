import DemoWorkspace from '../_components/workspace/DemoWorkspace'

export const metadata = {
  title: 'Live demo — Pageviz',
  description: 'Try Pageviz with sample websites: pageviews over time, top pages, referrers and devices. No account needed.',
}

// Demo workspace from the reference build: sample data only, nothing saved.
export default function DemoLayout({ children }) {
  return <DemoWorkspace>{children}</DemoWorkspace>
}
