import type { NextApiRequest, NextApiResponse } from 'next';
import formidable, { File as FormidableFile } from 'formidable';
import fs from 'fs';
import pdfParse from 'pdf-parse';
import { analyzeATS } from '@/ats/atsAnalyzer';

// Disable Next.js default body parser to handle multipart/form-data
export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const form = formidable({ multiples: false });

    form.parse(req, async (err, fields, files) => {

    if (err) {
      console.error('Formidable error:', err);
      return res.status(500).json({ error: 'Form parsing error' });
    }

    const jobDescription = (fields.jobDescription?.toString() ?? '').trim();
    const file = files.file as unknown as FormidableFile;

    if (!file || Array.isArray(file)) {
      return res.status(400).json({ error: 'Resume file is required' });
    }

    try {
      const buffer = fs.readFileSync(file.filepath);
      const pdfData = await pdfParse(buffer);
      const resumeText = pdfData.text;

      const ats = analyzeATS(resumeText, jobDescription);

      return res.status(200).json({
        ats,
        message: 'ATS and AI analysis done',
      });
    } catch (error) {
      console.error('PDF parsing or ATS analysis failed:', error);
      return res.status(500).json({ error: 'Failed to analyze resume' });
    }
  });
}
