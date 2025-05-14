"use client"

import { ChevronLeft, ChevronRight } from "lucide-react"
import { jsx } from "react/jsx-runtime"

const arrowStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: "rgba(30, 41, 59, 0.8)",
  borderRadius: "50%",
  width: "48px",
  height: "48px",
  backdropFilter: "blur(8px)",
  border: "1px solid rgba(255, 255, 255, 0.1)",
  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.3)",
  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
  zIndex: 10,
  cursor: "pointer",
}

const hoverStyle = {
  background: "rgba(37, 99, 235, 0.8)",
  transform: "scale(1.1)",
  opacity: 1,
}

export const CustomNextArrow = (props) => {
  const { className, style, onClick } = props
  return (
    <button
      className={`${className} custom-next-arrow`}
      style={{ ...arrowStyle, ...style }}
      onClick={onClick}
      aria-label="Next slide"
      onMouseOver={(e) => {
        e.currentTarget.style.background = hoverStyle.background
        e.currentTarget.style.transform = hoverStyle.transform
        e.currentTarget.style.opacity = hoverStyle.opacity
      }}
      onMouseOut={(e) => {
        e.currentTarget.style.background = arrowStyle.background
        e.currentTarget.style.transform = "scale(1)"
        e.currentTarget.style.opacity = arrowStyle.opacity
      }}
    >
      {/* <ChevronRight className="text-white" size={24} /> */}
    </button>
  )
}

export const CustomPrevArrow = (props) => {
  const { className, style, onClick } = props
  return (
    <button
      className={`${className} custom-prev-arrow`}
      style={{ ...arrowStyle, ...style }}
      onClick={onClick}
      aria-label="Previous slide"
      onMouseOver={(e) => {
        e.currentTarget.style.background = hoverStyle.background
        e.currentTarget.style.transform = hoverStyle.transform
        e.currentTarget.style.opacity = hoverStyle.opacity
      }}
      onMouseOut={(e) => {
        e.currentTarget.style.background = arrowStyle.background
        e.currentTarget.style.transform = "scale(1)"
        e.currentTarget.style.opacity = arrowStyle.opacity
      }}
    >
      {/* <ChevronLeft className="text-white" size={24} /> */}
    </button>
  )
}
