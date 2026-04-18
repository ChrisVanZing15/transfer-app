import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  const body = await req.json();

  const prompt = `
You are an academic advisor for Thailand universities.

Student info:
- GPA: ${body.gpa}
- Credits: ${body.credits}
- Subjects: ${body.subjects.join(", ")}
- Target University: ${body.university}

Give:
1. Eligibility evaluation
2. Transfer credit estimate
3. Best 3 majors
4. Short advice

Keep it clear and structured.
`;

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }],
  });

  return Response.json({
    result: response.choices[0].message.content,
  });
}
