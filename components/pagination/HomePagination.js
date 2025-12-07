"use client";
import React, { useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";

const DOTS = "...";

const HomePagination = ({ page, setPage, totalPages }) => {
  const siblingCount = 1; // How many numbers to show next to current page

  const paginationRange = useMemo(() => {
    const totalPageNumbers = siblingCount + 5; // sibling + first + last + current + 2*DOTS

    // Case 1: If the number of pages is less than the page numbers we want to show in our component
    if (totalPages <= totalPageNumbers) {
      return Array.from({ length: totalPages }, (_, idx) => idx + 1);
    }

    const leftSiblingIndex = Math.max(page - siblingCount, 1);
    const rightSiblingIndex = Math.min(page + siblingCount, totalPages);

    const shouldShowLeftDots = leftSiblingIndex > 2;
    const shouldShowRightDots = rightSiblingIndex < totalPages - 2;

    const firstPageIndex = 1;
    const lastPageIndex = totalPages;

    // Case 2: No left dots to show, but rights dots to be shown
    if (!shouldShowLeftDots && shouldShowRightDots) {
      const leftItemCount = 3 + 2 * siblingCount;
      const leftRange = Array.from(
        { length: leftItemCount },
        (_, idx) => idx + 1
      );
      return [...leftRange, DOTS, totalPages];
    }

    // Case 3: No right dots to show, but left dots to be shown
    if (shouldShowLeftDots && !shouldShowRightDots) {
      const rightItemCount = 3 + 2 * siblingCount;
      const rightRange = Array.from(
        { length: rightItemCount },
        (_, idx) => totalPages - rightItemCount + idx + 1
      );
      return [firstPageIndex, DOTS, ...rightRange];
    }

    // Case 4: Both left and right dots to be shown
    if (shouldShowLeftDots && shouldShowRightDots) {
      const middleRange = Array.from(
        { length: rightSiblingIndex - leftSiblingIndex + 1 },
        (_, idx) => leftSiblingIndex + idx
      );
      return [firstPageIndex, DOTS, ...middleRange, DOTS, lastPageIndex];
    }
  }, [totalPages, page, siblingCount]);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages && newPage !== page) {
      window.scrollTo({ top: 0, behavior: "smooth" }); // Scroll to top on change
      setPage(newPage);
    }
  };

  if (totalPages === 0) return null;

  return (
    <div className="w-full flex flex-col items-center gap-6 py-12 px-4">
      {/* --- PAGINATION DOCK --- */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        whileInView={{ y: 0, opacity: 1 }}
        viewport={{ once: true }}
        className="
          flex items-center gap-2 p-2 
          bg-[#1a1a1a]/80 backdrop-blur-xl border border-white/10 
          rounded-full shadow-2xl
        "
      >
        {/* PREV BUTTON */}
        <PaginationButton
          onClick={() => handlePageChange(page - 1)}
          disabled={page === 1}
          variant="secondary"
        >
          <ChevronLeft size={20} />
          <span className="hidden sm:inline pr-1">Prev</span>
        </PaginationButton>

        {/* NUMBER ROW (Hidden on very small screens) */}
        <div className="hidden sm:flex items-center gap-1 px-2 border-l border-r border-white/5 mx-1">
          <AnimatePresence mode="popLayout">
            {paginationRange?.map((pageNumber, index) => {
              if (pageNumber === DOTS) {
                return (
                  <div
                    key={`dots-${index}`}
                    className="w-8 flex justify-center text-neutral-500"
                  >
                    <MoreHorizontal size={16} />
                  </div>
                );
              }

              return (
                <PaginationNumber
                  key={pageNumber}
                  active={pageNumber === page}
                  onClick={() => handlePageChange(pageNumber)}
                >
                  {pageNumber}
                </PaginationNumber>
              );
            })}
          </AnimatePresence>
        </div>

        {/* MOBILE PAGE INDICATOR (Replaces numbers on mobile) */}
        <div className="sm:hidden px-4 font-mono text-xs text-neutral-400">
          <span className="text-white font-bold">{page}</span> / {totalPages}
        </div>

        {/* NEXT BUTTON */}
        <PaginationButton
          onClick={() => handlePageChange(page + 1)}
          disabled={page === totalPages}
          variant="primary"
        >
          <span className="hidden sm:inline pl-1">Next</span>
          <ChevronRight size={20} />
        </PaginationButton>
      </motion.div>

      {/* --- PROGRESS INDICATOR (Bottom) --- */}
      <div className="flex flex-col items-center gap-2">
        <span className="text-xs font-mono text-neutral-500 tracking-widest uppercase">
          Viewing Page {page} of {totalPages}
        </span>
        {/* Simple Progress Bar */}
        <div className="w-32 h-1 bg-white/10 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-[#c3f0c2]"
            initial={{ width: 0 }}
            animate={{ width: `${(page / totalPages) * 100}%` }}
            transition={{ type: "spring", stiffness: 100, damping: 20 }}
          />
        </div>
      </div>
    </div>
  );
};

// --- SUB-COMPONENTS ---

const PaginationButton = ({
  children,
  onClick,
  disabled,
  variant = "primary",
}) => {
  return (
    <motion.button
      whileHover={!disabled ? { scale: 1.05 } : {}}
      whileTap={!disabled ? { scale: 0.95 } : {}}
      onClick={onClick}
      disabled={disabled}
      className={`
        flex items-center justify-center gap-1.5 h-10 sm:h-12 px-2 sm:px-5 rounded-full text-sm font-bold tracking-wide transition-colors
        ${disabled ? "opacity-30 cursor-not-allowed" : "cursor-pointer"}
        ${
          variant === "primary"
            ? "bg-white text-black hover:bg-[#c3f0c2]" // "Material You" Green Accent
            : "bg-transparent text-white hover:bg-white/10"
        }
      `}
    >
      {children}
    </motion.button>
  );
};

const PaginationNumber = ({ children, active, onClick }) => {
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      animate={{
        backgroundColor: active ? "#c3f0c2" : "transparent",
        color: active ? "#000000" : "#a3a3a3",
      }}
      className={`
        relative w-10 h-10 sm:w-11 sm:h-11 flex items-center justify-center rounded-full text-sm font-bold font-mono transition-colors
        hover:text-white
      `}
    >
      {/* Active Indicator Dot (Optional Flair) */}
      {active && (
        <motion.div
          layoutId="active-dot"
          className="absolute -bottom-1 w-1 h-1 bg-white rounded-full sm:hidden"
        />
      )}
      {children}
    </motion.button>
  );
};

export default HomePagination;
