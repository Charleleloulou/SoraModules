const BASE_URL = "https://dl30.darkibox.com/hls2/11/00693/";

function getHome() {
  const movies = [
    {
      title: "Movix Stream",
      url: `${BASE_URL}master.m3u8?t=ZeHj3QtU9Q-FlgitGWdkr1ewVC8smZrLC2uWYnm2350&s=1755190309&e=43200&f=3466548&i=0.0&sp=0&fr=96fg9jwx2apo`,
      poster: "https://movix.example.com/icon.png",
      description: "All movies and series from Movix"
    }
  ];
  return movies;
}

function getEpisodes(url) {
  const regex = /(index.*?\.m3u8)/g;
  const matches = url.match(regex) || [];
  return matches.map((m, idx) => ({
    title: `Episode ${idx + 1}`,
    url: BASE_URL + m,
    episode: idx + 1,
    season: 1,
    poster: "https://movix.example.com/icon.png"
  }));
}

function search(keyword) {
  const results = [];
  const regex = /(master|index).*?\.m3u8/g;
  const matches = keyword.match(regex) || [];
  matches.forEach((m, idx) => {
    results.push({
      title: `Result ${idx + 1} for "${keyword}"`,
      url: BASE_URL + m,
      poster: "https://movix.example.com/icon.png",
      description: "Found via search"
    });
  });
  return results;
}

function getMovie(url) {
  const regex = /(master|index.*?\.m3u8)/g;
  const matches = url.match(regex) || [];
  return matches.map((m, idx) => ({
    title: `Movie Part ${idx + 1}`,
    url: BASE_URL + m,
    poster: "https://movix.example.com/icon.png",
    description: "HLS stream"
  }));
}