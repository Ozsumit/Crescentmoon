"use client";
import { PageContainer } from "@/components/themewrappr";
import { Github, Twitter, Mail } from "lucide-react";
import Image from "next/image";

export default function TheTeam() {
  return (
    <PageContainer>
      <div className="max-w-4xl">
        <div className="flex items-center gap-4 mb-8">
          <span className="w-12 h-[1px] bg-foreground"></span>
          <span className="text-xs font-semibold tracking-widest uppercase text-muted-foreground">
            The "Team"
          </span>
        </div>

        <h1 className="text-5xl md:text-7xl font-bold tracking-tighter leading-[0.9] text-foreground mb-16">
          One mind.
          <br /> <span className="text-muted-foreground">Many hats.</span>
        </h1>

        <div className="interactive-card flex flex-col md:flex-row gap-8 bg-card p-8 md:p-12 rounded-[2.5rem] border border-border shadow-sm">
          <div className="w-32 h-32 md:w-48 md:h-48 rounded-full bg-muted shrink-0 overflow-hidden relative">
            {/* Replace with your actual photo */}
            <div className="absolute inset-0 bg-accent flex items-center justify-center text-accent-foreground text-xs tracking-widest uppercase">
              Photo
            </div>
          </div>

          <div className="flex flex-col justify-center text-foreground">
            <h2 className="text-3xl font-bold mb-2">Sumit Pokhrel</h2>
            <p className="text-muted-foreground font-mono text-sm tracking-wider uppercase mb-6">
              Founder / Developer / Designer
            </p>
            <p className="text-muted-foreground text-lg leading-relaxed mb-8 max-w-lg">
              I am a solo developer passionate about blending beautiful UI
              design with high-performance code. Crescent is my love letter to
              cinema and modern web development.
            </p>

            <div className="flex gap-4">
              <a
                href="https://github.com/ozsumit"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-muted flex items-center justify-center hover:bg-foreground hover:text-background transition-colors"
              >
                <Github size={18} />
              </a>
              <a
                href="#"
                className="w-10 h-10 rounded-full bg-muted flex items-center justify-center hover:bg-foreground hover:text-background transition-colors"
              >
                <Twitter size={18} />
              </a>
              <a
                href="mailto:sumitp@sumit.info.np"
                className="w-10 h-10 rounded-full bg-muted flex items-center justify-center hover:bg-foreground hover:text-background transition-colors"
              >
                <Mail size={18} />
              </a>
            </div>
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
