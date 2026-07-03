"use client";
import { useState, useEffect, useRef } from "react";
import {
  Heart,
  Play,
  Star,
  Users,
  Film,
  Globe,
  ArrowRight,
  ArrowUpRight,
} from "lucide-react";
import Link from "next/link";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";

const AboutUs = () => {
  const cursorRef = useRef(null);
  const [isHovering, setIsHovering] = useState(false);

  // Smooth cursor tracking
  const cursorX = useMotionValue(0);
  const cursorY = useMotionValue(0);

  // Softer spring for a fluid, organic feel
  const springConfig = { damping: 25, stiffness: 120 };
  const springX = useSpring(cursorX, springConfig);
  const springY = useSpring(cursorY, springConfig);

  useEffect(() => {
    const handleMouseMove = (e) => {
      cursorX.set(e.clientX);
      cursorY.set(e.clientY);
    };

    window.addEventListener("mousemove", handleMouseMove);

    const hoverElements = document.querySelectorAll(
      "a, button, .interactive-card"
    );
    hoverElements.forEach((el) => {
      el.addEventListener("mouseenter", () => setIsHovering(true));
      el.addEventListener("mouseleave", () => setIsHovering(false));
    });

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, [cursorX, cursorY]);

  const sectionVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: [0.22, 1, 0.36, 1], // Custom bezier for "soft" snap
      },
    },
  };

  return (
    <div className="relative min-h-screen bg-background text-foreground overflow-hidden font-sans selection:bg-primary/30">
      {/* Custom Cursor: Subtle Ring */}
      <motion.div
        ref={cursorRef}
        style={{
          position: "fixed",
          left: springX,
          top: springY,
          translateX: "-50%",
          translateY: "-50%",
          zIndex: 50,
          pointerEvents: "none",
        }}
      >
        <motion.div
          animate={{
            scale: isHovering ? 1 : 0.5,
            width: isHovering ? "3rem" : "1rem",
            height: isHovering ? "3rem" : "1rem",
            border: isHovering
              ? "1px solid var(--accent-custom)"
              : "0px solid transparent",
            backgroundColor: isHovering ? "transparent" : "var(--accent-custom)",
          }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          className="rounded-full flex items-center justify-center"
        >
          {/* Tiny dot inside the ring when hovering */}
          <motion.div
            animate={{ opacity: isHovering ? 1 : 0 }}
            className="w-1 h-1 bg-foreground rounded-full"
          />
        </motion.div>
      </motion.div>

      <div className="container mx-auto px-6 py-24 relative z-10">
        {/* Header Section */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={sectionVariants}
          className="mb-20"
        >
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-12 border-b border-border pb-12">
            <div>
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 1, delay: 0.2 }}
                className="flex items-center gap-4 mb-4"
              >
                <span className="w-12 h-[1px] bg-foreground"></span>
                <span className="text-xs font-semibold tracking-widest uppercase text-muted-foreground">
                  Established 2024
                </span>
              </motion.div>
              <h1 className="text-6xl md:text-8xl font-bold tracking-tighter leading-[0.9] text-foreground">
                Crescent<span className="text-muted-foreground">Moon</span>.
              </h1>
            </div>

            <div className="md:max-w-md">
              <p className="text-lg md:text-xl text-muted-foreground font-medium leading-relaxed">
                Curating the invisible threads between storytelling and
                audience. Cinema, redefined for the modern purist.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Floating Cards Grid */}
        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              icon: Star,
              title: "Curated",
              description:
                "Hand-picked selections ensuring quality over quantity.",
            },
            {
              icon: Users,
              title: "Community",
              description:
                "A space for dialogue, not just passive consumption.",
            },
            {
              icon: Globe,
              title: "Universal",
              description: "Cinema without borders, accessible everywhere.",
            },
          ].map((section, index) => (
            <motion.div
              key={section.title}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-50px" }}
              variants={{
                ...sectionVariants,
                visible: {
                  ...sectionVariants.visible,
                  transition: { delay: index * 0.15, duration: 0.8 },
                },
              }}
              className="interactive-card group relative bg-card rounded-3xl p-8 border border-border shadow-[0_5px_15px_-5px_rgba(0,0,0,0.02)]"
            >
              {/* Card Hover Micro-interaction */}
              <motion.div
                className="absolute inset-0 rounded-3xl bg-muted opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                layoutId={`hover-bg-${index}`}
              />

              <div className="relative z-10 flex flex-col h-full">
                <div className="flex justify-between items-start mb-10">
                  <div className="p-3 bg-muted rounded-2xl group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300">
                    <section.icon className="w-6 h-6" />
                  </div>
                  <ArrowUpRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:rotate-45 transition-all duration-300 ease-out" />
                </div>

                <div className="mt-auto">
                  <h2 className="text-2xl font-bold tracking-tight mb-3 text-foreground">
                    {section.title}
                  </h2>
                  <p className="text-muted-foreground leading-relaxed group-hover:text-foreground transition-colors duration-300">
                    {section.description}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* CTA Section */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={sectionVariants}
          className="mt-24 bg-card rounded-[2.5rem] p-12 md:p-16 text-foreground overflow-hidden relative border border-border"
        >
          {/* Subtle Background Pattern */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary rounded-full blur-[100px] opacity-10 -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>

          <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-10">
            <div className="max-w-xl">
              <h3 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">
                Ready to stream?
              </h3>
              <p className="text-muted-foreground text-lg">
                Join thousands of cinephiles discovering their next obsession.
                Start your journey with us today.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
              <Link href="/movie">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-full sm:w-auto flex items-center justify-center gap-3 px-8 py-4 bg-primary text-primary-foreground rounded-full font-bold text-lg hover:shadow-[0_0_20px_-5px_rgba(var(--primary),0.3)] transition-shadow duration-300"
                >
                  <Play className="w-5 h-5 fill-current" />
                  <span>Start Watching</span>
                </motion.button>
              </Link>

              <Link href="/contact">
                <motion.button
                  whileHover={{
                    scale: 1.05,
                    backgroundColor: "hsl(var(--muted))",
                  }}
                  whileTap={{ scale: 0.95 }}
                  className="w-full sm:w-auto flex items-center justify-center gap-3 px-8 py-4 bg-transparent border border-border text-foreground rounded-full font-bold text-lg transition-colors duration-300"
                >
                  <Heart className="w-5 h-5" />
                  <span>Join Community</span>
                </motion.button>
              </Link>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Minimal Footer */}
      <footer className="w-full py-12 px-6 border-t border-border mt-12 bg-card">
        <div className="container mx-auto flex flex-col md:flex-row justify-between items-center text-sm font-medium text-muted-foreground">
          <p className="tracking-wide">&copy; 2024 CINEMOON.</p>
          <div className="flex gap-8 mt-4 md:mt-0">
            <Link href="#" className="hover:text-primary transition-colors">
              Instagram
            </Link>
            <Link href="#" className="hover:text-primary transition-colors">
              Twitter
            </Link>
            <Link href="#" className="hover:text-primary transition-colors">
              LinkedIn
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default AboutUs;
