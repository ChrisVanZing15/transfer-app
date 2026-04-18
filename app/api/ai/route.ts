import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  const body = await req.json();

  let prompt = "";

  if (body.compare) {
    prompt = `
You are an expert university advisor.

Compare these universities:
${body.universities.join(", ")}

Student:
GPA: ${body.gpa}
Credits: ${body.credits}
Subjects: ${body.subjects.join(", ")}

Give:
1. Best university choice
2. Key differences
3. Final recommendation
`;
  } else {
    prompt = `
You are an academic advisor for Thailand universities.

Student:
GPA: ${body.gpa}
Credits: ${body.credits}
Subjects: ${body.subjects.join(", ")}
University: ${body.university}

Give:
1. Eligibility
2. Credit transfer estimate
3. Best majors
4. Advice
`;
  }

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    temperature: 0.7,
    messages: [{ role: "user", content: prompt }],
  });

  return Response.json({
    result: response.choices[0].message.content,
  });
}
