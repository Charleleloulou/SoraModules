async function getMovies() {
    return [
        {
            title: "Sample Movie 1 (ENG)",
            url: "https://dl30.darkibox.com/hls2/11/00693/master.m3u8?t=ZeHj3QtU9Q-FlgitGWdkr1ewVC8smZrLC2uWYnm2350&s=1755190309&e=43200&f=3466548&i=0.0&sp=0&fr=96fg9jwx2apo",
            type: "movie",
            poster: "https://raw.githubusercontent.com/YourGitHubUser/Movix-Sora/main/sample1.jpg",
            description: "English version of Sample Movie 1"
        },
        {
            title: "Sample Movie 1 (FRE)",
            url: "https://dl30.darkibox.com/hls2/11/00693/96fg9jwx2apo_fre/master.m3u8?t=ZeHj3QtU9Q-FlgitGWdkr1ewVC8smZrLC2uWYnm2350&s=1755190309&e=43200&f=3466548&i=0.0&sp=0&fr=96fg9jwx2apo",
            type: "movie",
            poster: "https://raw.githubusercontent.com/YourGitHubUser/Movix-Sora/main/sample1.jpg",
            description: "French version of Sample Movie 1"
        }
    ]
}

async function searchMovies(keyword) {
    const allMovies = await getMovies()
    return allMovies.filter(m => m.title.toLowerCase().includes(keyword.toLowerCase()))
}