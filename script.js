async function searchResults(keyword) {
    try {
        const encodedKeyword = encodeURIComponent(keyword);
        const responseText = await soraFetch(`https://movix.site/?s=${encodedKeyword}`);
        const html = await responseText.text();

        const regex = /<a[^>]+href="([^"]+)"[^>]*>\s*<img[^>]+src="([^"]+)"[^>]*>[\s\S]*?<h3[^>]*>([^<]+)<\/h3>/g;
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
    } catch (error) {
        console.log('Fetch error in searchResults:', error);
        return JSON.stringify([{ title: 'Error', image: '', href: '' }]);
    }
}

async function extractDetails(url) {
    try {
        const responseText = await soraFetch(url);
        const html = await responseText.text();

        const descriptionMatch = html.match(/<div class="synopsis">([\s\S]*?)<\/div>/);
        const description = descriptionMatch ? descriptionMatch[1].trim() : 'No description available';

        const aliasesMatch = html.match(/<div class="alternate-names">([\s\S]*?)<\/div>/);
        const aliases = aliasesMatch ? aliasesMatch[1].trim() : 'No aliases available';

        const airdateMatch = html.match(/<span class="release-date">([\s\S]*?)<\/span>/);
        const airdate = airdateMatch ? `Aired: ${airdateMatch[1].trim()}` : 'Aired: Unknown';

        const transformedResults = [{ description, aliases, airdate }];
        return JSON.stringify(transformedResults);
    } catch (error) {
        console.log('Details error:', error);
        return JSON.stringify([{
            description: 'Error loading description',
            aliases: 'Duration: Unknown',
            airdate: 'Aired/Released: Unknown'
        }]);
    }
}

async function extractEpisodes(url) {
    try {
        const responseText = await soraFetch(url);
        const html = await responseText.text();

        const regex = /<a[^>]+href="([^"]+)"[^>]*>\s*Episode\s*(\d+)<\/a>/g;
        const episodes = [];
        let match;
        while ((match = regex.exec(html)) !== null) {
            episodes.push({ href: match[1].trim(), number: parseInt(match[2], 10) });
        }

        return JSON.stringify(episodes);
    } catch (error) {
        console.log('Fetch error in extractEpisodes:', error);
        return JSON.stringify([]);
    }
}

async function extractStreamUrl(url) {
    try {
        const responseText = await soraFetch(url);
        const html = await responseText.text();

        const streamRegex = /source\s+src="([^"]+\.m3u8)"/g;
        const subtitleRegex = /<track[^>]+kind="subtitles"[^>]+src="([^"]+)"[^>]*>/g;

        const streams = [];
        let match;
        while ((match = streamRegex.exec(html)) !== null) {
            streams.push({ title: "STREAM", streamUrl: match[1].trim(), headers: { Referer: url } });
        }

        const subtitles = [];
        while ((match = subtitleRegex.exec(html)) !== null) {
            subtitles.push(match[1].trim());
        }

        const result = { streams, subtitles: subtitles.join(",") };
        return JSON.stringify(result);
    } catch (error) {
        console.log('Fetch error in extractStreamUrl:', error);
        return JSON.stringify({ streams: [], subtitles: "" });
    }
}

async function soraFetch(url, options = { headers: {}, method: 'GET', body: null }) {
    try {
        return await fetchv2(url, options.headers ?? {}, options.method ?? 'GET', options.body ?? null);
    } catch(e) {
        try { return await fetch(url, options); } catch(error) { return null; }
    }
}
