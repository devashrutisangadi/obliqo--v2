'use client';

import React from 'react';
import { JobMatch, Job } from '@/lib/api';
import FitScore from './FitScore';
import DecisionBadge from './DecisionBadge';

interface JobCardProps {
    jobMatch: JobMatch;
    onClick?: (jobId: string) => void;
}

// Helper functions to normalize job field access
const getJobTitle = (job: Job): string => job.JobTitles || job.title || 'Untitled Position';
const getCompanyName = (job: Job): string => job.Company_Name || job.company || 'Unknown Company';
const getJobId = (job: Job): string => job.job_id || job.Links || `job_${Date.now()}`;
const getSkills = (job: Job): string[] => {
    if (job.Skills) return job.Skills.split(',').map(s => s.trim()).filter(s => s);
    return job.requirements || [];
};
const getStipend = (job: Job): string | null => job.Stipend || null;
const getJobLink = (job: Job): string | null => job.Links || null;

const JobCard: React.FC<JobCardProps> = ({ jobMatch, onClick }) => {
    const { job, fit_score, decision, decision_reason, explanation, competition_level, career_impact } = jobMatch;

    const handleClick = () => {
        if (onClick) {
            onClick(getJobId(job));
        }
    };

    const getCareerImpactColor = () => {
        switch (career_impact) {
            case 'Positive':
                return 'text-apply';
            case 'Negative':
                return 'text-avoid';
            default:
                return 'text-gray-400';
        }
    };

    const getCompetitionIcon = () => {
        switch (competition_level) {
            case 'Low':
                return '🟢';
            case 'Medium':
                return '🟡';
            case 'High':
                return '🔴';
            default:
                return '⚪';
        }
    };

    const skills = getSkills(job);
    const stipend = getStipend(job);

    return (
        <div
            className="glass-card p-6 hover:scale-[1.02] transition-all duration-300 cursor-pointer animate-slide-up"
            onClick={handleClick}
        >
            {/* Header */}
            <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                    <h3 className="text-xl font-bold text-white mb-2">{getJobTitle(job)}</h3>
                    <div className="flex items-center gap-2 text-gray-300">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                        <span className="font-medium">{getCompanyName(job)}</span>
                    </div>
                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-400">
                        {job.experience_required && (
                            <span>{job.experience_required}</span>
                        )}
                        {stipend && (
                            <>
                                {job.experience_required && <span>•</span>}
                                <span className="text-green-400 font-medium">{stipend}</span>
                            </>
                        )}
                    </div>
                </div>
                <FitScore score={fit_score} size="small" />
            </div>

            {/* Decision Badge */}
            <div className="mb-4">
                <DecisionBadge decision={decision} />
            </div>

            {/* Decision Reason */}
            <p className="text-sm text-gray-300 mb-4 line-clamp-2">{decision_reason}</p>

            {/* Matched Skills Preview */}
            <div className="mb-4">
                <div className="flex flex-wrap gap-2">
                    {explanation.matched_skills.slice(0, 5).map((skill, idx) => (
                        <span key={idx} className="skill-badge-matched text-xs">
                            ✓ {skill}
                        </span>
                    ))}
                    {explanation.matched_skills.length > 5 && (
                        <span className="skill-badge text-xs">
                            +{explanation.matched_skills.length - 5} more
                        </span>
                    )}
                </div>
            </div>

            {/* Meta Info */}
            <div className="flex items-center justify-between text-xs text-gray-400 pt-4 border-t border-white/10">
                <div className="flex items-center gap-3">
                    <span>Competition: {getCompetitionIcon()} {competition_level}</span>
                    <span>•</span>
                    <span className={getCareerImpactColor()}>
                        Career Impact: {career_impact}
                    </span>
                </div>
                <span className="text-purple-400 hover:text-purple-300">View Details →</span>
            </div>
        </div>
    );
};

export default JobCard;

