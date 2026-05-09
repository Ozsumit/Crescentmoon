"use client";
import ThemeWrapper from "@/components/themewrappr";
import { Download, Image as ImageIcon } from "lucide-react";

export default function PressKit() {
  return (
    <ThemeWrapper>
      <div className="max-w-5xl">
        <div className="flex items-center gap-4 mb-8">
          <span className="w-12 h-[1px] bg-black"></span>
          <span className="text-xs font-semibold tracking-widest uppercase text-neutral-500">
            Media & Assets
          </span>
        </div>

        <h1 className="text-5xl md:text-7xl font-bold tracking-tighter leading-[0.9] text-neutral-900 mb-16">
          Press Kit.
        </h1>

        <div className="grid md:grid-cols-2 gap-6">
          {[
            {
              title: "Brand Logos",
              desc: "High-res SVGs and PNGs of the Crescent logo.",
              type: "ZIP, 2.4MB",
            },
            {
              title: "App Screenshots",
              desc: "Clean UI mockups for media use.",
              type: "ZIP, 14.1MB",
            },
            {
              title: "Founder Headshot",
              desc: "Official photo of the developer.",
              type: "JPG, 3.2MB",
            },
            {
              title: "Brand Guidelines",
              desc: "Colors, typography, and usage rules.",
              type: "PDF, 1.1MB",
            },
          ].map((asset, i) => (
            <div
              key={i}
              className="interactive-card group flex items-center justify-between p-6 bg-white rounded-2xl border border-neutral-100 shadow-sm cursor-pointer hover:border-black transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-neutral-100 flex items-center justify-center group-hover:bg-black group-hover:text-white transition-colors">
                  <ImageIcon size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-neutral-900">{asset.title}</h3>
                  <p className="text-xs text-neutral-500 mt-1">{asset.desc}</p>
                </div>
              </div>
              <div className="flex flex-col items-end gap-2">
                <Download
                  size={18}
                  className="text-neutral-400 group-hover:text-black transition-colors"
                />
                <span className="text-[10px] font-mono text-neutral-400 uppercase">
                  {asset.type}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </ThemeWrapper>
  );
}
