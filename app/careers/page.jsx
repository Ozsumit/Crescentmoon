"use client";
import ThemeWrapper from "@/components/themewrappr";
import { ArrowRight } from "lucide-react";

export default function Careers() {
  return (
    <ThemeWrapper>
      <div className="max-w-4xl">
        <div className="flex items-center gap-4 mb-8">
          <span className="w-12 h-[1px] bg-black"></span>
          <span className="text-xs font-semibold tracking-widest uppercase text-neutral-500">
            Join the Mission
          </span>
        </div>

        <h1 className="text-5xl md:text-7xl font-bold tracking-tighter leading-[0.9] text-neutral-900 mb-8">
          Careers at <br /> <span className="text-neutral-400">Crescent.</span>
        </h1>

        <div className="py-12 border-y border-neutral-200 my-12 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <h3 className="text-3xl font-bold mb-2 text-neutral-300">
              0 Open Roles
            </h3>
            <p className="text-neutral-500">
              Crescent is currently a one-person operation.
            </p>
          </div>
        </div>

        <div className="interactive-card bg-black text-white p-10 rounded-[2rem]">
          <h3 className="text-2xl font-bold mb-4">
            Want to collaborate anyway?
          </h3>
          <p className="text-neutral-400 mb-8 max-w-xl">
            While I'm not hiring full-time employees, I'm always open to
            chatting with other passionate developers, UI/UX designers, or
            writers who want to contribute or collaborate on a freelance basis.
          </p>
          <a
            href="mailto:collab@example.com"
            className="inline-flex items-center gap-3 text-sm font-bold tracking-widest uppercase hover:text-neutral-300 transition-colors"
          >
            Drop me a line <ArrowRight size={16} />
          </a>
        </div>
      </div>
    </ThemeWrapper>
  );
}
