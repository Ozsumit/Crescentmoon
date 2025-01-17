import React from "react";

const GenreTag = ({ name, variant = "default" }) => {
  const variants = {
    adventure: "bg-orange-500/20 text-orange-400",
    animation: "bg-green-500/20 text-green-400",
    fantasy: "bg-purple-500/20 text-purple-400",
    default: "bg-blue-500/20 text-blue-400",
  };

  return (
    <span
      className={`px-2 py-1 rounded-full text-xs font-medium ${variants[variant]}`}
    >
      {name}
    </span>
  );
};

export default GenreTag;
