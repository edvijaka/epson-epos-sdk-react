import React, { useRef, useState, useEffect, useCallback } from "react";

const ThermalPrinter = () => {
  const [printerIPAddress, setPrinterIPAddress] = useState("192.168.0.121");
  const [printerPort, setPrinterPort] = useState("8008");
  const [textToPrint, setTextToPrint] = useState("");
  const [connectionStatus, setConnectionStatus] = useState("");
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [coverStatus, setCoverStatus] = useState("unknown");
  const monitorInterval = 1000; // milliseconds

  const ePosDevice = useRef();
  const printer = useRef();

  const STATUS_CONNECTED = "Connected";

  // Cover event handlers
  const handleCoverOk = () => {
    setCoverStatus("closed");
    console.log("Cover is closed");
  };

  const handleCoverOpen = () => {
    setCoverStatus("open");
    console.log("Cover is open");
  };

  // Start monitoring function
  const startMonitoring = () => {
    if (!printer.current) {
      console.error("Printer not connected");
      return;
    }

    try {
      // Set interval if configurable
      if (printer.current.interval !== undefined) {
        printer.current.interval = monitorInterval;
      }

      // Register cover event handlers
      printer.current.oncoverok = handleCoverOk;
      printer.current.oncoveropen = handleCoverOpen;

      // Start monitoring
      printer.current.startMonitor();
      setIsMonitoring(true);
      console.log("Monitoring started");
    } catch (error) {
      console.error("Failed to start monitoring:", error);
      setCoverStatus("unknown");
    }
  };

  // Stop monitoring function
  const stopMonitoring = useCallback(() => {
    if (printer.current && isMonitoring) {
      try {
        if (printer.current.stopMonitor) {
          printer.current.stopMonitor();
        }
        // Remove event handlers
        printer.current.oncoverok = null;
        printer.current.oncoveropen = null;
        setIsMonitoring(false);
        console.log("Monitoring stopped");
      } catch (error) {
        console.error("Failed to stop monitoring:", error);
      }
    }
  }, [isMonitoring]);

  // Cleanup on component unmount
  useEffect(() => {
    return () => {
      stopMonitoring();
    };
  }, [stopMonitoring]);

  // Stop monitoring when connection is lost
  useEffect(() => {
    if (connectionStatus !== STATUS_CONNECTED && isMonitoring) {
      stopMonitoring();
    }
  }, [connectionStatus, isMonitoring, stopMonitoring]);

  const connect = () => {
    setConnectionStatus("Connecting ...");

    if (!printerIPAddress) {
      setConnectionStatus("Type the printer IP address");
      return;
    }
    if (!printerPort) {
      setConnectionStatus("Type the printer port");
      return;
    }

    setConnectionStatus("Connecting ...");

    let ePosDev = new window.epson.ePOSDevice();
    ePosDevice.current = ePosDev;

    ePosDev.connect(printerIPAddress, printerPort, (data) => {
      if (data === "OK") {
        ePosDev.createDevice(
          "local_printer",
          ePosDev.DEVICE_TYPE_PRINTER,
          { crypto: true, buffer: false },
          (devobj, retcode) => {
            if (retcode === "OK") {
              printer.current = devobj;
              setConnectionStatus(STATUS_CONNECTED);
              // Start monitoring after successful connection
              startMonitoring();
            } else {
              throw retcode;
            }
          }
        );
      } else {
        throw data;
      }
    });
  };

  const print = (text) => {
    let prn = printer.current;
    if (!prn) {
      alert("Not connected to printer");
      return;
    }

    prn.addText(text);
    prn.addFeedLine(5);
    prn.addCut(prn.CUT_FEED);

    prn.send();
  };

  return (
    <div id="thermalPrinter">
      <input
        id="printerIPAddress"
        placeholder="Printer IP Address"
        value={printerIPAddress}
        onChange={(e) => setPrinterIPAddress(e.currentTarget.value)}
      />
      <input
        id="printerPort"
        placeholder="Printer Port"
        value={printerPort}
        onChange={(e) => setPrinterPort(e.currentTarget.value)}
      />
      <button
        disabled={connectionStatus === STATUS_CONNECTED}
        onClick={() => connect()}
      >
        Connect
      </button>
      <span className="status-label">{connectionStatus}</span>
      {connectionStatus === STATUS_CONNECTED && (
        <div style={{ marginTop: "10px" }}>
          <div style={{ marginBottom: "5px" }}>
            <span style={{ fontSize: "12px", color: "#666" }}>
              Monitoring:{" "}
            </span>
            <span
              style={{
                fontSize: "12px",
                color: isMonitoring ? "#28a745" : "#dc3545",
                fontWeight: "bold",
              }}
            >
              {isMonitoring ? "Active" : "Inactive"}
            </span>
          </div>
          <div>
            <span style={{ fontSize: "12px", color: "#666" }}>
              Cover Status:{" "}
            </span>
            <span
              style={{
                fontSize: "12px",
                fontWeight: "bold",
                color:
                  coverStatus === "open"
                    ? "#dc3545"
                    : coverStatus === "closed"
                    ? "#28a745"
                    : "#6c757d",
                padding: "2px 8px",
                borderRadius: "3px",
                backgroundColor:
                  coverStatus === "open"
                    ? "#f8d7da"
                    : coverStatus === "closed"
                    ? "#d4edda"
                    : "#e9ecef",
              }}
            >
              {coverStatus === "open"
                ? "Open"
                : coverStatus === "closed"
                ? "Closed"
                : "Unknown"}
            </span>
          </div>
        </div>
      )}
      <hr />
      <textarea
        id="textToPrint"
        rows="3"
        placeholder="Text to print"
        value={textToPrint}
        onChange={(e) => setTextToPrint(e.currentTarget.value)}
      />
      <button
        disabled={connectionStatus !== STATUS_CONNECTED}
        onClick={() => print(textToPrint)}
      >
        Print
      </button>
    </div>
  );
};

export default ThermalPrinter;
