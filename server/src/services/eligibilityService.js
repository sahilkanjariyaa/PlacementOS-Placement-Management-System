/**
 * Authoritative Server-Side Eligibility Engine
 * Checks whether a given student meets all mandatory academic and drive requirements.
 */
export const checkEligibility = (studentProfile, drive) => {
  const reasons = [];

  if (!studentProfile || studentProfile.cgpa === null || studentProfile.cgpa === undefined || !studentProfile.department) {
    return {
      eligible: false,
      reasons: ['Please complete your academic profile (Department, Semester, CGPA, Roll No) before applying.'],
    };
  }

  // 1. Check Drive Status
  if (drive.status !== 'open') {
    reasons.push(`This placement drive is currently ${drive.status}.`);
  }

  // 2. Check Deadline
  const now = new Date();
  const deadline = new Date(drive.deadline);
  if (now > deadline) {
    reasons.push('The application deadline for this drive has passed.');
  }

  // 3. Check CGPA Threshold
  if (studentProfile.cgpa < drive.minCgpa) {
    reasons.push(
      `Your CGPA (${studentProfile.cgpa}) is below the required minimum of ${drive.minCgpa}.`
    );
  }

  // 4. Check Backlogs Criteria
  if (studentProfile.backlogs > drive.maxBacklogs) {
    reasons.push(
      `You have ${studentProfile.backlogs} active backlogs. Maximum allowed is ${drive.maxBacklogs}.`
    );
  }

  // 5. Check Department Allowance
  if (
    drive.eligibleDepartments &&
    drive.eligibleDepartments.length > 0 &&
    !drive.eligibleDepartments.includes(studentProfile.department)
  ) {
    reasons.push(
      `Your department (${studentProfile.department}) is not eligible for this drive. Eligible: ${drive.eligibleDepartments.join(', ')}.`
    );
  }

  // 6. Check Eligible Semesters (if defined)
  if (
    drive.eligibleSemesters &&
    drive.eligibleSemesters.length > 0 &&
    !drive.eligibleSemesters.includes(studentProfile.semester)
  ) {
    reasons.push(
      `Your current semester (${studentProfile.semester}) is not eligible. Permitted semesters: ${drive.eligibleSemesters.join(', ')}.`
    );
  }

  return {
    eligible: reasons.length === 0,
    reasons,
  };
};
