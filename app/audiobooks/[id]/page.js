"use client";
import React, { useState, useEffect, useRef } from "react";
import {
  Download,
  Book,
  ChevronLeft,
  ChevronRight,
  Settings,
  Sun,
  Moon,
  X,
} from "lucide-react";
import DOMPurify from 'isomorphic-dompurify';

export default function BookDetail({ params }) {
  const [book, setBook] = useState(null);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [readMode, setReadMode] = useState(false);
  const [fontSize, setFontSize] = useState(16);
  const [darkMode, setDarkMode] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [showSettings, setShowSettings] = useState(false);
  const [availableFormats, setAvailableFormats] = useState([]);
  const readerRef = useRef(null);

  const processFormats = (formats) => {
    const validFormats = [];
    const formatMap = {
      "text/plain": "text",
      "text/plain; charset=utf-8": "text",
      "text/plain; charset=us-ascii": "text",
      "text/html": "html",
      "text/html; charset=utf-8": "html",
      "application/epub+zip": "epub",
      "application/pdf": "pdf",
      "application/x-mobipocket-ebook": "mobi"
    };

    Object.entries(formats).forEach(([mimeType, url]) => {
      if (formatMap[mimeType] && url) {
        validFormats.push({
          type: formatMap[mimeType],
          url: url.replace(/^http:/, "https:"),
          mimeType
        });
      }
    });

    return validFormats;
  };

  useEffect(() => {
    fetchBookDetails();
  }, [params.id]);

  const fetchBookDetails = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`https://gutendex.com/books/${params.id}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch book: ${response.statusText}`);
      }
      const data = await response.json();
      setBook(data);
      setAvailableFormats(processFormats(data.formats));
    } catch (error) {
      console.error("Error fetching book details:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchBookContent = async () => {
    const textFormat = availableFormats.find(f => f.type === "text");
    const htmlFormat = availableFormats.find(f => f.type === "html");
    
    if (!textFormat && !htmlFormat) {
      setError("No readable format available for this book");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Try HTML format first if available
      if (htmlFormat) {
        const response = await fetch(htmlFormat.url);
        if (!response.ok) throw new Error("Failed to fetch book content");
        
        let html = await response.text();
        html = DOMPurify.sanitize(html);
        
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = html;
        
        // Remove scripts and styles
        tempDiv.querySelectorAll('script, style').forEach(el => el.remove());
        
        // Try to find the main content
        const mainContent = 
          tempDiv.querySelector('main') || 
          tempDiv.querySelector('#main') || 
          tempDiv.querySelector('.main') ||
          tempDiv.querySelector('body') || 
          tempDiv;

        let text = mainContent.textContent || mainContent.innerText;
        
        // Clean up the text
        text = text
          .replace(/\r\n/g, '\n')
          .replace(/\n\n+/g, '\n\n')
          .replace(/[\u0000-\u0008\u000B-\u000C\u000E-\u001F\u007F-\u009F]/g, '')
          .trim();
        
        setContent(text);
        setReadMode(true);
        setCurrentPage(1);
        return;
      }
      
      // Fallback to plain text
      if (textFormat) {
        const response = await fetch(textFormat.url);
        if (!response.ok) throw new Error("Failed to fetch book content");
        
        let text = await response.text();
        text = text
          .replace(/\r\n/g, '\n')
          .replace(/\n\n+/g, '\n\n')
          .replace(/[\u0000-\u0008\u000B-\u000C\u000E-\u001F\u007F-\u009F]/g, '')
          .trim();
        
        setContent(text);
        setReadMode(true);
        setCurrentPage(1);
      }
    } catch (error) {
      console.error("Error fetching book content:", error);
      setError(`Failed to load book content: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const downloadBook = async (format) => {
    const selectedFormat = availableFormats.find((f) => f.type === format);
    if (!selectedFormat) {
      setError(`Format ${format} not available`);
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(selectedFormat.url);
      if (!response.ok) {
        throw new Error(`Failed to download ${format} format`);
      }
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${book.title.replace(/[/\\?%*:|"<>]/g, "-")}.${format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading book:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const calculatePages = () => {
    if (!readerRef.current) return 1;
    const height = readerRef.current.clientHeight;
    const scrollHeight = readerRef.current.scrollHeight;
    return Math.max(1, Math.ceil(scrollHeight / height));
  };

  const handlePageChange = (direction) => {
    if (!readerRef.current) return;

    const height = readerRef.current.clientHeight;
    const totalPages = calculatePages();
    const newPage = direction === "next" ? currentPage + 1 : currentPage - 1;

    if (newPage > 0 && newPage <= totalPages) {
      readerRef.current.scrollTop = (newPage - 1) * height;
      setCurrentPage(newPage);
    }
  };

  useEffect(() => {
    if (!readMode) return;

    const handleKeyPress = (e) => {
      if (e.key === "ArrowRight") {
        handlePageChange("next");
      } else if (e.key === "ArrowLeft") {
        handlePageChange("prev");
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [readMode, currentPage]);

  useEffect(() => {
    const savedFontSize = localStorage.getItem("readerFontSize");
    const savedDarkMode = localStorage.getItem("readerDarkMode");
    
    if (savedFontSize) setFontSize(Number(savedFontSize));
    if (savedDarkMode) setDarkMode(savedDarkMode === "true");
  }, []);

  useEffect(() => {
    localStorage.setItem("readerFontSize", fontSize);
    localStorage.setItem("readerDarkMode", darkMode);
  }, [fontSize, darkMode]);

  const ReaderSettings = () => (
    <div className="fixed top-4 right-4 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg z-20">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold">Reader Settings</h3>
        <button 
          onClick={() => setShowSettings(false)}
          className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
        >
          <X size={20} />
        </button>
      </div>
      <div className="space-y-4">
        <div>
          <label className="block mb-2">Font Size ({fontSize}px)</label>
          <input
            type="range"
            min="12"
            max="24"
            value={fontSize}
            onChange={(e) => setFontSize(Number(e.target.value))}
            className="w-full"
          />
        </div>
        <button
          onClick={() => setDarkMode(!darkMode)}
          className="flex items-center space-x-2 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded w-full"
        >
          {darkMode ? <Sun size={20} /> : <Moon size={20} />}
          <span>{darkMode ? "Light Mode" : "Dark Mode"}</span>
        </button>
      </div>
    </div>
  );

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500 mb-4">{error}</p>
        <button
          onClick={fetchBookDetails}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (loading && !readMode) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!book) {
    return <div className="text-center py-8">Book not found</div>;
  }

  if (readMode) {
    return (
      <div
        className={`min-h-screen ${
          darkMode ? "bg-gray-900 text-gray-100" : "bg-gray-50 text-gray-900"
        }`}
      >
        {/* Reader Header */}
        <div className="fixed top-0 left-0 right-0 bg-white dark:bg-gray-800 shadow z-10">
          <div className="max-w-4xl mx-auto px-4 py-2 flex items-center justify-between">
            <button
              onClick={() => {
                setReadMode(false);
                setContent("");
              }}
              className="flex items-center space-x-2 text-blue-500 hover:text-blue-600"
            >
              <ChevronLeft size={20} />
              <span>Back to Details</span>
            </button>
            <div className="text-sm">
              Page {currentPage} of {calculatePages()}
            </div>
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
              aria-label="Settings"
            >
              <Settings size={20} />
            </button>
          </div>
        </div>

        {/* Reader Content */}
        <div className="max-w-4xl mx-auto px-4 pt-16 pb-20">
          <div
            ref={readerRef}
            className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg min-h-screen"
            style={{
              fontSize: `${fontSize}px`,
              lineHeight: "1.8",
              height: "calc(100vh - 8rem)",
              overflow: "auto",
            }}
          >
            {loading ? (
              <div className="flex justify-center items-center h-full">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
              </div>
            ) : (
              <pre className="whitespace-pre-wrap font-serif">{content}</pre>
            )}
          </div>
        </div>

        {/* Reader Navigation */}
        <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 shadow-lg">
          <div className="max-w-4xl mx-auto px-4 py-4 flex justify-between">
            <button
              onClick={() => handlePageChange("prev")}
              disabled={currentPage === 1}
              className="p-2 disabled:opacity-50 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
              aria-label="Previous Page"
            >
              <ChevronLeft size={24} />
            </button>
            <button
              onClick={() => handlePageChange("next")}
              disabled={currentPage === calculatePages()}
              className="p-2 disabled:opacity-50 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
              aria-label="Next Page"
            >
              <ChevronRight size={24} />
            </button>
          </div>
        </div>

        {showSettings && <ReaderSettings />}
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {book.formats["image/jpeg"] && (
            <div className="aspect-w-3 aspect-h-4">
              <img
                src={book.formats["image/jpeg"]}
                alt={book.title}
                className="w-full h-full object-cover rounded-lg shadow"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "/placeholder-book.png";
                }}
              />
            </div>
          )}
          <div>
            <h1 className="text-3xl font-bold mb-4">{book.title}</h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-4">
              {book.authors.map((author) => author.name).join(", ")}
            </p>
            <div className="space-y-4">
              <button
                onClick={fetchBookContent}
                className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
              >
                <Book size={20} />
                <span>Read Online</span>
              </button>

              {availableFormats.map((format) =>
                format.type !== "text" && format.type !== "html" ? (
                  <button
                  key={format.type}
                  onClick={() => downloadBook(format.type)}
                  className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
                >
                  <Download size={20} />
                  <span>Download {format.type.toUpperCase()}</span>
                </button>
              ) : null
            )}
          </div>

          <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <h3 className="text-lg font-semibold mb-2">Available Formats</h3>
            <div className="flex flex-wrap gap-2">
              {availableFormats.map((format) => (
                <span
                  key={format.type}
                  className="px-2 py-1 bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-100 rounded text-sm"
                >
                  {format.type.toUpperCase()}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-4">About this book</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-semibold mb-2">Details</h3>
            <dl className="space-y-2">
              <div>
                <dt className="text-gray-500 dark:text-gray-400">Languages</dt>
                <dd className="text-gray-900 dark:text-gray-100">
                  {book.languages.map(lang => lang.toUpperCase()).join(", ")}
                </dd>
              </div>
              <div>
                <dt className="text-gray-500 dark:text-gray-400">Downloads</dt>
                <dd className="text-gray-900 dark:text-gray-100">
                  {book.download_count.toLocaleString()}
                </dd>
              </div>
              {book.subjects && book.subjects.length > 0 && (
                <div>
                  <dt className="text-gray-500 dark:text-gray-400">Subjects</dt>
                  <dd className="text-gray-900 dark:text-gray-100">
                    {book.subjects.join(", ")}
                  </dd>
                </div>
              )}
              {book.bookshelves && book.bookshelves.length > 0 && (
                <div>
                  <dt className="text-gray-500 dark:text-gray-400">Bookshelves</dt>
                  <dd className="text-gray-900 dark:text-gray-100">
                    {book.bookshelves.join(", ")}
                  </dd>
                </div>
              )}
            </dl>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-2">Copyright</h3>
            <p className="text-gray-600 dark:text-gray-300">
              {book.copyright ? `Copyright: ${book.copyright}` : "This book is in the public domain in the United States and possibly other countries."}
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
);
}