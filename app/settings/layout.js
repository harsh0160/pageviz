import RealWorkspace from '../_components/workspace/RealWorkspace'

export const metadata = {
  title: 'Settings — Pageviz',
}

// Signed-in workspace: real Supabase data only.
export default function SettingsLayout({ children }) {
  return <RealWorkspace>{children}</RealWorkspace>
}
