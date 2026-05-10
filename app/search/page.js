import SearchClient from "./SearchClient";

export const metadata = {
  title: "Search - Cmoon",
  description:
    "Search for thousands of movies and TV shows on Cmoon. Find your next favorite content easily.",
  openGraph: {
    title: "Search Movies & TV Shows - Cmoon",
    description: "Search for thousands of movies and TV shows on Cmoon.",
    url: "https://cmoon.sumit.info.np/search",
    type: "website",
  },
};

const SearchPage = () => {
  return <SearchClient />;
};

export default SearchPage;
