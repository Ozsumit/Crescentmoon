import Link from "next/link";
import React from "react";

const HomePagination = (props) => {
  let { pageid } = props;
  let pagenum = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

  if (isNaN(pageid) === true) {
    pageid = 1;
  }

  return (
    <div className="flex justify-center items-center list-none flex-wrap space-x-2 py-6">
      {/* Previous Button */}
      <li className="mb-0">
        <Link
          href={`/all/trending/page/${Number(pageid) - 1}`}
          className={`${
            pageid <= 1 ? "opacity-50 cursor-not-allowed" : "opacity-100"
          } bg-gray-800 p-3 rounded-md text-white hover:bg-indigo-600 transition-all ease-in-out duration-300`}
          aria-label="Previous Page"
        >
          {"<"}
        </Link>
      </li>

      {/* Page Number Links */}
      {pagenum.map((element) => (
        <li key={element} className="mb-0">
          <Link
            href={`/all/trending/page/${element}`}
            className={`${
              pageid === element
                ? "bg-indigo-600 text-white font-bold"
                : "bg-gray-800 text-gray-300"
            } p-3 rounded-md hover:bg-indigo-600 hover:text-white transition-all ease-in-out duration-300`}
            aria-label={`Page ${element}`}
          >
            {element}
          </Link>
        </li>
      ))}

      {/* Current Page Indicator */}
      <div className="mx-3 text-lg font-semibold text-indigo-600">
        Page {pageid} of {pagenum.length}
      </div>

      {/* Next Button */}
      <li className="mb-0">
        <Link
          href={`/all/trending/page/${Number(pageid) + 1}`}
          className={`${
            pageid >= pagenum.length
              ? "opacity-50 cursor-not-allowed"
              : "opacity-100"
          } bg-gray-800 p-3 rounded-md text-white hover:bg-indigo-600 transition-all ease-in-out duration-300`}
          aria-label="Next Page"
        >
          {">"}
        </Link>
      </li>
    </div>
  );
};

export default HomePagination;
