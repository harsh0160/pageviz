import { DM_Sans, Instrument_Serif } from 'next/font/google'
import './globals.css'
import './styles/marketing.css'
import './styles/app.css'
import { ToastProvider } from './_components/Toast'
import ThemeWatcher from './_components/ThemeWatcher'
import SiteTracker from './_components/SiteTracker'

const instrumentSerif = Instrument_Serif({
  subsets: ['latin'],
  weight: ['400'],
  style: ['normal', 'italic'],
  variable: '--font-instrument-serif',
})

const dmSans = DM_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-dm-sans',
})

export const metadata = {
  title: 'Pageviz — Less noise. More insight.',
  description: 'Get the big picture without the baggage. Pageviz is simple, privacy-first, cookieless website analytics for people who make things.',
  openGraph: {
    title: 'Pageviz — Less noise. More insight.',
    description: 'Simple website analytics. A little clarity for your corner of the internet, without compromising your visitors’ privacy.',
    type: 'website',
  },
}

// Resolves the saved theme ('light' | 'dark' | 'system', key pv_theme) before
// first paint so dark mode never flashes. ThemeWatcher keeps it in sync after.
const themeScript = `(function(){try{var saved=localStorage.getItem('pv_theme')||'system';var dark=saved==='dark'||(saved==='system'&&window.matchMedia('(prefers-color-scheme: dark)').matches);document.documentElement.setAttribute('data-theme',dark?'dark':'light')}catch(e){}})();`

export default function RootLayout({ children }) {
  return (
    <html lang="en" data-theme="light" data-scroll-behavior="smooth" className={`${instrumentSerif.variable} ${dmSans.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body suppressHydrationWarning>
        <a className="skip-link" href="#main-content">Skip to content</a>
        <ThemeWatcher />
        <SiteTracker />
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  )
}
