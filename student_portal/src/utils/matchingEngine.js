/**
 * Resume and Profile Eligibility Matching Engine
 * Compares student profile (department, CGPA, backlogs, resume upload, 10th/12th)
 * against company drive requirements (eligibility_criteria, description, role).
 */

export function calculateDriveMatch(student, drive) {
  if (!drive) return { matchScore: 0, matchLabel: "Unknown", badgeColor: "bg-secondary", reasons: [], isEligible: false };

  let score = 0;
  const reasons = [];

  const dept = (student?.department || "").toLowerCase().trim();
  const criteria = (drive.eligibility_criteria || "").toLowerCase();
  const description = (drive.description || "").toLowerCase();
  const role = (drive.role || "").toLowerCase();

  // 1. Department / Major Match (40 Points)
  let deptMatched = false;
  if (!dept) {
    deptMatched = true;
    score += 25;
    reasons.push("General profile eligibility");
  } else if (
    dept.includes("mca") || dept.includes("computer") || dept.includes("cs") || dept.includes("it")
  ) {
    if (
      criteria.includes("mca") || criteria.includes("computer") || criteria.includes("cs") ||
      criteria.includes("it") || criteria.includes("b.tech") || criteria.includes("btech") ||
      criteria.includes("master") || criteria.includes("post graduate") ||
      description.includes("mca") || description.includes("developer") || description.includes("software") ||
      description.includes("code") || description.includes("backend") || description.includes("frontend") ||
      role.includes("engineer") || role.includes("developer")
    ) {
      deptMatched = true;
      score += 40;
      reasons.push(`Matches your ${student.department || "MCA"} degree & skills`);
    } else {
      score += 20;
      reasons.push("Open for technical graduates");
    }
  } else if (dept.includes("management") || dept.includes("mba") || dept.includes("business")) {
    if (
      criteria.includes("mba") || criteria.includes("management") || criteria.includes("bba") ||
      criteria.includes("marketing") || criteria.includes("finance") || criteria.includes("hr") ||
      description.includes("management") || description.includes("sales") || description.includes("analyst") ||
      role.includes("analyst") || role.includes("manager")
    ) {
      deptMatched = true;
      score += 40;
      reasons.push(`Matches your ${student.department} degree`);
    } else {
      score += 20;
    }
  } else {
    deptMatched = true;
    score += 30;
    reasons.push(`Matches ${student.department}`);
  }

  // 2. Academic CGPA / Marks Match (30 Points)
  const studentCgpa = parseFloat(student?.masterCgpa || student?.bachelorCgpa || 7.5);
  let cgpaRequirement = 6.0;

  const cgpaMatch = criteria.match(/(\d+(\.\d+)?)\s*(cgpa|%)/i);
  if (cgpaMatch && cgpaMatch[1]) {
    const val = parseFloat(cgpaMatch[1]);
    cgpaRequirement = val > 10 ? val / 10 : val;
  }

  if (studentCgpa >= cgpaRequirement) {
    score += 30;
    reasons.push(`CGPA (${studentCgpa}) meets requirement (Min: ${cgpaRequirement})`);
  } else {
    score += 10;
    reasons.push(`CGPA (${studentCgpa}) below target (${cgpaRequirement})`);
  }

  // 3. Backlog Criterion (15 Points)
  const studentBacklogs = parseInt(student?.backlog ?? 0, 10);
  if (criteria.includes("0 backlog") || criteria.includes("no backlog") || criteria.includes("no active backlog")) {
    if (studentBacklogs === 0) {
      score += 15;
      reasons.push("Passed 0-backlogs requirement");
    } else {
      score += 0;
      reasons.push(`Requires 0 backlogs (You have ${studentBacklogs})`);
    }
  } else {
    score += 15;
    reasons.push("Backlog criteria met");
  }

  // 4. Resume Attachment (15 Points)
  const hasResume = Boolean(student?.resume);
  if (hasResume) {
    score += 15;
    reasons.push(`Resume verified & attached`);
  } else {
    reasons.push("Resume pending upload");
  }

  // 5. Student Skill Match
  const studentSkill = (student?.skill || "").toLowerCase().trim();
  if (
    studentSkill &&
    (criteria.includes(studentSkill) ||
      description.includes(studentSkill) ||
      role.includes(studentSkill))
  ) {
    score += 10;
    reasons.push(`Direct skill match: ${student.skill}`);
  }

  const finalScore = Math.min(100, Math.max(15, Math.round(score)));
  const isEligible = finalScore >= 60;

  let matchLabel = "🎯 Best Resume Fit";
  let badgeColor = "bg-success";

  if (finalScore >= 85) {
    matchLabel = "🎯 Best Resume Fit";
    badgeColor = "bg-success";
  } else if (finalScore >= 70) {
    matchLabel = "✅ Eligible Fit";
    badgeColor = "bg-primary";
  } else if (finalScore >= 50) {
    matchLabel = "⚡ Moderate Fit";
    badgeColor = "bg-warning text-dark";
  } else {
    matchLabel = "⚠️ Review Criteria";
    badgeColor = "bg-secondary";
  }

  return {
    matchScore: finalScore,
    matchLabel,
    badgeColor,
    reasons,
    isEligible,
    hasResume
  };
}
