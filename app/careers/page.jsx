"use client";
import { PageContainer } from "@/components/themewrappr";
import { ArrowRight } from "lucide-react";

export default function Careers() {
  return (
    <PageContainer>
      <div className="max-w-4xl">
        <div className="flex items-center gap-4 mb-8">
          <span className="w-12 h-[1px] bg-foreground"></span>
          <span className="text-xs font-semibold tracking-widest uppercase text-muted-foreground">
            Join the Mission
          </span>
        </div>

        <h1 className="text-5xl md:text-7xl font-bold tracking-tighter leading-[0.9] text-foreground mb-8">
          Careers at <br /> <span className="text-muted-foreground">Crescent.</span>
        </h1>

        <div className="py-12 border-y border-border my-12 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <h3 className="text-3xl font-bold mb-2 text-muted-foreground/50">
              0 Open Roles
            </h3>
            <p className="text-muted-foreground">
              Crescent is currently a one-person operation.
            </p>
          </div>
        </div>

        <div className="interactive-card bg-primary text-primary-foreground p-10 rounded-[2rem]">
          <h3 className="text-2xl font-bold mb-4">
            Want to collaborate anyway?
          </h3>
          <p className="text-primary-foreground/70 mb-8 max-w-xl">
            While I'm not hiring full-time employees, I'm always open to
            chatting with other passionate developers, UI/UX designers, or
            writers who want to contribute or collaborate on a freelance basis.
          </p>
          <a
            href="mailto:sumitp@sumit.info.np"
            className="inline-flex items-center gap-3 text-sm font-bold tracking-widest uppercase hover:opacity-80 transition-colors"
          >
            Drop me a line <ArrowRight size={16} />
          </a>
        </div>
      </div>
    </PageContainer>
  );
}
