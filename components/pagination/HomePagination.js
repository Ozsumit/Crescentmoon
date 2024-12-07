"use client";
import React, { useMemo } from "react";

const HomePagination = ({ page, setPage, totalPages }) => {
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
    }
  };

  // Memoize page range calculation to prevent unnecessary recalculations
  const pageRange = useMemo(() => {
    const maxDisplayPages = 10;
    const halfPages = Math.floor(maxDisplayPages / 2);

    let startPage = Math.max(1, page - halfPages);
    let endPage = Math.min(totalPages, startPage + maxDisplayPages - 1);

    // Adjust start page if we're near the end
    if (endPage === totalPages) {
      startPage = Math.max(1, totalPages - maxDisplayPages + 1);
    }

    return Array.from(
      { length: Math.min(maxDisplayPages, endPage - startPage + 1) },
      (_, i) => startPage + i
    );
  }, [page, totalPages]);

  return (
    <div className="flex flex-col items-center gap-4 py-6 px-4">
      {/* Pagination Controls */}
      <div className="flex items-center gap-2 flex-wrap justify-center">
        {/* Previous Button */}
        <button
          onClick={() => handlePageChange(page - 1)}
          disabled={page <= 1}
          className={`${
            page <= 1 ? "pointer-events-none opacity-50" : "hover:bg-indigo-600"
          } bg-gray-800 px-4 py-2 rounded-md text-white transition-all ease-in-out duration-300`}
          aria-label="Previous Page"
        >
          Previous
        </button>

        {/* First Page Indicator */}
        {pageRange[0] > 1 && (
          <>
            <button
              onClick={() => handlePageChange(1)}
              className="bg-gray-800 text-gray-300 hover:bg-gray-700 px-4 py-2 rounded-md transition-all"
            >
              1
            </button>
            {pageRange[0] > 2 && (
              <span className="text-gray-500 px-2">...</span>
            )}
          </>
        )}

        {/* Page Number Links */}
        {pageRange.map((pageNumber) => (
          <button
            key={pageNumber}
            onClick={() => handlePageChange(pageNumber)}
            className={`${
              page === pageNumber
                ? "bg-indigo-600 text-white font-bold"
                : "bg-gray-800 text-gray-300 hover:bg-gray-700"
            } px-4 py-2 rounded-md transition-all ease-in-out duration-300`}
            aria-label={`Go to page ${pageNumber}`}
          >
            {pageNumber}
          </button>
        ))}

        {/* Last Page Indicator */}
        {pageRange[pageRange.length - 1] < totalPages && (
          <>
            {pageRange[pageRange.length - 1] < totalPages - 1 && (
              <span className="text-gray-500 px-2">...</span>
            )}
            <button
              onClick={() => handlePageChange(totalPages)}
              className="bg-gray-800 text-gray-300 hover:bg-gray-700 px-4 py-2 rounded-md transition-all"
            >
              {totalPages}
            </button>
          </>
        )}

        {/* Next Button */}
        <button
          onClick={() => handlePageChange(page + 1)}
          disabled={page >= totalPages}
          className={`${
            page >= totalPages
              ? "pointer-events-none opacity-50"
              : "hover:bg-indigo-600"
          } bg-gray-800 px-4 py-2 rounded-md text-white transition-all ease-in-out duration-300`}
          aria-label="Next Page"
        >
          Next
        </button>
      </div>

      {/* Page Indicator */}
      <div className="text-lg font-semibold text-indigo-600">
        Page {page} of {totalPages}
      </div>
    </div>
  );
};

export default HomePagination;
