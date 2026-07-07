"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import React from "react";

const Pagination = ({
  pageid = 1,
  totalPages = 10,
  basePath = "/series/trending/page/",
}) => {
  const router = useRouter();
  const currentPage = isNaN(Number(pageid)) ? 1 : Number(pageid);

  const handlePageChange = (newPage) => {
    router.push(`${basePath}${newPage}`);
  };

  const renderPageLinks = () =>
    Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNumber) => (
      <Link
        key={pageNumber}
        href={`${basePath}${pageNumber}`}
        className={`${
          currentPage === pageNumber
            ? "bg-primary text-primary-foreground font-bold"
            : "bg-muted text-muted-foreground hover:bg-accent hover:text-foreground"
        } px-4 py-2 rounded-md transition-all ease-in-out duration-300 border border-border`}
        aria-label={`Go to page ${pageNumber}`}
      >
        {pageNumber}
      </Link>
    ));

  return (
    <div className="flex flex-col items-center gap-4 py-6 px-4">
      {/* Pagination Controls */}
      <div className="flex items-center gap-2 flex-wrap justify-center">
        {/* Previous Button */}
        <Link
          href={currentPage > 1 ? `${basePath}${currentPage - 1}` : "#"}
          className={`${
            currentPage <= 1
              ? "pointer-events-none opacity-50"
              : "hover:bg-primary/20"
          } bg-muted px-4 py-2 rounded-md text-foreground transition-all ease-in-out duration-300 border border-border`}
          aria-label="Previous Page"
        >
          Previous
        </Link>

        {/* Page Number Links */}
        {renderPageLinks()}

        {/* Next Button */}
        <Link
          href={
            currentPage < totalPages ? `${basePath}${currentPage + 1}` : "#"
          }
          className={`${
            currentPage >= totalPages
              ? "pointer-events-none opacity-50"
              : "hover:bg-primary/20"
          } bg-muted px-4 py-2 rounded-md text-foreground transition-all ease-in-out duration-300 border border-border`}
          aria-label="Next Page"
        >
          Next
        </Link>
      </div>

      {/* Page Indicator */}
      <div className="text-lg font-semibold text-primary">
        Page {currentPage} of {totalPages}
      </div>
    </div>
  );
};

export default Pagination;
