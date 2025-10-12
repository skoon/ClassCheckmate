import type { Activity } from "@/lib/types";

export const parseStudentCSV = (csvText: string): string[] => {
  const lines = csvText.split('\n');
  const newStudents = lines
    .map(line => line.split(',')[0].trim())
    .filter(name => name !== "" && name.toLowerCase() !== "student"); // Also filter out header if present
  return newStudents;
};

export const exportActivityLogToCSV = (activityLog: Activity[]): void => {
  const csvContent =
    "Student,Type,Location,Time\n" + // Header row
    activityLog
      .map(
        (activity) =>
          `${activity.student},${activity.checkInTime ? "check-in" : "check-out"},${activity.location},${activity.checkOutTime}`
      )
      .join("\n");
  const blob = new Blob([csvContent], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "activity_log.csv";
  link.click();
  URL.revokeObjectURL(url);
};
