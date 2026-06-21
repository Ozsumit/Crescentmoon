"use client";
import { PageContainer } from "@/components/themewrappr";

export default function LegalLayout({ title, date, children }) {
  return (
    <PageContainer>
      <div className="max-w-3xl mx-auto">
        <div className="mb-16">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tighter text-neutral-900 mb-4">
            {title}
          </h1>
          <p className="font-mono text-xs tracking-widest uppercase text-neutral-500">
            Last Updated: {date}
          </p>
        </div>

        <div className="prose prose-neutral prose-p:text-neutral-600 prose-headings:font-bold prose-headings:tracking-tight max-w-none">
          {children}
        </div>
      </div>
    </PageContainer>
  );
}
