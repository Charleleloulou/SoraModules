async function searchResults(keyword) {
    try {
        const encodedKeyword = encodeURIComponent(keyword)
        const response = await fetch(`https://movix.site/search?query=${encodedKeyword}`)
        const html = await response.text()
        const parser = new DOMParser()
        const doc = parser.parseFromString(html, 'text/html')
        const items = Array.from(doc.querySelectorAll('.movie-card a'))
        const results = items.map(item => ({
            title: item.querySelector('.title')?.textContent || 'No Title',
            image: item.querySelector('img')?.src || '',
            href: item.href
        }))
        return JSON.stringify(results)
    } catch (error) {
        return JSON.stringify([{ title: 'Error', image: '', href: '' }])
    }
}

async function extractDetails(url) {
    try {
        const response = await fetch(url)
        const html = await response.text()
        const parser = new DOMParser()
        const doc = parser.parseFromString(html, 'text/html')
        const description = doc.querySelector('.description')?.textContent || 'No description available'
        const aliases = doc.querySelector('.aliases')?.textContent || 'Unknown'
        const airdate = doc.querySelector('.airdate')?.textContent || 'Unknown'
        return JSON.stringify({
            description,
            aliases,
            airdate
        })
    } catch (error) {
        return JSON.stringify({
            description: 'Error loading description',
            aliases: 'Unknown',
            airdate: 'Unknown'
        })
    }
}

async function extractEpisodes(url) {
    try {
        const response = await fetch(url)
        const html = await response.text()
        const parser = new DOMParser()
        const doc = parser.parseFromString(html, 'text/html')
        const episodeElements = Array.from(doc.querySelectorAll('.episode-list a'))
        const episodes = episodeElements.map((ep, index) => ({
            href: ep.href,
            number: index + 1
        }))
        return JSON.stringify(episodes)
    } catch (error) {
        return JSON.stringify([])
    }
}

async function extractStreamUrl(url) {
    try {
        const response = await fetch(url)
        const html = await response.text()
        const parser = new DOMParser()
        const doc = parser.parseFromString(html, 'text/html')
        const sourceLink = doc.querySelector('.source-selector a')?.href || ''
        return JSON.stringify({ streams: [{ title: 'Default Server', streamUrl: sourceLink, headers: {} }] })
    } catch (error) {
        return JSON.stringify({ streams: [] })
    }
}