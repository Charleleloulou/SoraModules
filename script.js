async function searchResults(keyword) {
    try {
        const encodedKeyword = encodeURIComponent(keyword);
        const responseText = await soraFetch(`https://movix.site/search?q=${encodedKeyword}`);
        const data = await responseText.text();

        const transformedResults = [];
        const regex = /<a href="\/watch\/([^"]+)">.*?<img src="([^"]+)" alt="([^"]+)"/g;
        let match;
        while ((match = regex.exec(data)) !== null) {
            const [, path, image, title] = match;
            transformedResults.push({
                title,
                image: image.startsWith('http') ? image : `https://movix.site${image}`,
                href: `https://movix.site/watch/${path}`
            });
        }

        return JSON.stringify(transformedResults);
    } catch (error) {
        console.error('Fetch error in searchResults:', error);
        return JSON.stringify([{ title: 'Error', image: '', href: '' }]);
    }
}

async function extractDetails(url) {
    try {
        const match = url.match(/https:\/\/movix\.site\/watch\/([^\/]+)/);
        if (!match) throw new Error("Invalid URL format");

        const movieId = match[1];
        const responseText = await soraFetch(`https://movix.site/watch/${movieId}`);
        const data = await responseText.text();

        const descriptionMatch = data.match(/<meta name="description" content="([^"]+)"/);
        const description = descriptionMatch ? descriptionMatch[1] : 'No description available';

        const aliasesMatch = data.match(/Durée: (\d+) min/);
        const aliases = aliasesMatch ? `Duration: ${aliasesMatch[1]} minutes` : 'Duration: Unknown';

        const airdateMatch = data.match(/Sortie: (\d{2}\/\d{2}\/\d{4})/);
        const airdate = airdateMatch ? `Released: ${airdateMatch[1]}` : 'Released: Unknown';

        const transformedResults = [{
            description,
            aliases,
            airdate
        }];

        return JSON.stringify(transformedResults);
    } catch (error) {
        console.error('Details error:', error);
        return JSON.stringify([{
            description: 'Error loading description',
            aliases: 'Duration: Unknown',
            airdate: 'Released: Unknown'
        }]);
    }
}

async function extractEpisodes(url) {
    try {
        const match = url.match(/https:\/\/movix\.site\/watch\/([^\/]+)/);
        if (!match) throw new Error("Invalid URL format");

        const showId = match[1];
        const responseText = await soraFetch(`https://movix.site/watch/${showId}`);
        const data = await responseText.text();

        const episodes = [];
        const episodeRegex = /<a href="\/watch\/([^"]+)">([^<]+)<\/a>/g;
        let episodeMatch;
        while ((episodeMatch = episodeRegex.exec(data)) !== null) {
            const [, path, title] = episodeMatch;
            episodes.push({
                href: `https://movix.site/watch/${path}`,
                number: episodes.length + 1,
                title
            });
        }

        return JSON.stringify(episodes);
    } catch (error) {
        console.error('Fetch error in extractEpisodes:', error);
        return JSON.stringify([]);
    }
}

async function extractStreamUrl(url) {
    try {
        const match = url.match(/https:\/\/movix\.site\/watch\/([^\/]+)/);
        if (!match) throw new Error("Invalid URL format");

        const movieId = match[1];
        const responseText = await soraFetch(`https://movix.site/watch/${movieId}`);
        const data = await responseText.text();

        const streamUrlMatch = data.match(/"file":"([^"]+)"/);
        const streamUrl = streamUrlMatch ? streamUrlMatch[1] : '';

        const subtitleUrls = [];
        const subtitleRegex = /"subtitles":\s*\[([^\]]+)\]/;
        const subtitleMatch = subtitleRegex.exec(data);
        if (subtitleMatch) {
            const subtitles = subtitleMatch[1].split(',').map(sub => sub.trim().replace(/"/g, ''));
            subtitleUrls.push(...subtitles);
        }

        const result = {
            streams: [streamUrl],
            subtitles: subtitleUrls
        };

        return JSON.stringify(result);
    } catch (error) {
        console.error('Fetch error in extractStreamUrl:', error);
        return JSON.stringify({ streams: [], subtitles: [] });
    }
}

async function soraFetch(url, options = { headers: {}, method: 'GET', body: null, encoding: 'utf-8' }) {
    try {
        return await fetchv2(
            url,
            options.headers ?? {},
            options.method ?? 'GET',
            options.body ?? null,
            true,
            options.encoding ?? 'utf-8'
        );
    } catch (e) {
        try {
            return await fetch(url, options);
        } catch (error) {
            return null;
        }
    }
}