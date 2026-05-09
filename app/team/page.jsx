"use client";
import ThemeWrapper from "@/components/themewrappr";
import { Github, Twitter, Mail } from "lucide-react";
import Image from "next/image";

export default function TheTeam() {
  return (
    <ThemeWrapper>
      <div className="max-w-4xl">
        <div className="flex items-center gap-4 mb-8">
          <span className="w-12 h-[1px] bg-black"></span>
          <span className="text-xs font-semibold tracking-widest uppercase text-neutral-500">
            The "Team"
          </span>
        </div>

        <h1 className="text-5xl md:text-7xl font-bold tracking-tighter leading-[0.9] text-neutral-900 mb-16">
          One mind.
          <br /> <span className="text-neutral-400">Many hats.</span>
        </h1>

        <div className="interactive-card flex flex-col md:flex-row gap-8 bg-white p-8 md:p-12 rounded-[2.5rem] border border-neutral-100 shadow-sm">
          <div className="w-32 h-32 md:w-48 md:h-48 rounded-full bg-neutral-200 shrink-0 overflow-hidden relative">
            {/* Replace with your actual photo */}
            <div className="absolute inset-0 bg-neutral-800 flex items-center justify-center text-white text-xs tracking-widest uppercase">
              Photo
            </div>
          </div>

          <div className="flex flex-col justify-center">
            <h2 className="text-3xl font-bold mb-2">Your Name</h2>
            <p className="text-neutral-400 font-mono text-sm tracking-wider uppercase mb-6">
              Founder / Developer / Designer
            </p>
            <p className="text-neutral-600 text-lg leading-relaxed mb-8 max-w-lg">
              I am a solo developer passionate about blending beautiful UI
              design with high-performance code. Crescent is my love letter to
              cinema and modern web development.
            </p>

            <div className="flex gap-4">
              <a
                href="#"
                className="w-10 h-10 rounded-full bg-neutral-100 flex items-center justify-center hover:bg-black hover:text-white transition-colors"
              >
                <Github size={18} />
              </a>
              <a
                href="#"
                className="w-10 h-10 rounded-full bg-neutral-100 flex items-center justify-center hover:bg-black hover:text-white transition-colors"
              >
                <Twitter size={18} />
              </a>
              <a
                href="mailto:you@example.com"
                className="w-10 h-10 rounded-full bg-neutral-100 flex items-center justify-center hover:bg-black hover:text-white transition-colors"
              >
                <Mail size={18} />
              </a>
            </div>
          </div>
        </div>
      </div>
    </ThemeWrapper>
  );
}
