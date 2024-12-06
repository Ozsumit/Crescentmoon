import Link from "next/link";
import React from "react";

const MoviePagination = ({ pageid }) => {
  const pagenum = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

  // Ensure pageid is a valid number, default to 1 if invalid
  const currentPage = isNaN(Number(pageid)) ? 1 : Number(pageid);

  return (
    <div className="flex flex-col items-center gap-4 py-6 px-4">
      {/* Pagination Controls */}
      <div className="flex items-center gap-2 flex-wrap justify-center">
        {/* Previous Button */}
        <Link
          href={
            currentPage > 1 ? `/movie/popular/page/${currentPage - 1}` : "#"
          }
          className={`${
            currentPage <= 1
              ? "pointer-events-none opacity-50"
              : "hover:bg-indigo-600"
          } bg-gray-800 px-4 py-2 rounded-md text-white transition-all ease-in-out duration-300`}
          aria-label="Previous Page"
        >
          {"<"}
        </Link>

        {/* Page Number Links */}
        {pagenum.map((pageNumber) => (
          <Link
            key={pageNumber}
            href={`/movie/popular/page/${pageNumber}`}
            className={`${
              currentPage === pageNumber
                ? "bg-indigo-600 text-white font-bold"
                : "bg-gray-800 text-gray-300 hover:bg-gray-700"
            } px-4 py-2 rounded-md transition-all ease-in-out duration-300`}
            aria-label={`Go to page ${pageNumber}`}
          >
            {pageNumber}
          </Link>
        ))}

        {/* Next Button */}
        <Link
          href={
            currentPage < pagenum.length
              ? `/movie/popular/page/${currentPage + 1}`
              : "#"
          }
          className={`${
            currentPage >= pagenum.length
              ? "pointer-events-none opacity-50"
              : "hover:bg-indigo-600"
          } bg-gray-800 px-4 py-2 rounded-md text-white transition-all ease-in-out duration-300`}
          aria-label="Next Page"
        >
          {">"}
        </Link>
      </div>

      {/* Page Indicator */}
      <div className="text-lg font-semibold text-indigo-600">
        Page {currentPage} of {pagenum.length}
      </div>
    </div>
  );
};

export default MoviePagination;
