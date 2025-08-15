async function searchResults(keyword) {
  try {
    const response = await fetchv2(`https://movix.site/?s=${encodeURIComponent(keyword)}`);
    const html = await response.text();
    const regex = /<a href="([^"]+)"[^>]*>\s*<img[^>]+src="([^"]+)"[^>]*>\s*<h3[^>]*>([^<]+)<\/h3>/g;
    const results = [];
    let match;
    while ((match = regex.exec(html)) !== null) {
      results.push({
        title: match[3].trim(),
        image: match[2].trim(),
        href: match[1].trim()
      });
    }
    return JSON.stringify(results);
  } catch (e) {
    return JSON.stringify([{ title: 'Error', image: '', href: '' }]);
  }
}

async function extractDetails(url) {
  try {
    const response = await fetchv2(url);
    const html = await response.text();
    const descMatch = html.match(/<div class="description">([\s\S]*?)<\/div>/);
    const airMatch = html.match(/<span[^>]*>Released:<\/span>\s*([^<]+)/);
    return JSON.stringify({
      description: descMatch ? descMatch[1].trim() : 'No description available',
      aliases: 'Unknown',
      airdate: airMatch ? airMatch[1].trim() : 'Unknown'
    });
  } catch (e) {
    return JSON.stringify({
      description: 'Error loading description',
      aliases: 'Unknown',
      airdate: 'Unknown'
    });
  }
}

async function extractEpisodes(url) {
  try {
    const response = await fetchv2(url);
    const html = await response.text();
    const regex = /<a href="([^"]+)"[^>]*>\s*Episode (\d+)\s*<\/a>/g;
    const episodes = [];
    let match;
    while ((match = regex.exec(html)) !== null) {
      episodes.push({
        href: match[1].trim(),
        number: parseInt(match[2].trim())
      });
    }
    return JSON.stringify(episodes);
  } catch (e) {
    return JSON.stringify([]);
  }
}

async function extractStreamUrl(url) {
  try {
    const response = await fetchv2(url);
    const html = await response.text();
    const sourceMatch = html.match(/<source src="([^"]+)" type="application\/x-mpegURL"/);
    const subtitleMatches = [...html.matchAll(/<track kind="subtitles" src="([^"]+)"[^>]*>/g)];
    if (!sourceMatch) return JSON.stringify({ streams: [] });
    return JSON.stringify({
      streams: [
        {
          title: 'Default Server',
          streamUrl: sourceMatch[1].trim(),
          headers: {}
        }
      ],
      subtitles: subtitleMatches.map(m => m[1].trim())
    });
  } catch (e) {
    return JSON.stringify({ streams: [] });
  }
}