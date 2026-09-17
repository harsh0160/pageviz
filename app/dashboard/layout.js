import RealWorkspace from '../_components/workspace/RealWorkspace'

export const metadata = {
  title: 'Your sites — Pageviz',
}

// Signed-in workspace: real Supabase data only.
export default function DashboardLayout({ children }) {
  return <RealWorkspace>{children}</RealWorkspace>
}
