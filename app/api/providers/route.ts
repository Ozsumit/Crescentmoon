import { NextResponse } from "next/server";

const ALLOWED_PROVIDER_IDS = [8, 119, 337, 15, 350, 1899, 384];

export async function GET() {
  const res = await fetch(
    `https://api.themoviedb.org/3/watch/providers/movie?api_key=${process.env.TMDB_API_KEY}`,
  );

  const data = await res.json();

  const providers = data.results
    .filter((p: any) => ALLOWED_PROVIDER_IDS.includes(p.provider_id))
    .sort(
      (a: any, b: any) =>
        ALLOWED_PROVIDER_IDS.indexOf(a.provider_id) -
        ALLOWED_PROVIDER_IDS.indexOf(b.provider_id),
    );

  return NextResponse.json(providers);
}
