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
import type { Activity } from "@/lib/types";
import { exportActivityLogToCSV } from "@/lib/csv-utils";
import { useStudentList } from "@/hooks/use-student-list";
import { useActivityLog } from "@/hooks/use-activity-log";
import { useSavedLogs } from "@/hooks/use-saved-logs"; // Import the new hook
import { locations } from "@/lib/constants";

export default function Home() {
  const { students, studentFile, handleFileChange, handleImportCSV } = useStudentList();
  const {
    activityLog,
    setActivityLog,
    handleCheckOut: hookHandleCheckOut,
    handleCheckIn: hookHandleCheckIn,
    isStudentCheckedOut: hookIsStudentCheckedOut
  } = useActivityLog();

  // Use the saved logs hook
  const {
    open,
    setOpen,
    saveName,
    setSaveName,
    savedLogs,
    // setSavedLogs, // Not directly used from page, managed by hook
    selectedLog,
    setSelectedLog,
    handleSaveActivityLog,
    handleClearActivityLog, // This now comes from useSavedLogs
    handleLoadActivityLog
  } = useSavedLogs(activityLog, setActivityLog); // Pass current log and its setter

  const [selectedStudent, setSelectedStudent] = useState<string | null>(null);
  // States open, saveName, savedLogs, selectedLog are now managed by useSavedLogs
  // Effect for loading savedLogKeys is now in useSavedLogs

  const currentHandleCheckOut = (location: string) => {
    hookHandleCheckOut(selectedStudent, location);
  };

  const currentHandleCheckIn = () => {
    const success = hookHandleCheckIn(selectedStudent);
    if (success) {
      setSelectedStudent(null);
    }
  };

  const isStudentCurrentlyCheckedOut = hookIsStudentCheckedOut(selectedStudent);

  // handleSaveActivityLog, handleClearActivityLog, handleLoadActivityLog are now from useSavedLogs

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

          {selectedStudent && !isStudentCurrentlyCheckedOut && (
            <div className="grid grid-cols-3 gap-2">
              {locations.map((location) => (
                <Button
                  key={location}
                  onClick={() => currentHandleCheckOut(location)}
                  className="bg-secondary text-secondary-foreground hover:bg-secondary/80"
                >
                  {location}
                </Button>
              ))}
            </div>
          )}

          {selectedStudent && isStudentCurrentlyCheckedOut && (
            <Button onClick={currentHandleCheckIn} className="bg-accent text-background hover:bg-accent-foreground">
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
          onClick={() => exportActivityLogToCSV(activityLog)}
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
