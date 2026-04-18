export const convertGPA = (gpa: number) => {
  if (!gpa) return 0;
  return gpa > 4 ? (gpa / 100) * 4 : gpa;
};

export const buildAIRequest = ({
  gpa,
  credits,
  subjects,
  university,
  compare = false,
  universities = [],
}: {
  gpa: number;
  credits: number;
  subjects: string[];
  university?: string;
  compare?: boolean;
  universities?: string[];
}) => {
  return {
    gpa,
    credits,
    subjects,
    university,
    compare,
    universities,
  };
};
