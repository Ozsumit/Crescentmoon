import TvInfo from "@/components/info/TvInfo";

export async function getData(id) {
  const apiKey = process.env.NEXT_PUBLIC_TMDB_API_KEY;
  const res = await fetch(
    `https://api.themoviedb.org/3/tv/${id}?api_key=${apiKey}`,
  );

  // 1. Check for errors FIRST
  if (!res.ok) {
    throw new Error("Failed to Fetch dadfta");
  }

  const data = await res.json();

  // 2. Safely map genres
  const genreArr = data.genres?.map((element) => element.name) || [];

  return { data, genreArr, id };
}

const TvDetail = async ({ params }) => {
  // 3. Unwrap params completely
  const { id } = await params;

  // 4. Use the unwrapped `id` here (NOT params.id)
  const { data, genreArr } = await getData(id);

  return (
    <>
      <TvInfo TvDetail={data} genreArr={genreArr} id={id} />
    </>
  );
};

export default TvDetail;
