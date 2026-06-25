export const MOVIE_SERVERS = [
  {
    name: "Server 1",
    url: "https://vidsrc.me/embed/movie/",
    paramStyle: "path-slash",
    features: ["HD", "Multi-Sub"],
    description: "Primary fast streaming node",
  },
  {
    name: "vidsrc.me",
    url: "https://vidsrc.me/embed/movie/",
    paramStyle: "path-slash",
    features: ["HD"],
    description: "Stable legacy provider",
  },
  {
    name: "vidsrc.to",
    url: "https://vidsrc.to/embed/movie/",
    paramStyle: "path-slash",
    features: ["HD", "Fast"],
    description: "New fast streaming node",
  },
  {
    name: "vidsrc.pro",
    url: "https://vidsrc.pro/embed/movie/",
    paramStyle: "path-slash",
    features: ["4K", "Multi-Sub"],
    description: "Premium quality source",
  },
  {
    name: "embed.su",
    url: "https://embed.su/embed/movie/",
    paramStyle: "query",
    features: ["HD"],
    description: "Alternative mirror",
  },
];

export const TV_SERVERS = [
  {
    name: "vidking",
    url: "https://www.vidking.net/embed/tv/",
    paramStyle: "path-slash",
    icon: "Crown",
    features: ["Recommended", "Fast"],
    description: "Fast streaming with an interactive player.",
  },
  {
    name: "VidLink",
    url: "https://vidlink.pro/tv/",
    paramStyle: "path-slash",
    icon: "Play",
    features: ["Recommended"],
    description: "Fast loading with custom layout.",
  },
  {
    name: "VidAPI",
    url: "https://vaplayer.ru/embed/tv/",
    paramStyle: "path-slash",
    icon: "Webhook",
    features: ["Recommended"],
    description: "Highly stable Russian endpoint.",
  },
  {
    name: "VidSrc",
    url: "https://v2.vidsrc.me/embed/tv/",
    paramStyle: "path-slash",
    icon: "Languages",
    features: ["Multi-Language"],
    description: "Good for non-English audio files.",
  },
];
