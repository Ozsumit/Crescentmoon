export async function load({ url, fetch }) {
  const apiKey = "1c305b9b6f84cc8e1ef6a72e816a1eb1";
  const page = Number(url.searchParams.get("page")) || 1;

  try {
    const resp = await fetch(
      `https://api.themoviedb.org/3/tv/popular?api_key=${apiKey}&page=${page}&language=en-US`
    );
    if (!resp.ok) throw new Error("Failed to fetch");
    const data = await resp.json();
    return {
      series: (data.results || []).map((s) => ({ ...s, media_type: "tv" })),
      page,
      totalPages: Math.min(data.total_pages || 500, 500)
    };
  } catch (e) {
    console.error(e);
    return {
      series: [],
      page: 1,
      totalPages: 1
    };
  }
}
