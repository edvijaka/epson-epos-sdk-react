import { useState, useRef } from "react";
import { STATUS_CONNECTED } from "../constants";

export const usePrinterConnection = () => {
  const [printerIPAddress, setPrinterIPAddress] = useState("192.168.0.121");
  const [printerPort, setPrinterPort] = useState("8008");
  const [connectionStatus, setConnectionStatus] = useState("");
  const ePosDevice = useRef();
  const printer = useRef();

  const connect = (onConnected) => {
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
              // Call onConnected callback if provided
              if (onConnected) {
                onConnected();
              }
            } else {
              setConnectionStatus(`Error: ${retcode}`);
            }
          }
        );
      } else {
        setConnectionStatus(`Error: ${data}`);
      }
    });
  };

  const isConnected = connectionStatus === STATUS_CONNECTED;

  return {
    printerIPAddress,
    setPrinterIPAddress,
    printerPort,
    setPrinterPort,
    connectionStatus,
    connect,
    printer,
    ePosDevice,
    isConnected,
  };
};
