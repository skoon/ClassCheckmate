import { useState, useEffect } from "react";
import type { Activity } from "@/lib/types";
import { toast } from "@/hooks/use-toast";

export const useActivityLog = () => {
  const [activityLog, setActivityLog] = useState<Activity[]>([]);

  useEffect(() => {
    const storedActivityLog = localStorage.getItem("activityLog");
    if (storedActivityLog) {
      setActivityLog(JSON.parse(storedActivityLog));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("activityLog", JSON.stringify(activityLog));
  }, [activityLog]);

  const handleCheckOut = (selectedStudent: string | null, location: string) => {
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

  const handleCheckIn = (selectedStudent: string | null) => {
    if (!selectedStudent) {
      toast({
        title: "Error",
        description: "Please select a student.",
        variant: "destructive",
      });
      return false; // Indicate failure or that no action was taken
    }

    const now = new Date();
    const checkInTime = now.toLocaleTimeString();

    const lastCheckOut = activityLog.find(
      (activity) => activity.student === selectedStudent && !activity.checkInTime
    );

    if (lastCheckOut) {
      const checkOutDate = new Date();
      const [hoursCO, minutesCO, secondsCO] = lastCheckOut.checkOutTime.split(':').map(Number);
      checkOutDate.setHours(hoursCO);
      checkOutDate.setMinutes(minutesCO);
      checkOutDate.setSeconds(secondsCO);

      const checkInDate = new Date();
      const [hoursCI, minutesCI, secondsCI] = checkInTime.split(':').map(Number);
      checkInDate.setHours(hoursCI);
      checkInDate.setMinutes(minutesCI);
      checkInDate.setSeconds(secondsCI);

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
      toast({
        title: "Check-in Successful",
        description: `${selectedStudent} checked in at ${checkInTime}.`,
      });
      return true; // Indicate success
    } else {
      // This case should ideally not happen if UI is controlled by isStudentCheckedOut
      toast({
        title: "Error",
        description: "No active check-out found for this student.",
        variant: "destructive",
      });
      return false; // Indicate failure
    }
  };

  const isStudentCheckedOut = (selectedStudent: string | null): boolean => {
    if (!selectedStudent) return false;
    return activityLog.some(
      (activity) => activity.student === selectedStudent && !activity.checkInTime
    );
  };

  return { activityLog, setActivityLog, handleCheckOut, handleCheckIn, isStudentCheckedOut };
};
