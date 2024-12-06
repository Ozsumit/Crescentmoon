"use client";
import { useState, useEffect, useRef } from "react";
import { Heart, Play, Star, Users, Film, Globe } from "lucide-react";
import Link from "next/link";
import { motion, useMotionValue, useSpring } from "framer-motion";

const AboutUs = () => {
  const cursorRef = useRef(null);
  const [isHovering, setIsHovering] = useState(false);

  // Smooth cursor tracking
  const cursorX = useMotionValue(0);
  const cursorY = useMotionValue(0);

  // Create spring-based smooth interpolation
  const springX = useSpring(cursorX, {
    damping: 30,
    stiffness: 100,
  });
  const springY = useSpring(cursorY, {
    damping: 30,
    stiffness: 100,
  });

  // Cursor movement and interaction effect
  useEffect(() => {
    const handleMouseMove = (e) => {
      cursorX.set(e.clientX) + 5;
      cursorY.set(e.clientY) + 5;
    };

    // Add event listeners to track mouse movement
    window.addEventListener("mousemove", handleMouseMove);

    // Handle hover interactions
    const hoverElements = document.querySelectorAll("a, button");
    hoverElements.forEach((el) => {
      el.addEventListener("mouseenter", () => setIsHovering(true));
      el.addEventListener("mouseleave", () => setIsHovering(false));
    });

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, [cursorX, cursorY]);

  // Animation variants for section entries
  const sectionVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut",
      },
    },
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950 text-white overflow-hidden">
      {/* Smooth Cursor */}
      <motion.div
        ref={cursorRef}
        style={{
          position: "fixed",
          left: springX,
          top: springY,
          x: "-50%",
          y: "-50%",
          zIndex: -1,
        }}
      >
        <motion.div
          animate={{
            scale: isHovering ? 1.5 : 1,
            backgroundColor: isHovering
              ? "rgba(99, 102, 241, 0.5)"
              : "rgba(99, 102, 241, 0.3)",
            width: isHovering ? "2.5rem" : "2rem",
            height: isHovering ? "2.5rem" : "2rem",
          }}
          transition={{
            type: "spring",
            stiffness: 300,
            damping: 20,
          }}
          className="rounded-full pointer-events-none blur-sm bg-indigo-500/30"
        />
      </motion.div>

      <div className="container mx-auto px-4 py-16 relative">
        {/* Animated Background Shapes */}
        <div className="absolute -top-20 -left-20 w-72 h-72 bg-indigo-600/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-20 -right-20 w-72 h-72 bg-purple-600/20 rounded-full blur-3xl animate-pulse"></div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={sectionVariants}
          className="text-center mb-16"
        >
          <h1 className="text-5xl md:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-600 mb-6 tracking-tight">
            About CineMoon
          </h1>
          <p className="text-xl text-slate-300 max-w-2xl mx-auto mb-4">
            Your ultimate destination for immersive cinematic experiences,
            bringing the magic of movies directly to your screen.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              icon: <Star className="w-12 h-12 text-yellow-400" />,
              title: "Our Mission",
              description:
                "Curating a diverse film library that celebrates storytelling across genres, making cinema accessible to all.",
            },
            {
              icon: <Users className="w-12 h-12 text-teal-400" />,
              title: "Our Community",
              description:
                "Building a global platform where movie lovers connect, share, and discover new cinematic treasures.",
            },
            {
              icon: <Globe className="w-12 h-12 text-emerald-400" />,
              title: "Global Reach",
              description:
                "Bridging cultures through the universal language of film, one stream at a time.",
            },
          ].map((section, index) => (
            <motion.div
              key={section.title}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={{
                ...sectionVariants,
                visible: {
                  ...sectionVariants.visible,
                  transition: {
                    ...sectionVariants.visible.transition,
                    delay: index * 0.2,
                  },
                },
              }}
              className="bg-slate-800/60 backdrop-blur-sm rounded-xl p-6 text-center hover:bg-slate-800/80 transition-all duration-300 transform hover:-translate-y-2 hover:shadow-2xl"
            >
              <div className="flex justify-center mb-4">{section.icon}</div>
              <h2 className="text-2xl font-semibold text-indigo-300 mb-3">
                {section.title}
              </h2>
              <p className="text-slate-300">{section.description}</p>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={sectionVariants}
          className="mt-16 text-center"
        >
          <div className="flex flex-col md:flex-row justify-center space-y-4 md:space-y-0 md:space-x-6">
            <Link
              href="/movies"
              className="flex items-center justify-center bg-gradient-to-r from-indigo-600 to-purple-700 text-white py-3 px-8 rounded-full hover:scale-105 transform transition-all shadow-lg hover:shadow-indigo-500/50"
            >
              <Play className="mr-2 w-6 h-6" /> Explore Movies
            </Link>
            <Link
              href="/contact"
              className="flex items-center justify-center bg-gradient-to-r from-emerald-600 to-teal-700 text-white py-3 px-8 rounded-full hover:scale-105 transform transition-all shadow-lg hover:shadow-emerald-500/50"
            >
              <Heart className="mr-2 w-6 h-6" /> Join Our Community
            </Link>
          </div>
        </motion.div>
      </div>

      {/* Enhanced Footer */}
      <motion.footer
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="bg-slate-800/60 backdrop-blur-sm py-6 text-center"
      >
        <p className="text-slate-400">
          &copy; 2024 Cinematic. Streaming Dreams, Worldwide.
        </p>
      </motion.footer>
    </div>
  );
};

export default AboutUs;
