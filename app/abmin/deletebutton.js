"use client";
import { useState } from "react";
import { deleteFeedback } from "./action";

export default function DeleteButton({ id }) {
  const [isDeleting, setIsDeleting] = useState(false);

  return (
    <button
      onClick={async () => {
        setIsDeleting(true);
        await deleteFeedback(id);
      }}
      disabled={isDeleting}
      className={`text-[10px] font-bold uppercase tracking-widest transition-all duration-300
        ${isDeleting ? "text-neutral-300 cursor-wait" : "text-neutral-400 hover:text-red-500"}
      `}
    >
      {isDeleting ? "Removing..." : "Delete"}
    </button>
  );
}
