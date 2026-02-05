import { useState, useRef } from "react";
import { ConnectionStatus } from "../constants";

export const usePrinterConnection = () => {
  const [printerIPAddress, setPrinterIPAddress] = useState("192.168.0.121");
  const [printerPort, setPrinterPort] = useState("8008");
  const [connectionStatus, setConnectionStatus] = useState(ConnectionStatus.DISCONNECTED);
  const [errorMessage, setErrorMessage] = useState("");
  const ePosDevice = useRef();
  const printer = useRef();

  const connect = (onConnected) => {
    setConnectionStatus(ConnectionStatus.CONNECTING);
    setErrorMessage("");

    if (!printerIPAddress) {
      setConnectionStatus(ConnectionStatus.ERROR);
      setErrorMessage("Type the printer IP address");
      return;
    }
    if (!printerPort) {
      setConnectionStatus(ConnectionStatus.ERROR);
      setErrorMessage("Type the printer port");
      return;
    }

    setConnectionStatus(ConnectionStatus.CONNECTING);

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
              setConnectionStatus(ConnectionStatus.CONNECTED);
              setErrorMessage("");
              // Call onConnected callback if provided
              if (onConnected) {
                onConnected();
              }
            } else {
              setConnectionStatus(ConnectionStatus.ERROR);
              setErrorMessage(`Error: ${retcode}`);
            }
          }
        );
      } else {
        setConnectionStatus(ConnectionStatus.ERROR);
        setErrorMessage(`Error: ${data}`);
      }
    });
  };

  const isConnected = connectionStatus === ConnectionStatus.CONNECTED;

  return {
    printerIPAddress,
    setPrinterIPAddress,
    printerPort,
    setPrinterPort,
    connectionStatus,
    errorMessage,
    connect,
    printer,
    ePosDevice,
    isConnected,
  };
};
