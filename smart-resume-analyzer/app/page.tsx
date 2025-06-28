'use client';

import { useState } from 'react';
import { ResumeUpload } from '@/components/resume-upload';
import { AnalysisChart } from '@/components/analysis-chart';
import { AnalysisSection } from '@/components/analysis-section';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Loader2,
  Download,
  GraduationCap,
  Briefcase,
  Code,
  Target,
  Layout,
  Trophy,
  RefreshCw,
} from 'lucide-react';
import { toast } from 'sonner';
import { generatePDF } from '@/lib/pdf-generator';

interface AnalysisResult {
  scores: Array<{
    label: string;
    score: number;
    color: string;
  }>;
  analysis: {
    impact: { strengths: string[]; improvements: string[] };
    education: { strengths: string[]; improvements: string[] };
    projects: { strengths: string[]; improvements: string[] };
    skills: { strengths: string[]; improvements: string[] };
    experience: { strengths: string[]; improvements: string[] };
    format: { strengths: string[]; improvements: string[] };
    recommendations: string[];
  };
}

export default function Home() {
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [jobDescription, setJobDescription] = useState('');
  const [atsResult, setAtsResult] = useState<any>(null);

  const handleUpload = async (file: File) => {
    try {
      setLoading(true);
      const formData = new FormData();
      formData.append('file', file);
      formData.append('jobDescription', jobDescription);

      const response = await fetch('/api/analyze', {
        method: 'POST',
        body: formData,
      });
      const result = await response.json();

      if (!response.ok) {
        if (result.error) return toast.error(result.error);
        throw new Error('Failed to analyze resume');
      }

      setAnalysis(result);
      setAtsResult(result.ats);
    } catch {
      toast.error('Failed to analyze resume. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = async () => {
    if (!analysis) return;
    try {
      await generatePDF(analysis);
      toast.success('PDF report downloaded successfully!');
    } catch {
      toast.error('Failed to generate PDF report');
    }
  };

  return (
    <div className="container mx-auto px-4 py-4 sm:py-8 max-w-7xl">
      {loading ? (
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
          <p className="text-lg">Analyzing your resume...</p>
        </div>
      ) : !analysis ? (
        <div className="flex flex-col items-center justify-center min-h-[80vh] w-full max-w-2xl mx-auto px-4">
          <>
            <ResumeUpload onUpload={handleUpload} />

            <div className="mt-6 w-full">
              <label className="block font-medium mb-1">Paste Job Description</label>
              <textarea
                rows={6}
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                className="w-full border rounded p-2"
                placeholder="Paste the job description you're targeting..."
              />
            </div>
          </>
        </div>
      ) : (
        <div className="space-y-6 sm:space-y-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h1 className="text-2xl sm:text-3xl font-bold">Resume Analysis</h1>
            <div className="flex items-center">
              <Button
                onClick={() => {
                  setAnalysis(null);
                  setAtsResult(null);
                }}
                className="flex items-center mr-4"
                variant="secondary"
              >
                <RefreshCw className="w-4 h-4" />
              </Button>

              <Button
                onClick={handleDownloadPDF}
                className="flex items-center gap-2 w-full sm:w-auto"
              >
                <Download className="w-4 h-4" />
                Download Report
              </Button>
            </div>
          </div>

          <Card className="glassmorphism p-4 sm:p-6">
            <h2 className="text-xl sm:text-2xl font-semibold mb-4 sm:mb-6">Score Overview</h2>
            <AnalysisChart data={analysis.scores} />
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            <AnalysisSection
              title="Impact & Achievements"
              icon={Trophy}
              strengths={analysis.analysis.impact.strengths}
              improvements={analysis.analysis.impact.improvements}
            />
            <AnalysisSection
              title="Education"
              icon={GraduationCap}
              strengths={analysis.analysis.education.strengths}
              improvements={analysis.analysis.education.improvements}
            />
            <AnalysisSection
              title="Projects"
              icon={Code}
              strengths={analysis.analysis.projects.strengths}
              improvements={analysis.analysis.projects.improvements}
            />
            <AnalysisSection
              title="Skills & Expertise"
              icon={Target}
              strengths={analysis.analysis.skills.strengths}
              improvements={analysis.analysis.skills.improvements}
            />
            <AnalysisSection
              title="Professional Experience"
              icon={Briefcase}
              strengths={analysis.analysis.experience.strengths}
              improvements={analysis.analysis.experience.improvements}
            />
            <AnalysisSection
              title="Format & Structure"
              icon={Layout}
              strengths={analysis.analysis.format.strengths}
              improvements={analysis.analysis.format.improvements}
            />
          </div>

          <Card className="glassmorphism p-4 sm:p-6">
            <h2 className="text-xl sm:text-2xl font-semibold mb-4">Key Recommendations</h2>
            <ul className="space-y-2">
              {analysis.analysis.recommendations.map((recommendation, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span className="text-sm sm:text-base">{recommendation}</span>
                </li>
              ))}
            </ul>
          </Card>

          {atsResult && (
            <Card className="glassmorphism p-4 sm:p-6">
              <h2 className="text-xl sm:text-2xl font-semibold mb-4">
                ATS Compatibility Report
              </h2>
              <p className="mb-2">
                <strong>ATS Score:</strong> {atsResult.atsScore}%
              </p>
              <p className="mb-2">
                <strong>Keyword Match:</strong> {atsResult.keywordScore}%
              </p>

              {atsResult.sectionCompleteness?.length > 0 && (
                <p className="mb-2 text-red-600">
                  <strong>Missing Sections:</strong>{' '}
                  {atsResult.sectionCompleteness.join(', ')}
                </p>
              )}

              {atsResult.formattingIssues?.length > 0 && (
                <>
                  <p>
                    <strong>Formatting Issues:</strong>
                  </p>
                  <ul className="list-disc pl-6 text-red-500">
                    {atsResult.formattingIssues.map((issue: string, i: number) => (
                      <li key={i}>{issue}</li>
                    ))}
                  </ul>
                </>
              )}
            </Card>
            

          )}
        </div>
        

      )}
    </div>
    
  );
}
