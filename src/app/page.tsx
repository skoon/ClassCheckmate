"use client";

import { useState, useEffect } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/hooks/use-toast";
import { CheckCheck, DoorOpen, DoorClosed } from "lucide-react";

const students = [
  "Alice",
  "Bob",
  "Charlie",
  "David",
  "Eve",
  "Fred",
  "Ginny",
  "Harriet",
  "Ileana",
  "Joseph",
  "Kevin",
  "Laura",
];

const locations = [
  "Library",
  "Restroom",
  "Cafeteria",
  "Gym",
  "Office",
  "Other",
];

type Activity = {
  student: string;
  location: string;
  checkInTime?: string;
  checkOutTime: string;
  duration?: string;
};

export default function Home() {
  const [selectedStudent, setSelectedStudent] = useState<string | null>(null);
  const [activityLog, setActivityLog] = useState<Activity[]>([]);
  const [checkOutTime, setCheckOutTime] = useState<string | null>(null);

  useEffect(() => {
    const storedActivityLog = localStorage.getItem("activityLog");
    if (storedActivityLog) {
      setActivityLog(JSON.parse(storedActivityLog));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("activityLog", JSON.stringify(activityLog));
  }, [activityLog]);

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
    const checkOutTime = now.toLocaleTimeString();
    setCheckOutTime(checkOutTime);

    const newActivity: Activity = {
      student: selectedStudent,
      location: location,
      checkOutTime: checkOutTime,
      checkInTime: undefined,
      duration: undefined,
    };

    setActivityLog((prevLog) => [newActivity, ...prevLog]);

    toast({
      title: "Check-out Successful",
      description: `${selectedStudent} checked out to ${location} at ${checkOutTime}.`,
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
    const checkInTime = now.toLocaleTimeString();

    const lastCheckOut = activityLog.find(
      (activity) => activity.student === selectedStudent && !activity.checkInTime
    );

    if (lastCheckOut) {
      const checkOutDate = new Date();
      checkOutDate.setHours(
        parseInt(lastCheckOut.checkOutTime.split(":")[0])
      );
      checkOutDate.setMinutes(
        parseInt(lastCheckOut.checkOutTime.split(":")[1])
      );
      checkOutDate.setSeconds(
        parseInt(lastCheckOut.checkOutTime.split(":")[2])
      );

      const checkInDate = new Date();
      checkInDate.setHours(parseInt(checkInTime.split(":")[0]));
      checkInDate.setMinutes(parseInt(checkInTime.split(":")[1]));
      checkInDate.setSeconds(parseInt(checkInTime.split(":")[2]));

      const durationMs = checkInDate.getTime() - checkOutDate.getTime();
      const durationMin = Math.round(durationMs / 60000);
      const duration = `${durationMin} minutes`;

      const updatedActivityLog = activityLog.map((activity) => {
        if (
          activity.student === selectedStudent &&
          activity.checkOutTime === lastCheckOut.checkOutTime &&
          !activity.checkInTime
        ) {
          return {
            ...activity,
            checkInTime: checkInTime,
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
      description: `${selectedStudent} checked in at ${checkInTime}.`,
    });
  };

  const isStudentCheckedOut = selectedStudent
    ? activityLog.some(
        (activity) => activity.student === selectedStudent && !activity.checkInTime
      )
    : false;

  return (
    <div className="flex flex-col items-center justify-start min-h-screen p-4 bg-background">
      <h1 className="text-2xl font-bold mb-4 text-primary">Classroom Checkmate</h1>

      <Card className="w-full max-w-md mb-4">
        <CardHeader>
          <CardTitle>Student Check-in/Check-out</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col space-y-4">
          <Select onValueChange={setSelectedStudent}>
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
                  <div key={index} className="mb-2">
                    <p className="text-sm">
                      {activity.student} checked out to {activity.location} at {activity.checkOutTime}
                      {activity.checkInTime ? ` and checked in at ${activity.checkInTime} for ${activity.duration}` : null}
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
          }}
          className="mt-4 bg-muted hover:bg-muted-foreground text-muted-foreground"
        >
          Export as CSV
        </Button>

      </Card>
    </div>
  );
}

