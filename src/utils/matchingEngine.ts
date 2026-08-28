import { Job, ParsedResume, StudentProfile, SkillGapAnalysis } from '../types';

/**
 * Calculates instant, realistic Skill Gap Analysis & ATS match score
 * combining both parsed resume and student profile details.
 */
export function calculateInstantSkillGap(
  resume: ParsedResume | null,
  job: Job,
  studentProfile?: StudentProfile | null
): SkillGapAnalysis {
  // Candidate skills and text tokens from Profile & Resume
  const profileSkills = (studentProfile?.skills || []).map((s) => s.toLowerCase().trim());
  const profileHeadline = (studentProfile?.headline || '').toLowerCase();
  const profileBio = (studentProfile?.bio || '').toLowerCase();
  const profileWorkHistoryText = (studentProfile?.workHistory || [])
    .map((w) => `${w.role} ${w.company} ${(w.highlights || []).join(' ')}`)
    .join(' ')
    .toLowerCase();
  const profileEduText = (studentProfile?.education || [])
    .map((e) => `${e.degree} ${e.institution} ${e.fieldOfStudy}`)
    .join(' ')
    .toLowerCase();

  const resumeTech = (resume?.extractedSkills?.technical || []).map((s) => s.toLowerCase().trim());
  const resumeTools = (resume?.extractedSkills?.tools || []).map((s) => s.toLowerCase().trim());
  const resumeSoft = (resume?.extractedSkills?.soft || []).map((s) => s.toLowerCase().trim());
  const resumeKeywords = (resume?.keywordVector || []).map((s) => s.toLowerCase().trim());
  const resumeRawText = (resume?.rawText || '').toLowerCase();

  const allTokens = [
    ...profileSkills,
    ...resumeTech,
    ...resumeTools,
    ...resumeSoft,
    ...resumeKeywords,
    ...profileHeadline.split(/\W+/),
    ...profileBio.split(/\W+/),
    ...profileWorkHistoryText.split(/\W+/),
    ...profileEduText.split(/\W+/),
    ...resumeRawText.split(/\W+/),
  ].filter(Boolean);

  // Skill synonym dictionary for real ATS token matching
  const checkTokenMatch = (skillName: string) => {
    const target = skillName.toLowerCase().trim();
    if (allTokens.includes(target)) return true;

    // Synonyms / Aliases
    if (target === 'react' && (allTokens.includes('react.js') || allTokens.includes('reactjs'))) return true;
    if (target === 'node' && (allTokens.includes('node.js') || allTokens.includes('nodejs') || allTokens.includes('express'))) return true;
    if (target === 'typescript' && (allTokens.includes('ts') || allTokens.includes('type script'))) return true;
    if (target === 'javascript' && (allTokens.includes('js') || allTokens.includes('ecmascript'))) return true;
    if (target === 'python' && (allTokens.includes('py') || allTokens.includes('django') || allTokens.includes('fastapi'))) return true;
    if (target === 'aws' && (allTokens.includes('amazon web services') || allTokens.includes('ec2') || allTokens.includes('s3'))) return true;
    if (target === 'sql' && (allTokens.includes('postgres') || allTokens.includes('postgresql') || allTokens.includes('mysql'))) return true;

    return allTokens.some(
      (token) => token.length >= 3 && (token.includes(target) || target.includes(token))
    );
  };

  // Required skills matching
  const matchedRequiredSkills: string[] = [];
  const missingRequiredSkills: string[] = [];

  (job.requiredSkills || []).forEach((reqSkill) => {
    if (checkTokenMatch(reqSkill)) {
      matchedRequiredSkills.push(reqSkill);
    } else {
      missingRequiredSkills.push(reqSkill);
    }
  });

  // Nice to have skills matching
  const matchedNiceSkills: string[] = [];
  const missingNiceSkills: string[] = [];

  (job.niceToHaveSkills || []).forEach((niceSkill) => {
    if (checkTokenMatch(niceSkill)) {
      matchedNiceSkills.push(niceSkill);
    } else {
      missingNiceSkills.push(niceSkill);
    }
  });

  // Score Math
  const totalReq = job.requiredSkills?.length || 1;
  const keywordRatio = matchedRequiredSkills.length / totalReq;
  const keywordMatchScore = Math.round(keywordRatio * 100);

  const totalNice = job.niceToHaveSkills?.length || 1;
  const niceRatio = matchedNiceSkills.length / totalNice;
  const semanticMatchScore = Math.min(100, Math.round(keywordMatchScore * 0.70 + niceRatio * 20 + (resume?.atsHealthScore || 85) * 0.10));

  // Years of Experience Match
  const candidateYears = studentProfile?.experienceYears ?? (resume?.workExperience?.length ? resume.workExperience.length * 1.5 : 3);
  const requiredYears = job.minExperienceYears || 2;
  const isExpMet = candidateYears >= requiredYears;

  // Experience penalty or bonus
  const expFactor = candidateYears >= requiredYears ? 1.0 : 0.85;

  const rawOverall = (keywordMatchScore * 0.55 + semanticMatchScore * 0.35 + (isExpMet ? 10 : 0)) * expFactor;
  const overallMatchScore = Math.min(99, Math.max(12, Math.round(rawOverall)));

  const severity: 'Low' | 'Moderate' | 'High' =
    missingRequiredSkills.length === 0 ? 'Low' : missingRequiredSkills.length <= 2 ? 'Moderate' : 'High';

  const aiFeedback =
    missingRequiredSkills.length === 0
      ? `Outstanding match! Candidate profile and resume demonstrate verified expertise across all required job competencies for ${job.title} (${matchedRequiredSkills.join(', ')}).`
      : `Solid foundation matching ${matchedRequiredSkills.length} of ${job.requiredSkills?.length || 0} required skills (${matchedRequiredSkills.join(', ') || 'base concepts'}). Bridge gap in ${missingRequiredSkills.join(', ')} to reach 90%+ ATS preference.`;

  const bridgeActionPlan = missingRequiredSkills.map((skill, idx) => ({
    missingSkill: skill,
    importance: (idx === 0 ? 'Critical' : 'Recommended') as 'Critical' | 'Recommended',
    learningAction: `Complete interactive learning module & practical coding project focusing on ${skill}`,
    estimatedHours: 12 + idx * 5,
  }));

  return {
    jobId: job.id,
    candidateId: resume?.id || 'candidate_profile',
    overallMatchScore,
    keywordMatchScore,
    semanticMatchScore,
    matchedRequiredSkills,
    missingRequiredSkills,
    matchedNiceSkills,
    missingNiceSkills,
    experienceMatch: {
      requiredYears,
      candidateYears: Math.round(candidateYears),
      isMet: isExpMet,
    },
    skillGapSeverity: severity,
    aiFeedback,
    bridgeActionPlan,
  };
}

/**
 * Calculates candidate match score for recruiter candidate evaluation list
 */
export function calculateCandidateMatchScore(candidate: any, job: Job): number {
  if (candidate.resume) {
    const analysis = calculateInstantSkillGap(candidate.resume, job, null);
    return analysis.overallMatchScore;
  }

  // Fallback skill check if no full resume attached
  if (!candidate || !job) return 50;
  const candidateSkills = (candidate.skills || candidate.headline || candidate.role || '').toString().toLowerCase();
  const reqSkills = Array.isArray(job.requiredSkills) ? job.requiredSkills : [];
  let matches = 0;
  reqSkills.forEach((sk) => {
    if (sk && candidateSkills.includes(sk.toLowerCase())) matches++;
  });
  const ratio = matches / (reqSkills.length || 1);
  return Math.min(98, Math.max(45, Math.round(ratio * 80 + 15)));
}

