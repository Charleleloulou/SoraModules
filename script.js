/**
 * MOVIX Adapter
 * Fetch data from https://movix.site
 */

async function soraFetch(url) {
    // Generic fetch wrapper
    return await fetch(url, {
        headers: { 'User-Agent': 'Mozilla/5.0' }
    });
}

// 1. Search movies/series
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

// 2. Extract movie/series details
async function extractDetails(url) {
    try {
        const match = url.match(/https:\/\/movix\.site\/watch\/([^\/]+)/);
        if (!match) throw new Error("Invalid URL format");

        const movieId = match[1];
        const responseText = await soraFetch(`https://movix.site/watch/${movieId}`);
        const data = await responseText.text();

        const descriptionMatch = data.match(/<meta name="description" content="([^"]+)"/);
        const description = descriptionMatch ? descriptionMatch[1] : 'No description available';

        const durationMatch = data.match(/Durée: (\d+) min/);
        const duration = durationMatch ? `Duration: ${durationMatch[1]} minutes` : 'Duration: Unknown';

        const airdateMatch = data.match(/Sortie: (\d{2}\/\d{2}\/\d{4})/);
        const airdate = airdateMatch ? `Released: ${airdateMatch[1]}` : 'Released: Unknown';

        const transformedResults = [{
            description,
            duration,
            airdate
        }];

        return JSON.stringify(transformedResults);
    } catch (error) {
        console.error('Details error:', error);
        return JSON.stringify([{
            description: 'Error loading description',
            duration: 'Duration: Unknown',
            airdate: 'Released: Unknown'
        }]);
    }
}

// 3. Extract episodes for series
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

// 4. Extract streaming URL
async function extractStreamUrl(url) {
    try {
        const match = url.match(/https:\/\/movix\.site\/watch\/([^\/]+)/);
        if (!match) throw new Error("Invalid URL format");

        const movieId = match[1];
        const responseText = await soraFetch(`https://movix.site/watch/${movieId}`);
        const data = await responseText.text();

        const streamMatch = data.match(/<source src="([^"]+)" type="video\/mp4"/);
        const streamUrl = streamMatch ? streamMatch[1] : '';

        return JSON.stringify({ url: streamUrl });
    } catch (error) {
        console.error('Stream URL error:', error);
        return JSON.stringify({ url: '' });
    }
}
