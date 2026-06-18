import React from 'react';
import { motion } from 'motion/react';

interface TimelinePhase {
  id: number;
  title: string;
  description: string;
  duration: string;
}

const phases: TimelinePhase[] = [
  { id: 1, title: 'Soil Preparation', description: 'Testing soil quality, clearing debris, and soil enrichment.', duration: 'Weeks 1-2' },
  { id: 2, title: 'Seedling Selection', description: 'Choosing native, climate-resilient tree species.', duration: 'Weeks 3-4' },
  { id: 3, title: 'Planting', description: 'Strategic planting and initial watering.', duration: 'Weeks 5-8' },
  { id: 4, title: 'Monitoring', description: 'Irrigation, health checks, and growth tracking.', duration: 'Ongoing' },
];

export default function Timeline() {
  return (
    <div className="py-12">
      <h3 className="text-2xl font-bold text-white mb-8">Project Timeline</h3>
      <div className="relative border-l border-emerald-500/30 ml-4 space-y-12">
        {phases.map((phase, index) => (
          <motion.div 
            key={phase.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.2 }}
            className="relative pl-8"
          >
            <div className="absolute -left-[9px] top-1.5 w-4 h-4 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
            <div className="text-emerald-400 text-sm font-mono mb-1">{phase.duration}</div>
            <h4 className="text-lg font-bold text-white mb-2">{phase.title}</h4>
            <p className="text-slate-400">{phase.description}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
