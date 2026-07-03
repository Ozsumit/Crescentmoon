"use client";
import { PageContainer } from "@/components/themewrappr";
import { Download, Image as ImageIcon } from "lucide-react";

export default function PressKit() {
  return (
    <PageContainer>
      <div className="max-w-5xl">
        <div className="flex items-center gap-4 mb-8">
          <span className="w-12 h-[1px] bg-foreground"></span>
          <span className="text-xs font-semibold tracking-widest uppercase text-muted-foreground">
            Media & Assets
          </span>
        </div>

        <h1 className="text-5xl md:text-7xl font-bold tracking-tighter leading-[0.9] text-foreground mb-16">
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
              className="interactive-card group flex items-center justify-between p-6 bg-card rounded-2xl border border-border shadow-sm cursor-pointer hover:border-primary transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  <ImageIcon size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-foreground">{asset.title}</h3>
                  <p className="text-xs text-muted-foreground mt-1">{asset.desc}</p>
                </div>
              </div>
              <div className="flex flex-col items-end gap-2">
                <Download
                  size={18}
                  className="text-muted-foreground group-hover:text-primary transition-colors"
                />
                <span className="text-[10px] font-mono text-muted-foreground uppercase">
                  {asset.type}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </PageContainer>
  );
}
