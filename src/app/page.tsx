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
  time: string;
  type: "check-in" | "check-out";
};

export default function Home() {
  const [selectedStudent, setSelectedStudent] = useState<string | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);
  const [activityLog, setActivityLog] = useState<Activity[]>([]);
  const [checkedOut, setCheckedOut] = useState<boolean>(false);

  useEffect(() => {
    // Load activity log from local storage on component mount
    const storedActivityLog = localStorage.getItem("activityLog");
    if (storedActivityLog) {
      setActivityLog(JSON.parse(storedActivityLog));
    }
  }, []);

  useEffect(() => {
    // Save activity log to local storage whenever it changes
    localStorage.setItem("activityLog", JSON.stringify(activityLog));
  }, [activityLog]);

  const handleCheckIn = () => {
    if (!selectedStudent || !selectedLocation) {
      toast({
        title: "Error",
        description: "Please select a student and location.",
        variant: "destructive",
      });
      return;
    }

    const now = new Date();
    const time = now.toLocaleTimeString();
    const newActivity: Activity = {
      student: selectedStudent,
      location: selectedLocation,
      time: time,
      type: "check-in",
    };

    setActivityLog((prevLog) => [newActivity, ...prevLog]);
    setSelectedStudent(null);
    setSelectedLocation(null);

    toast({
      title: "Check-in Successful",
      description: `${selectedStudent} checked in to ${selectedLocation} at ${time}.`,
    });
  };

  const handleCheckOut = () => {
    if (!selectedStudent || checkedOut) {
      toast({
        title: "Error",
        description: "Please select a student.",
        variant: "destructive",
      });
      return;
    }

    const now = new Date();
    const time = now.toLocaleTimeString();
    const newActivity: Activity = {
      student: selectedStudent,
      location: "Classroom",
      time: time,
      type: "check-out",
    };

    setActivityLog((prevLog) => [newActivity, ...prevLog]);
    setCheckedOut(true);

    toast({
      title: "Check-out Successful",
      description: `${selectedStudent} checked out at ${time}.`,
    });
  };

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

          {selectedStudent && !checkedOut && (
            <Select onValueChange={setSelectedLocation}>
              <SelectTrigger>
                <SelectValue placeholder="Select Location" />
              </SelectTrigger>
              <SelectContent>
                {locations.map((location) => (
                  <SelectItem key={location} value={location}>
                    {location}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          {selectedStudent && !checkedOut && (
            <Button onClick={handleCheckOut} className="bg-primary text-background hover:bg-primary-foreground">
              Check Out <DoorClosed className="ml-2 h-4 w-4" />
            </Button>
          )}

          {selectedStudent && checkedOut && (
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
                      {activity.student} - {activity.type === "check-in" ? "Checked in to" : "Checked out from"}{" "}
                      {activity.location} at {activity.time}
                    </p>
                    {index !== activityLog.length - 1 && <Separator />}
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
