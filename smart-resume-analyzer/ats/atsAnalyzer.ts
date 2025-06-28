interface ATSFeedback {
  keywordScore: number;
  sectionCompleteness: string[];
  formattingIssues: string[];
  atsScore: number;
}

export function analyzeATS(text: string, jobDescription: string): ATSFeedback {
  const keywords = extractKeywords(jobDescription);
  const matched = keywords.filter(k => text.toLowerCase().includes(k.toLowerCase()));
  const keywordScore = (matched.length / keywords.length) * 100;

  const requiredSections = ["education", "experience", "skills", "projects"];
  const sectionCompleteness = requiredSections.filter(
    section => !text.toLowerCase().includes(section)
  );

  const formattingIssues = [];
  if (!text.includes("•") && !text.includes("–")) formattingIssues.push("Use bullet points for clarity.");
  if (text.length > 2000) formattingIssues.push("Resume might be too long for ATS parsing.");

  const atsScore = Math.round(keywordScore - sectionCompleteness.length * 10 - formattingIssues.length * 5);

  return {
    keywordScore,
    sectionCompleteness,
    formattingIssues,
    atsScore: Math.max(0, Math.min(100, atsScore)),
  };
}

function extractKeywords(jd: string): string[] {
  const lowerJD = jd.toLowerCase();
  const commonWords = new Set(["the", "and", "with", "for", "to", "in", "on", "of", "a", "an", "is", "are"]);
  const words = lowerJD.match(/\b[a-z]{3,}\b/g) || [];
  return Array.from(new Set(words.filter(word => !commonWords.has(word))));
}
