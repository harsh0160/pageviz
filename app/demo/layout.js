import DemoWorkspace from '../_components/workspace/DemoWorkspace'

export const metadata = {
  title: 'Your sites — Pageviz',
}

// Demo workspace from the reference build: sample data only, nothing saved.
export default function DemoLayout({ children }) {
  return <DemoWorkspace>{children}</DemoWorkspace>
}
