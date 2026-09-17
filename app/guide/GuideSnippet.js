'use client'

import { useEffect, useState } from 'react'
import Icon from '../_components/Icon'
import { copyText, useToast } from '../_components/Toast'

// The reference shows a placeholder CDN snippet; this is the app's real one
// (public/track.js), using whatever origin Pageviz is served from.
export default function GuideSnippet() {
  const toast = useToast()
  const [origin, setOrigin] = useState('')
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setOrigin(window.location.origin)
  }, [])
  const snippet = `<script src="${origin}/track.js" data-site-id="your-site-id"></script>`
  return (
    <div className="code-box">
      <pre>{`<script src="${origin}/track.js"\n        data-site-id="your-site-id"></script>`}</pre>
      <button type="button" className="button button-secondary button-small" onClick={() => copyText(snippet, toast)}><Icon name="copy" />Copy snippet</button>
    </div>
  )
}
