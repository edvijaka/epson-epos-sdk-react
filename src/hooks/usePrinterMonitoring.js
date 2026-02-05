import { useState, useEffect, useCallback } from "react";
import { MONITOR_INTERVAL } from "../constants";

export const usePrinterMonitoring = (printerRef, isConnected) => {
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [coverStatus, setCoverStatus] = useState("unknown");

  // Cover event handlers
  const handleCoverOk = useCallback(() => {
    setCoverStatus("closed");
    console.log("Cover is closed");
  }, []);

  const handleCoverOpen = useCallback(() => {
    setCoverStatus("open");
    console.log("Cover is open");
  }, []);

  // Start monitoring function
  const startMonitoring = useCallback(() => {
    if (!printerRef.current) {
      console.error("Printer not connected");
      return;
    }

    try {
      // Set interval if configurable
      if (printerRef.current.interval !== undefined) {
        printerRef.current.interval = MONITOR_INTERVAL;
      }

      // Register cover event handlers
      printerRef.current.oncoverok = handleCoverOk;
      printerRef.current.oncoveropen = handleCoverOpen;

      // Start monitoring
      printerRef.current.startMonitor();
      setIsMonitoring(true);
      console.log("Monitoring started");
    } catch (error) {
      console.error("Failed to start monitoring:", error);
      setCoverStatus("unknown");
    }
  }, [printerRef, handleCoverOk, handleCoverOpen]);

  // Stop monitoring function
  const stopMonitoring = useCallback(() => {
    if (printerRef.current && isMonitoring) {
      try {
        if (printerRef.current.stopMonitor) {
          printerRef.current.stopMonitor();
        }
        // Remove event handlers
        printerRef.current.oncoverok = null;
        printerRef.current.oncoveropen = null;
        setIsMonitoring(false);
        console.log("Monitoring stopped");
      } catch (error) {
        console.error("Failed to stop monitoring:", error);
      }
    }
  }, [printerRef, isMonitoring]);

  // Auto-start monitoring when connected
  useEffect(() => {
    if (isConnected && printerRef.current && !isMonitoring) {
      startMonitoring();
    }
  }, [isConnected, printerRef, isMonitoring, startMonitoring]);

  // Stop monitoring when disconnected
  useEffect(() => {
    if (!isConnected && isMonitoring) {
      stopMonitoring();
      setCoverStatus("unknown");
    }
  }, [isConnected, isMonitoring, stopMonitoring]);

  // Cleanup on component unmount
  useEffect(() => {
    return () => {
      if (printerRef.current && isMonitoring) {
        try {
          if (printerRef.current.stopMonitor) {
            printerRef.current.stopMonitor();
          }
          printerRef.current.oncoverok = null;
          printerRef.current.oncoveropen = null;
        } catch (error) {
          console.error("Failed to stop monitoring on unmount:", error);
        }
      }
    };
  }, [printerRef, isMonitoring]);

  return {
    isMonitoring,
    coverStatus,
    startMonitoring,
    stopMonitoring,
  };
};
