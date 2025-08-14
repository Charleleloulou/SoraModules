async function fetchPageHtml(url) {
  const response = await fetch(url)
  return await response.text()
}

function extractMasterLinks(html) {
  const regex = /https:\/\/dl30\.darkibox\.com\/hls2\/[^\s'"]+master\.m3u8/g
  const matches = html.match(regex)
  return matches || []
}

function getEpisodes(html) {
  const parser = new DOMParser()
  const doc = parser.parseFromString(html, 'text/html')
  const buttons = Array.from(doc.querySelectorAll('button'))
  const episodeButtons = buttons.filter(btn => btn.textContent.includes('Commencer L\'épisode'))
  return episodeButtons.map((btn, index) => ({
    title: `Épisode ${index + 1}`,
    index: index + 1
  }))
}

async function main(pageUrl) {
  const html = await fetchPageHtml(pageUrl)
  const masterLinks = extractMasterLinks(html)
  
  if (masterLinks.length === 0) return null

  const episodes = getEpisodes(html)
  if (episodes.length > 0) {
    return episodes.map((ep, i) => ({
      title: ep.title,
      type: 'hls',
      url: masterLinks[i] || masterLinks[0]
    }))
  }

  return { type: 'hls', url: masterLinks[0] }
}

export default { main }