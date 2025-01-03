"use client";
import React, { useState, useEffect } from "react";
import { Book, Download, Eye, ArrowLeft, Loader2, User } from "lucide-react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";

const EBookReader = () => {
  const [books, setBooks] = useState([]);
  const [selectedBook, setSelectedBook] = useState(null);
  const [bookContent, setBookContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [contentLoading, setContentLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [fontSize, setFontSize] = useState(16);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [error, setError] = useState("");

  const fetchBooks = async () => {
    setLoading(true);
    try {
      const response = await fetch("https://gutendex.com/books/");
      if (!response.ok) throw new Error("Error fetching books.");
      const data = await response.json();
      setBooks(data.results);
    } catch (err) {
      setError(err.message || "Failed to fetch books");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchBooks();
  }, []);

  const fetchBookContent = async (id) => {
    setContentLoading(true);
    try {
      const response = await fetch(`https://gutendex.com/books/${id}`);
      if (!response.ok) throw new Error("Error fetching book details.");
      const data = await response.json();

      const contentResponse = await fetch(data.formats["text/plain"]);
      if (!contentResponse.ok) throw new Error("Error fetching book content.");
      const content = await contentResponse.text();

      const cleanContent = content
        .replace(/<[^>]*>/g, "")
        .replace(/&nbsp;/g, " ")
        .replace(/&amp;/g, "&")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">");
      setBookContent(cleanContent);
      setSelectedBook({
        ...data,
        content: cleanContent,
      });
    } catch (err) {
      setError(err.message || "Failed to fetch book content");
    }
    setContentLoading(false);
  };

  const handleBookSelect = (book) => {
    setSelectedBook(book);
    fetchBookContent(book.id);
  };

  return (
    <div>
      <div
        className={`min-h-screen p-6 ${
          isDarkMode ? "bg-gray-900 text-white" : "bg-gray-50"
        }`}
      >
        <div className="max-w-6xl mt-16 mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold">EBook Reader</h1>
            <div className="flex gap-4">
              <Input
                type="text"
                placeholder="Search books..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-64"
              />
              <Button
                variant="outline"
                onClick={() => setIsDarkMode(!isDarkMode)}
              >
                {isDarkMode ? "Light Mode" : "Dark Mode"}
              </Button>
            </div>
          </div>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
              {error}
            </div>
          )}

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="w-8 h-8 animate-spin" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {books
                .filter((book) =>
                  book.title.toLowerCase().includes(searchTerm.toLowerCase())
                )
                .map((book) => (
                  <Card
                    key={book.id}
                    className={`group relative overflow-hidden transition-all duration-300 hover:shadow-xl ${
                      isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white"
                    }`}
                  >
                    <div className="relative h-64 overflow-hidden">
                      {book.formats["image/jpeg"] ? (
                        <img
                          src={book.formats["image/jpeg"]}
                          alt={book.title}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                          <Book className="w-16 h-16 text-gray-400" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    </div>

                    <CardContent className="relative -mt-20 p-6">
                      <div className="space-y-3">
                        <h3
                          className={`text-xl font-semibold line-clamp-2 ${
                            isDarkMode ? "text-white" : "text-gray-900"
                          }`}
                        >
                          {book.title}
                        </h3>

                        <div className="flex items-center gap-4 text-sm">
                          <div className="flex items-center gap-1">
                            <User className="w-4 h-4" />
                            <span className="line-clamp-1">
                              {book.authors
                                ?.map((author) => author.name)
                                .join(", ") || "Unknown"}
                            </span>
                          </div>
                        </div>

                        <p
                          className={`text-sm line-clamp-2 ${
                            isDarkMode ? "text-gray-300" : "text-gray-600"
                          }`}
                        >
                          {book.subjects?.slice(0, 3).join(", ") ||
                            "No subjects"}
                        </p>
                      </div>
                    </CardContent>

                    <CardFooter className="p-6 pt-0">
                      <div className="flex gap-2 w-full">
                        <Button
                          variant="outline"
                          className="flex-1"
                          onClick={() =>
                            window.open(book.formats["application/epub+zip"])
                          }
                        >
                          <Download className="w-4 h-4 mr-2" />
                          Download
                        </Button>
                        <Button
                          className="flex-1"
                          onClick={() => handleBookSelect(book)}
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          Read
                        </Button>
                      </div>
                    </CardFooter>
                  </Card>
                ))}
            </div>
          )}

          {selectedBook && (
            <Dialog open={true} onOpenChange={() => setSelectedBook(null)}>
              <DialogContent className="max-w-4xl h-[90vh]">
                <DialogHeader className="pb-4 border-b">
                  <DialogTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setSelectedBook(null)}
                      >
                        <ArrowLeft className="w-4 h-4" />
                      </Button>
                      <div>
                        <h2 className="text-xl font-semibold">
                          {selectedBook?.title}
                        </h2>
                        <p className="text-sm text-gray-500">
                          {selectedBook?.authors
                            ?.map((author) => author.name)
                            .join(", ")}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        className="text-sm"
                        onClick={() =>
                          setFontSize((prev) => Math.max(12, prev - 2))
                        }
                      >
                        A-
                      </Button>
                      <Button
                        variant="outline"
                        className="text-sm"
                        onClick={() =>
                          setFontSize((prev) => Math.min(30, prev + 2))
                        }
                      >
                        A+
                      </Button>
                    </div>
                  </DialogTitle>
                </DialogHeader>
                <ScrollArea
                  style={{
                    fontSize: `${fontSize}px`,
                  }}
                  className="h-[calc(90vh-4rem)] overflow-auto py-4"
                >
                  {contentLoading ? (
                    <div className="flex justify-center items-center h-full">
                      <Loader2 className="w-8 h-8 animate-spin" />
                    </div>
                  ) : (
                    <pre
                      className={`whitespace-pre-wrap leading-relaxed ${
                        isDarkMode ? "text-gray-300" : "text-gray-700"
                      }`}
                    >
                      {bookContent}
                    </pre>
                  )}
                </ScrollArea>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>
    </div>
  );
};

export default EBookReader;
