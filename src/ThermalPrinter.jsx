import React, { useRef, useState, useEffect, useCallback } from "react";
import {
  Container,
  Form,
  Button,
  Badge,
  Card,
  Row,
  Col,
  Spinner,
} from "react-bootstrap";

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
    <Container className="mt-4">
      <Row>
        <Col lg={4} md={6} className="mb-4">
          <Card>
            <Card.Header>Printer Connection</Card.Header>
            <Card.Body>
              <Form>
                <Form.Group className="mb-3">
                  <Form.Label>Printer IP Address</Form.Label>
                  <Form.Control
                    id="printerIPAddress"
                    type="text"
                    placeholder="192.168.0.121"
                    value={printerIPAddress}
                    onChange={(e) => setPrinterIPAddress(e.target.value)}
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Printer Port</Form.Label>
                  <Form.Control
                    id="printerPort"
                    type="text"
                    placeholder="8008"
                    value={printerPort}
                    onChange={(e) => setPrinterPort(e.target.value)}
                  />
                </Form.Group>
                <Button
                  variant="primary"
                  disabled={
                    connectionStatus === STATUS_CONNECTED ||
                    connectionStatus === "Connecting ..."
                  }
                  onClick={() => connect()}
                >
                  {connectionStatus === "Connecting ..." && (
                    <Spinner
                      as="span"
                      animation="border"
                      size="sm"
                      role="status"
                      aria-hidden="true"
                      className="me-2"
                    />
                  )}
                  {connectionStatus === "Connecting ..."
                    ? "Connecting..."
                    : "Connect"}
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={4} md={6} className="mb-4">
          <Card>
            <Card.Header>Print Text</Card.Header>
            <Card.Body>
              <Form>
                <Form.Group className="mb-3">
                  <Form.Label>Text to Print</Form.Label>
                  <Form.Control
                    id="textToPrint"
                    as="textarea"
                    rows={3}
                    placeholder="Enter text to print..."
                    value={textToPrint}
                    onChange={(e) => setTextToPrint(e.target.value)}
                  />
                </Form.Group>
                <Button
                  variant="success"
                  disabled={connectionStatus !== STATUS_CONNECTED}
                  onClick={() => print(textToPrint)}
                >
                  Print
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={4} md={12} className="mb-4">
          <Card>
            <Card.Header>Printer Status</Card.Header>
            <Card.Body>
              <div className="mb-3">
                <strong className="me-2">Connection:</strong>
                <Badge
                  bg={
                    connectionStatus === STATUS_CONNECTED
                      ? "success"
                      : "secondary"
                  }
                >
                  {connectionStatus || "Not Connected"}
                </Badge>
              </div>

              {connectionStatus === STATUS_CONNECTED && (
                <>
                  <div className="mb-3">
                    <strong className="me-2">Monitoring:</strong>
                    <Badge bg={isMonitoring ? "success" : "danger"}>
                      {isMonitoring ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                  <div>
                    <strong className="me-2">Cover Status:</strong>
                    <Badge
                      bg={
                        coverStatus === "open"
                          ? "danger"
                          : coverStatus === "closed"
                          ? "success"
                          : "secondary"
                      }
                    >
                      {coverStatus === "open"
                        ? "Open"
                        : coverStatus === "closed"
                        ? "Closed"
                        : "Unknown"}
                    </Badge>
                  </div>
                </>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default ThermalPrinter;
