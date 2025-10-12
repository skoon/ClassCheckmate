import { useState, useEffect } from "react";
import type { Activity } from "@/lib/types";
import { toast } from "@/hooks/use-toast";

export const useSavedLogs = (
  activityLog: Activity[], // Current activity log
  setActivityLog: (log: Activity[]) => void // Setter for the main activity log
) => {
  const [open, setOpen] = useState(false); // For the save dialog
  const [saveName, setSaveName] = useState("");
  const [savedLogs, setSavedLogs] = useState<string[]>([]); // List of saved log names
  const [selectedLog, setSelectedLog] = useState<string | null>(null); // Name of log selected to load

  // Effect for loading savedLogKeys from localStorage
  useEffect(() => {
    const savedLogKeys = Object.keys(localStorage).filter((key) =>
      key.startsWith("activityLog_")
    );
    const logNames = savedLogKeys.map((key) => key.replace("activityLog_", ""));
    setSavedLogs(logNames);
  }, []);

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
    setOpen(false); // Close dialog
    setSaveName(""); // Reset save name
    setSavedLogs((prevLogs) => { // Update the list of saved logs
      if (!prevLogs.includes(saveName)) {
        return [...prevLogs, saveName];
      }
      return prevLogs;
    });

    toast({
      title: "Save Successful",
      description: `Activity log saved as ${saveName}.`,
    });
  };

  const handleClearActivityLog = () => {
    setActivityLog([]); // Clear the main activity log
    localStorage.removeItem("activityLog"); // Clear the default/current activity log from storage
    toast({
      title: "Clear Successful",
      description: "Current activity log cleared.",
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

    const loadedLogData = localStorage.getItem(`activityLog_${selectedLog}`);
    if (loadedLogData) {
      setActivityLog(JSON.parse(loadedLogData)); // Update the main activity log
      toast({
        title: "Load Successful",
        description: `Activity log "${selectedLog}" loaded.`,
      });
    } else {
      toast({
        title: "Error",
        description: `Could not load the selected log "${selectedLog}".`,
        variant: "destructive",
      });
    }
  };

  return {
    open,
    setOpen,
    saveName,
    setSaveName,
    savedLogs,
    setSavedLogs, // Added for potential direct manipulation if ever needed, though not in current plan
    selectedLog,
    setSelectedLog,
    handleSaveActivityLog,
    handleClearActivityLog,
    handleLoadActivityLog,
  };
};
