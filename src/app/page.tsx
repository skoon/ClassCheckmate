"use client";

import { useState, useEffect } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/hooks/use-toast";
import { CheckCheck, DoorOpen, DoorClosed } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const defaultStudents = [
  "Import Students",
];

const locations = [
  "Library",
  "Restroom",
  "Gym",
  "Office",
  "Other",
];

type Activity = {
  id: string;
  student: string;
  location: string;
  checkInTime?: string;
  checkOutTime: string;
  duration?: string;
};

function generateId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function parseTimeStringToISOString(timeStr?: string): string | undefined {
  if (!timeStr) return undefined;
  // If it already looks like ISO and parses, return normalized ISO
  if (/\d{4}-\d{2}-\d{2}T/.test(timeStr)) {
    const d = new Date(timeStr);
    return isNaN(d.getTime()) ? undefined : d.toISOString();
  }

  const parsed = Date.parse(timeStr);
  if (!isNaN(parsed)) return new Date(parsed).toISOString();

  // Try to parse time-only strings like "10:23:45" or "1:05 PM"
  const m = timeStr.match(/(\d{1,2}):(\d{2})(?::(\d{2}))?\s*(AM|PM|am|pm)?/);
  if (m) {
    let hour = parseInt(m[1], 10);
    const minute = parseInt(m[2], 10);
    const second = m[3] ? parseInt(m[3], 10) : 0;
    const ampm = m[4];
    if (ampm) {
      if (/pm/i.test(ampm) && hour < 12) hour += 12;
      if (/am/i.test(ampm) && hour === 12) hour = 0;
    }
    const d = new Date();
    d.setHours(hour, minute, second, 0);
    return d.toISOString();
  }

  return undefined;
}

function formatIsoTime(iso?: string) {
  if (!iso) return "";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  return d.toLocaleTimeString();
}

export default function Home() {
  const [selectedStudent, setSelectedStudent] = useState<string | null>(null);
  const [students, setStudents] = useState<string[]>([]);
  const [studentFile, setStudentFile] = useState<File | null>(null);
  const [activityLog, setActivityLog] = useState<Activity[]>([]);
  const [checkOutTime, setCheckOutTime] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [saveName, setSaveName] = useState("");
  const [savedLogs, setSavedLogs] = useState<string[]>([]);
  const [selectedLog, setSelectedLog] = useState<string | null>(null);

  useEffect(() => {
    const storedActivityLog = localStorage.getItem("activityLog");
    if (storedActivityLog) {
      // Backfill ids for any legacy activities that don't have them
      try {
        const parsed: Activity[] = JSON.parse(storedActivityLog);
        const withIdsAndIso = parsed.map((a) => {
          const checkOutIso = parseTimeStringToISOString(a.checkOutTime);
          const checkInIso = parseTimeStringToISOString(a.checkInTime);
          return {
            ...a,
            id: (a as any).id || generateId(),
            checkOutTime: checkOutIso || a.checkOutTime,
            checkInTime: checkInIso || a.checkInTime,
          } as Activity;
        });
        setActivityLog(withIdsAndIso);
      } catch (e) {
        setActivityLog([]);
      }
    }

    const storedStudentList = localStorage.getItem("studentList");
    if (storedStudentList) {
      setStudents(JSON.parse(storedStudentList));
    } else {
      setStudents(defaultStudents); // Load default if nothing in localStorage
    }

    // Load saved logs from localStorage
    const savedLogKeys = Object.keys(localStorage).filter((key) =>
      key.startsWith("activityLog_")
    );
    const logNames = savedLogKeys.map((key) => key.replace("activityLog_", ""));
    setSavedLogs(logNames);
  }, []);

  useEffect(() => {
    localStorage.setItem("activityLog", JSON.stringify(activityLog));
  }, [activityLog]);

  useEffect(() => {
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
          const lines = text.split('\n');
          const newStudents = lines
            .map(line => line.split(',')[0].trim())
            .filter(name => name !== "" && name.toLowerCase() !== "student"); // Also filter out header if present
          
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
          description: "Could not process the selected file.", // More generic message for processing
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

  const handleCheckOut = (location: string) => {
    if (!selectedStudent) {
      toast({
        title: "Error",
        description: "Please select a student.",
        variant: "destructive",
      });
      return;
    }

  const now = new Date();
  const checkOutIso = now.toISOString();
  setCheckOutTime(checkOutIso);

    const newActivity: Activity = {
      id: generateId(),
      student: selectedStudent,
      location: location,
      checkOutTime: checkOutIso,
      checkInTime: undefined,
      duration: undefined,
    };

    setActivityLog((prevLog) => [newActivity, ...prevLog]);

    toast({
      title: "Check-out Successful",
      description: `${selectedStudent} checked out to ${location} at ${new Date(checkOutIso).toLocaleTimeString()}.`,
    });
  };

  const handleCheckIn = () => {
    if (!selectedStudent) {
      toast({
        title: "Error",
        description: "Please select a student.",
        variant: "destructive",
      });
      return;
    }

  const now = new Date();
  const checkInIso = now.toISOString();

    // Find the most recent activity for the selected student that has no checkInTime
    const lastCheckOut = [...activityLog].find(
      (activity) => activity.student === selectedStudent && !activity.checkInTime
    );

    if (lastCheckOut) {
      // Compute duration from ISO timestamps (or fallback to parsing legacy)
      const coIso = parseTimeStringToISOString(lastCheckOut.checkOutTime) || lastCheckOut.checkOutTime;
      const ciIso = checkInIso;
      const coDate = new Date(coIso);
      const ciDate = new Date(ciIso);
      const durationMs = ciDate.getTime() - coDate.getTime();
      const durationMin = Math.round(durationMs / 60000);
      const duration = `${durationMin} minutes`;

      const updatedActivityLog = activityLog.map((activity) => {
        if (activity.id === lastCheckOut.id) {
          return {
            ...activity,
            checkInTime: checkInIso,
            duration: duration,
          };
        }
        return activity;
      });

      setActivityLog(updatedActivityLog);
    }

    setSelectedStudent(null);
    setCheckOutTime(null);

    toast({
      title: "Check-in Successful",
      description: `${selectedStudent} checked in at ${new Date(checkInIso).toLocaleTimeString()}.`,
    });
  };

  const isStudentCheckedOut = selectedStudent
    ? activityLog.some(
        (activity) => activity.student === selectedStudent && !activity.checkInTime
      )
    : false;

  const handleSaveActivityLog = () => {
    if (saveName.trim() === "") {
      toast({
        title: "Error",
        description: "Please enter a name for the saved log.",
        variant: "destructive",
      });
      return;
    }

    localStorage.setItem(`activityLog_${saveName}`, JSON.stringify(activityLog));
    setOpen(false);
    setSaveName("");

    // Update the saved logs list
    setSavedLogs((prevLogs) => [...prevLogs, saveName]);

    toast({
      title: "Save Successful",
      description: `Activity log saved as ${saveName}.`,
    });
  };

  const handleClearActivityLog = () => {
    setActivityLog([]);
    localStorage.removeItem("activityLog");
    toast({
      title: "Clear Successful",
      description: "Activity log cleared.",
    });
  };

  const handleClearStudentList = () => {
    setStudents([]);
    localStorage.removeItem("studentList");
    toast({
      title: "Clear Successful",
      description: "Student List cleared.",
    });
  };

  const handleLoadActivityLog = () => {
    if (!selectedLog) {
      toast({
        title: "Error",
        description: "Please select a log to load.",
        variant: "destructive",
      });
      return;
    }

    const loadedLog = localStorage.getItem(`activityLog_${selectedLog}`);
    if (loadedLog) {
      try {
        const parsed: Activity[] = JSON.parse(loadedLog);
        const normalized = parsed.map((a) => ({
          ...a,
          id: (a as any).id || generateId(),
          checkOutTime: parseTimeStringToISOString(a.checkOutTime) || a.checkOutTime,
          checkInTime: parseTimeStringToISOString(a.checkInTime) || a.checkInTime,
        }));
        setActivityLog(normalized as Activity[]);
      } catch (e) {
        toast({
          title: "Error",
          description: "Could not parse the selected log.",
          variant: "destructive",
        });
        return;
      }
      toast({
        title: "Load Successful",
        description: `Activity log ${selectedLog} loaded.`,
      });
    } else {
      toast({
        title: "Error",
        description: "Could not load the selected log.",
        variant: "destructive",
      });
    }
  };


  return (
    <div className="flex flex-col items-center justify-start min-h-screen p-4 bg-background">
      <h1 className="text-2xl font-bold mb-4 text-primary">Classroom Checkmate</h1>

      <Card className="w-full max-w-md mb-4">
        <CardHeader>
          <CardTitle>Student Check-in/Check-out</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col space-y-4">
          <Select onValueChange={setSelectedStudent} value={selectedStudent || ""}>
            <SelectTrigger>
              <SelectValue placeholder="Select Student" />
            </SelectTrigger>
            <SelectContent>
              {students.map((student) => (
                <SelectItem key={student} value={student}>
                  {student}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {selectedStudent && !isStudentCheckedOut && (
            <div className="grid grid-cols-3 gap-2">
              {locations.map((location) => (
                <Button
                  key={location}
                  onClick={() => handleCheckOut(location)}
                  className="bg-secondary text-secondary-foreground hover:bg-secondary/80"
                >
                  {location}
                </Button>
              ))}
            </div>
          )}

          {selectedStudent && isStudentCheckedOut && (
            <Button onClick={handleCheckIn} className="bg-accent text-background hover:bg-accent-foreground">
              Check In <DoorOpen className="ml-2 h-4 w-4" />
            </Button>
          )}
        </CardContent>
      </Card>

      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Activity Log</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[300px] w-full rounded-md border">
            <div className="p-4">
              {activityLog.length === 0 ? (
                <p className="text-muted-foreground">No activity yet.</p>
              ) : (
                activityLog.map((activity, index) => (
                  <div key={activity.id} className="mb-2">
                    <p className="text-sm">
                      {activity.student} checked out to {activity.location} at {formatIsoTime(activity.checkOutTime)}
                      {activity.checkInTime ? ` and checked in at ${formatIsoTime(activity.checkInTime)} for ${activity.duration}` : null}
                    </p>
                    {index !== activityLog.length - 1 && <Separator />}
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </CardContent>
        <Button
          onClick={() => {
            const csvContent =
              "Student,Type,Location,Time\n" +
              activityLog
                .map((activity) => {
                  const time = activity.checkInTime ? formatIsoTime(activity.checkInTime) : formatIsoTime(activity.checkOutTime);
                  return `${activity.student},${activity.checkInTime ? "check-in" : "check-out"},${activity.location},${time}`;
                })
                .join("\n");
            const blob = new Blob([csvContent], { type: "text/csv" });
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = "activity_log.csv";
            link.click();
            URL.revokeObjectURL(url);
          }}
          className="mt-4 bg-muted hover:bg-muted-foreground text-muted-foreground"
        >
          Export as CSV
        </Button>
         <div className="flex justify-between mt-4">
          <Dialog open={open} onOpenChange={setOpen}> {/* Uses open, setOpen from useSavedLogs */}
            <DialogTrigger asChild>
              <Button variant="outline">Save Activity Log</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Save Activity Log</DialogTitle>
                <DialogDescription>
                  Enter a name for the saved activity log.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="text-right">
                    Name
                  </Label>
                  <Input
                    id="name"
                    value={saveName} /* Uses saveName from useSavedLogs */
                    onChange={(e) => setSaveName(e.target.value)} /* Uses setSaveName from useSavedLogs */
                    className="col-span-3"
                  />
                </div>
              </div>
             
              <Button onClick={handleSaveActivityLog}>Save</Button> {/* Uses handleSaveActivityLog from useSavedLogs */}
            
            </DialogContent>
          </Dialog>
          <Button
            onClick={handleClearActivityLog} /* Uses handleClearActivityLog from useSavedLogs */
            className="bg-destructive hover:bg-destructive-foreground text-destructive-foreground"
          >
            Clear Activity Log
          </Button>
        </div>
      </Card>

      <Card className="w-full max-w-md mb-4">
        <CardHeader>
          <CardTitle>Import Activity Log</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col space-y-4">
          <Input type="file" accept=".csv" className="text-muted-foreground" onChange={handleFileChange} />
          <Button className="bg-primary text-primary-foreground hover:bg-primary/80" onClick={handleImportCSV}>
            Import CSV
          </Button>
        </CardContent>
      </Card>

      <Card className="w-full max-w-md mb-4">
        <CardHeader>
          <CardTitle>Saved Activity Logs</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col space-y-4">
          {savedLogs.length === 0 ? ( /* Uses savedLogs from useSavedLogs */
            <p className="text-muted-foreground">No saved logs yet.</p>
          ) : (
            <div className="flex items-center space-x-2">
              <Select onValueChange={setSelectedLog}> {/* Uses setSelectedLog from useSavedLogs */}
                <SelectTrigger>
                  <SelectValue placeholder="Select Log" />
                </SelectTrigger>
                <SelectContent>
                  {savedLogs.map((log) => ( /* Uses savedLogs from useSavedLogs */
                    <SelectItem key={log} value={log}>
                      {log}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                onClick={handleLoadActivityLog} /* Uses handleLoadActivityLog from useSavedLogs */
                className="bg-accent text-background hover:bg-accent-foreground"
              >
                Load Log
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
