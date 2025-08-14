async function getMovies() {
  const response = await fetch('https://dl30.darkibox.com/hls2/11/00693/master.m3u8');
  const text = await response.text();
  const regex = /(https:\/\/dl30\.darkibox\.com\/hls2\/\d+\/[a-z0-9_]+\/.*?\.m3u8)/g;
  const matches = [...text.matchAll(regex)];
  const movies = matches.map((m, i) => ({
    title: `Movie ${i + 1}`,
    url: m[0],
    poster: "https://raw.githubusercontent.com/CharlesMovix/MovixModule/main/icon.png"
  }));
  return movies;
}

async function getMovieDetail(movieUrl) {
  return {
    title: movieUrl.split('/').pop(),
    description: "Streaming from Movix",
    streams: [
      {
        url: movieUrl,
        quality: "1080p",
        type: "HLS"
      }
    ],
    poster: "https://raw.githubusercontent.com/CharlesMovix/MovixModule/main/icon.png"
  };
}

async function getStream(streamUrl) {
  return {
    url: streamUrl,
    type: "HLS",
    quality: "1080p"
  };
}

async function searchMovies(query) {
  const searchResponse = await fetch(`https://movix.com/search=${encodeURIComponent(query)}`);
  const searchText = await searchResponse.text();
  const regex = /(https:\/\/dl30\.darkibox\.com\/hls2\/\d+\/[a-z0-9_]+\/.*?\.m3u8)/g;
  const matches = [...searchText.matchAll(regex)];
  return matches.map((m, i) => ({
    title: `Movie ${i + 1}`,
    url: m[0],
    poster: "https://raw.githubusercontent.com/CharlesMovix/MovixModule/main/icon.png"
  }));
}