export async function GET() {
  return Response.json([
    { name: "Chulalongkorn University", gpa: 3.0 },
    { name: "Mahidol University", gpa: 2.8 },
    { name: "Thammasat University", gpa: 2.7 },
  ]);
}
