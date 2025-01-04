// app/page.js
"use client";
import React, { useState, useEffect } from "react";
import { Search } from "lucide-react";
import Link from "next/link";

export default function Home() {
  const [books, setBooks] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  useEffect(() => {
    fetchBooks();
  }, [page]);

  const fetchBooks = async () => {
    try {
      const response = await fetch(`https://gutendex.com/books/?page=${page}`);
      const data = await response.json();
      setBooks(data.results);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching books:", error);
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!search) return;
    setLoading(true);
    try {
      const response = await fetch(
        `https://gutendex.com/books/?search=${encodeURIComponent(search)}`
      );
      const data = await response.json();
      setBooks(data.results);
    } catch (error) {
      console.error("Error searching books:", error);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen py-16 bg-gray-100">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-gray-900">
              Kindle Store Clone
            </h1>
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search books..."
                className="px-4 py-2 border rounded-lg"
              />
              <button
                onClick={handleSearch}
                className="p-2 bg-blue-500 text-white rounded-lg"
              >
                <Search size={20} />
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        {loading ? (
          <div className="text-center">Loading...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {books.map((book) => (
              <Link href={`/audiobooks/${book.id}`} key={book.id}>
                <div className="bg-white p-4 rounded-lg shadow hover:shadow-lg transition-shadow">
                  {book.formats["image/jpeg"] && (
                    <img
                      src={book.formats["image/jpeg"]}
                      alt={book.title}
                      className="w-full h-64 object-cover rounded-lg"
                    />
                  )}
                  <h2 className="mt-4 text-lg font-semibold">{book.title}</h2>
                  <p className="text-gray-600">
                    {book.authors.map((author) => author.name).join(", ")}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}

        <div className="mt-6 flex justify-center space-x-4">
          <button
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page === 1}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg disabled:opacity-50"
          >
            Previous
          </button>
          <button
            onClick={() => setPage(page + 1)}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg"
          >
            Next
          </button>
        </div>
      </main>
    </div>
  );
}
