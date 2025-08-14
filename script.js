async function extractEpisodesOrMovie(url) {
    try {
        const response = await fetch(url);
        const html = await response.text();
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, "text/html");

        // Detect if it's a movie page
        const isMovie = doc.querySelector(".movie-player") || doc.querySelector("video");

        if (isMovie) {
            // Movie: extract the direct HLS link
            const match = html.match(/https?:\/\/dl30\.darkibox\.com\/hls2\/[^\s'"]+/);
            return match ? [{ title: doc.querySelector("h1")?.textContent.trim() || "Movie", url: match[0] }] : [];
        } else {
            // TV Show: extract episodes
            const episodeElements = doc.querySelectorAll("a.episode-link");
            const episodes = [];

            episodeElements.forEach((el, index) => {
                const title = el.textContent.trim() || `Episode ${index + 1}`;
                const epUrl = el.href.startsWith("http") ? el.href : `https://movix.site${el.href}`;
                episodes.push({
                    title: title,
                    url: epUrl,
                    season: 1,
                    episode: index + 1
                });
            });

            return episodes;
        }
    } catch (err) {
        console.error("Failed to extract content:", err);
        return [];
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

        // Movies
        const movieItems = doc.querySelectorAll(".movie-item, .film-item");
        movieItems.forEach(item => {
            const titleEl = item.querySelector(".title");
            const linkEl = item.querySelector("a");
            const posterEl = item.querySelector("img");

            if (titleEl && linkEl) {
                results.push({
                    title: titleEl.textContent.trim(),
                    url: linkEl.href.startsWith("http") ? linkEl.href : `https://movix.site${linkEl.href}`,
                    type: "movie",
                    poster: posterEl ? posterEl.src : "",
                    description: item.querySelector(".description")?.textContent.trim() || ""
                });
            }
        });

        // TV Shows
        const showItems = doc.querySelectorAll(".search-result-item");
        showItems.forEach(item => {
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