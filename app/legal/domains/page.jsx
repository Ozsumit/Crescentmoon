"use client";

import React, { useState } from "react";
import LegalLayout from "../LegalLayout"; // Adjust path based on your exact file tree
import { ExternalLink, Copy, Check, ShieldAlert } from "lucide-react";

export default function DomainsPage() {
  const [copiedIndex, setCopiedIndex] = useState(null);

  const mainDomain = "cmoon.sumit.info.np";

  const mirrorDomains = [
    { url: "movie.sumit.info.np", status: "Operational", speed: "Fast" },
    { url: "crescent.sumit.info.np", status: "Backup", speed: "Fast" },
    { url: "cmoonbackup.vercel.app", status: "Operational", speed: "Optimal" },
  ];

  const handleCopy = (text, index) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="mt-8 w-full bg-background text-foreground">
      <LegalLayout
        title="Official Domains & Mirrors"
        date="June 17, 2026"
        className="pt-16"
      >
        <p className="text-muted-foreground max-w-2xl leading-relaxed text-sm">
          To protect your streaming connectivity against unexpected regional ISP
          blocks or network downtime, please bookmark our official mirror list.
          Always verify you are using one of our verified portals listed below
          to keep your watchlists and favorites secure.
        </p>

        {/* PRIMARY NODE */}
        <h3 className="text-foreground uppercase font-mono tracking-wider text-xs font-bold border-b border-border pb-2 mt-10">
          01 / Primary Gateway
        </h3>
        <div className="my-6 bg-card border border-border rounded-sm p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
            <span className="font-mono text-base font-bold text-foreground tracking-wide">
              {mainDomain}
            </span>
            <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-sm bg-primary/10 text-primary border border-primary/20 font-bold">
              Main Site
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleCopy(`https://${mainDomain}`, "main")}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono font-bold uppercase tracking-wider text-muted-foreground bg-muted hover:bg-accent transition-colors rounded-sm"
            >
              {copiedIndex === "main" ? (
                <>
                  <Check size={12} className="text-emerald-600" /> Copied
                </>
              ) : (
                <>
                  <Copy size={12} className="text-muted-foreground" /> Copy URL
                </>
              )}
            </button>
            <a
              href={`https://${mainDomain}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono font-bold uppercase tracking-wider text-primary-foreground bg-primary hover:opacity-90 transition-colors rounded-sm"
            >
              Launch <ExternalLink size={12} />
            </a>
          </div>
        </div>

        {/* ALTERNATIVE MIRRORS */}
        <h3 className="text-foreground uppercase font-mono tracking-wider text-xs font-bold border-b border-border pb-2 mt-12">
          02 / Verified Failover Mirrors
        </h3>

        <div className="my-6 overflow-x-auto">
          <table className="w-full text-left font-mono text-xs border-collapse">
            <thead>
              <tr className="border-b border-border text-muted-foreground uppercase tracking-wider">
                <th className="pb-3 font-medium">Domain Mirror Network</th>
                <th className="pb-3 font-medium hidden sm:table-cell">
                  Routing Status
                </th>
                <th className="pb-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border text-foreground/80">
              {mirrorDomains.map((domain, index) => (
                <tr
                  key={domain.url}
                  className="hover:bg-muted/50 transition-colors group"
                >
                  <td className="py-4 font-bold text-foreground tracking-wide">
                    {domain.url}
                    <span className="block sm:hidden text-[9px] font-normal text-muted-foreground mt-0.5">
                      Status:{" "}
                      <span className="text-foreground font-medium">
                        {domain.status}
                      </span>
                    </span>
                  </td>
                  <td className="py-4 hidden sm:table-cell">
                    <div className="flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground group-hover:bg-foreground transition-colors" />
                      <span className="font-medium text-foreground/80">
                        {domain.status}
                      </span>
                      <span className="text-[10px] text-muted-foreground">
                        ({domain.speed})
                      </span>
                    </div>
                  </td>
                  <td className="py-4 text-right">
                    <div className="inline-flex items-center gap-2">
                      <button
                        onClick={() =>
                          handleCopy(`https://${domain.url}`, index)
                        }
                        className="p-1.5 text-muted-foreground hover:text-foreground transition-colors"
                        title="Copy URL"
                      >
                        {copiedIndex === index ? (
                          <Check size={14} className="text-emerald-600" />
                        ) : (
                          <Copy size={14} />
                        )}
                      </button>
                      <a
                        href={`https://${domain.url}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 text-muted-foreground hover:text-foreground transition-colors"
                        title="Open External Link"
                      >
                        <ExternalLink size={14} />
                      </a>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* SECURITY NOTICE */}
        <div className="mt-12 p-4 border border-destructive/20 bg-destructive/5 rounded-sm flex gap-3">
          <ShieldAlert
            size={18}
            className="text-destructive flex-shrink-0 mt-0.5"
          />
          <div className="space-y-1">
            <h4 className="text-xs font-bold font-mono uppercase text-destructive tracking-wider">
              Anti-Phishing Verification
            </h4>
            <p className="text-xs text-muted-foreground leading-relaxed font-mono">
              Any interface operating under a name similar to Crescent Moon that
              is{" "}
              <span className="text-foreground font-bold underline decoration-destructive/40 underline-offset-2">
                not listed explicitly on this registry page
              </span>{" "}
              should be considered compromised. Never enter account details or
              access key credentials on external web addresses.
            </p>
          </div>
        </div>
      </LegalLayout>
    </div>
  );
}
