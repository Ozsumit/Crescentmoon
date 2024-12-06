"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React from "react";

const HomePagination = ({ pageid }) => {
  const router = useRouter();

  // Ensure pageid is a number, default to 1 if invalid
  const currentPage = isNaN(Number(pageid)) ? 1 : Number(pageid);

  // Fixed number of pages
  const totalPages = 10;

  const handlePageChange = (newPage) => {
    router.push(`/all/trending/page/${newPage}`);
  };

  return (
    <div className="flex flex-col items-center gap-4 py-6 px-4">
      {/* Pagination Controls */}
      <div className="flex items-center gap-2 flex-wrap justify-center">
        {/* Previous Button */}
        <Link
          href={currentPage > 1 ? `/all/trending/page/${currentPage - 1}` : "#"}
          className={`${
            currentPage <= 1
              ? "pointer-events-none opacity-50"
              : "hover:bg-indigo-600"
          } bg-gray-800 px-4 py-2 rounded-md text-white transition-all ease-in-out duration-300`}
          aria-label="Previous Page"
        >
          Previous
        </Link>

        {/* Page Number Links */}
        {Array.from({ length: totalPages }, (_, i) => i + 1).map(
          (pageNumber) => (
            <Link
              key={pageNumber}
              href={`/all/trending/page/${pageNumber}`}
              className={`${
                currentPage === pageNumber
                  ? "bg-indigo-600 text-white font-bold"
                  : "bg-gray-800 text-gray-300 hover:bg-gray-700"
              } px-4 py-2 rounded-md transition-all ease-in-out duration-300`}
              aria-label={`Go to page ${pageNumber}`}
            >
              {pageNumber}
            </Link>
          )
        )}

        {/* Next Button */}
        <Link
          href={
            currentPage < totalPages
              ? `/all/trending/page/${currentPage + 1}`
              : "#"
          }
          className={`${
            currentPage >= totalPages
              ? "pointer-events-none opacity-50"
              : "hover:bg-indigo-600"
          } bg-gray-800 px-4 py-2 rounded-md text-white transition-all ease-in-out duration-300`}
          aria-label="Next Page"
        >
          Next
        </Link>
      </div>

      {/* Page Indicator */}
      <div className="text-lg font-semibold text-indigo-600">
        Page {currentPage} of {totalPages}
      </div>
    </div>
  );
};

export default HomePagination;
