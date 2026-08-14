"use client";

import React from "react";
import {
  FileText,
  ShieldCheck,
  Calendar,
  DollarSign,
  Clipboard,
  Hash,
  Activity,
  Clock
} from "lucide-react";
import { motion } from "framer-motion";

const DetailRow = ({ icon: Icon, label, value, colorClass = "text-primary" }) => (
  <div className="flex items-center justify-between py-4 border-b border-neutral-100 dark:border-neutral-800 last:border-0 group">
    <div className="flex items-center gap-3">
      <div className={`p-2 rounded-lg bg-opacity-10 ${colorClass} bg-current`}>
        <Icon size={14} />
      </div>
      <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
        {label}
      </span>
    </div>
    <span className="text-sm font-black text-neutral-900 dark:text-neutral-100 tracking-tight">
      {value}
    </span>
  </div>
);

const DetailSection = ({ title, icon: Icon, children }) => (
  <div className="bg-white dark:bg-[#161618] border border-neutral-200 dark:border-neutral-800 rounded-[2rem] p-8 shadow-sm hover:shadow-md transition-all duration-300">
    <div className="flex items-center gap-3 mb-8">
      <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-500 border border-indigo-500/20">
        <Icon size={20} />
      </div>
      <h3 className="text-xl font-black tracking-tight text-neutral-900 dark:text-neutral-50">
        {title}
      </h3>
    </div>
    <div className="space-y-1">
      {children}
    </div>
  </div>
);

const ContractInfo = () => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
      {/* Plan Details */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <DetailSection title="Plan Details" icon={Clipboard}>
          <DetailRow icon={Activity} label="Plan Type" value="Enterprise Gold" />
          <DetailRow icon={ShieldCheck} label="Plan Status" value="Active" colorClass="text-emerald-500" />
          <DetailRow icon={Calendar} label="Start Date" value="Jan 01, 2024" colorClass="text-sky-500" />
          <DetailRow icon={Clock} label="End Date" value="Dec 31, 2024" colorClass="text-rose-500" />
          <DetailRow icon={DollarSign} label="Total Plan Value" value="$12,500.00" colorClass="text-amber-500" />
          <div className="mt-6 p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-100 dark:border-neutral-800">
            <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 dark:text-neutral-500 block mb-2">
              Notes
            </span>
            <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed font-medium">
              Annual premium partnership plan. Includes priority support, unlimited API nodes, and custom domain integration.
            </p>
          </div>
        </DetailSection>
      </motion.div>

      {/* Contract Details */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <DetailSection title="Contract Details" icon={FileText}>
          <DetailRow icon={Hash} label="Contract Number" value="CON-2024-8842" />
          <DetailRow icon={ShieldCheck} label="Contract Status" value="Signed & Executed" colorClass="text-emerald-500" />
          <DetailRow icon={Calendar} label="Sign Date" value="Dec 15, 2023" colorClass="text-sky-500" />
          <DetailRow icon={Activity} label="Effective Date" value="Jan 01, 2024" colorClass="text-indigo-500" />
          <DetailRow icon={Clock} label="Expiration Date" value="Dec 31, 2024" colorClass="text-rose-500" />
          <DetailRow icon={DollarSign} label="Contract Value" value="$12,500.00" colorClass="text-amber-500" />
        </DetailSection>
      </motion.div>
    </div>
  );
};

export default ContractInfo;
