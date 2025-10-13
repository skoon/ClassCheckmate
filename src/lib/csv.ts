export function parseStudentCSV(text: string): string[] {
  if (!text) return [];
  const lines = text.split(/\r?\n/);
  const names = lines
    .map((line) => line.split(",")[0]?.trim() ?? "")
    .filter((name) => name !== "" && name.toLowerCase() !== "student");
  return names;
}

export default parseStudentCSV;
