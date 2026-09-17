import SiteView from '../../_components/workspace/SiteView'

// Title is set from the site's name once it loads (see usePageTitle).
export default async function DemoSite({ params }) {
  const { siteId } = await params
  return <SiteView siteId={siteId} />
}
