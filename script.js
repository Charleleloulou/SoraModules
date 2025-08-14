async function extractEpisodes(showUrl) {
    try {
        const response = await fetch(showUrl);
        const html = await response.text();
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, "text/html");
        
        const episodeElements = doc.querySelectorAll("a.episode-link");
        const episodes = [];

        episodeElements.forEach((el, index) => {
            const title = el.textContent.trim() || `Episode ${index + 1}`;
            const url = el.href.startsWith("http") ? el.href : `https://movix.site${el.href}`;
            episodes.push({
                title: title,
                url: url,
                season: 1,
                episode: index + 1
            });
        });

        return episodes;
    } catch (err) {
        console.error("Failed to extract episodes:", err);
        return [];
    }
}

async function extractStreamUrl(episodeUrl) {
    try {
        const response = await fetch(episodeUrl);
        const html = await response.text();
        const match = html.match(/https?:\/\/dl30\.darkibox\.com\/hls2\/[^\s'"]+/);
        return match ? match[0] : null;
    } catch (err) {
        console.error("Failed to extract stream URL:", err);
        return null;
    }
}

async function searchResults(keyword) {
    try {
        const searchUrl = `https://movix.site/search=${encodeURIComponent(keyword)}`;
        const response = await fetch(searchUrl);
        const html = await response.text();
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, "text/html");
        
        const results = [];
        const items = doc.querySelectorAll(".search-result-item");

        items.forEach(item => {
            const titleEl = item.querySelector(".title");
            const linkEl = item.querySelector("a");
            const posterEl = item.querySelector("img");

            if (titleEl && linkEl) {
                results.push({
                    title: titleEl.textContent.trim(),
                    url: linkEl.href.startsWith("http") ? linkEl.href : `https://movix.site${linkEl.href}`,
                    type: "tv",
                    poster: posterEl ? posterEl.src : "",
                    description: item.querySelector(".description")?.textContent.trim() || ""
                });
            }
        });

        return results;
    } catch (err) {
        console.error("Search failed:", err);
        return [];
    }
}