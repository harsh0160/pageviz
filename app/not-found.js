import MarketingHeader from './_components/MarketingHeader'
import Footer from './_components/Footer'
import NotFoundContent from './_components/NotFoundContent'

export const metadata = {
  title: 'Not found — Pageviz',
}

export default function NotFound() {
  return (
    <>
      <MarketingHeader />
      <main id="main-content"><NotFoundContent /></main>
      <Footer />
    </>
  )
}
