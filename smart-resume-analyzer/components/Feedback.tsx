'use client';

import React from 'react';

type ATSResult = {
  atsScore: number;
  keywordScore: number;
  sectionCompleteness?: string[];
  formattingIssues?: string[];
};

interface FeedbackDisplayProps {
  ats: ATSResult | null;
}

export default function FeedbackDisplay({ ats }: FeedbackDisplayProps) {
  if (!ats) return null;

  return (
    <div className="border p-4 mt-4 rounded-lg shadow bg-white dark:bg-neutral-900 dark:text-white">
      <h2 className="text-lg font-bold mb-2">ATS Compatibility Report</h2>
      <p><strong>ATS Score:</strong> {ats.atsScore}%</p>
      <p><strong>Keyword Match:</strong> {ats.keywordScore}%</p>

      {ats.sectionCompleteness && ats.sectionCompleteness.length > 0 && (
        <p><strong>Missing Sections:</strong> {ats.sectionCompleteness.join(', ')}</p>
      )}

      {ats.formattingIssues && ats.formattingIssues.length > 0 && (
        <>
          <p><strong>Formatting Issues:</strong></p>
          <ul className="list-disc ml-6">
            {ats.formattingIssues.map((issue, i) => (
              <li key={i}>{issue}</li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
