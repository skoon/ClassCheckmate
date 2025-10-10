import { useState, useEffect } from "react";
import { toast } from "@/hooks/use-toast";
import { parseStudentCSV } from "@/lib/csv-utils";
import { defaultStudents } from "@/lib/constants";

export const useStudentList = () => {
  const [students, setStudents] = useState<string[]>([]);
  const [studentFile, setStudentFile] = useState<File | null>(null);

  useEffect(() => {
    const storedStudentList = localStorage.getItem("studentList");
    if (storedStudentList) {
      setStudents(JSON.parse(storedStudentList));
    } else {
      setStudents(defaultStudents); // Load default if nothing in localStorage
    }
  }, []);

  useEffect(() => {
    // Only save if students array is not empty, to avoid overwriting on initial load with empty array
    // or if it's different from defaultStudents on first load if localStorage was empty.
    if (students.length > 0) {
      localStorage.setItem("studentList", JSON.stringify(students));
    }
  }, [students]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setStudentFile(event.target.files[0]);
    }
  };

  const handleImportCSV = async () => {
    if (!studentFile) {
      toast({
        title: "Error",
        description: "Please select a file first.",
        variant: "destructive",
      });
      return;
    }

    if (studentFile.type !== "text/csv") {
      toast({
        title: "Invalid File Type",
        description: "Please upload a .csv file.",
        variant: "destructive",
      });
      return;
    }

    const reader = new FileReader();

    reader.onload = async (e) => {
      try {
        const text = e.target?.result as string;
        if (text) {
          const newStudents = parseStudentCSV(text);

          if (newStudents.length === 0) {
            toast({
              title: "Empty File or No Names",
              description: "The CSV file is empty or does not contain any student names in the first column.",
              variant: "default",
            });
          } else {
            setStudents(newStudents);
            toast({
              title: "Import Successful",
              description: `${newStudents.length} student(s) imported successfully.`,
              variant: "default",
            });
          }
        } else {
          toast({
            title: "Error",
            description: "Could not read the file content.",
            variant: "destructive",
          });
        }
      } catch (error) {
        toast({
          title: "File Read Error",
          description: "Could not process the selected file.",
          variant: "destructive",
        });
      }
    };

    reader.onerror = () => {
      toast({
        title: "File Read Error",
        description: "Could not read the selected file.",
        variant: "destructive",
      });
    };

    try {
      reader.readAsText(studentFile);
    } catch (error) {
      toast({
        title: "File Read Error",
        description: "Could not read the selected file.",
        variant: "destructive",
      });
    }
  };

  return { students, setStudents, studentFile, handleFileChange, handleImportCSV };
};
