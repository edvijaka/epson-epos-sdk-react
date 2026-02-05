import React, { useState } from "react";
import {
  Container,
  Form,
  Button,
  Card,
  Row,
  Col,
  Spinner,
} from "react-bootstrap";
import { usePrinterConnection } from "./hooks/usePrinterConnection";
import { usePrinterMonitoring } from "./hooks/usePrinterMonitoring";
import StatusCard from "./components/StatusCard";
import { ConnectionStatus } from "./constants";

const ThermalPrinter = () => {
  const [textToPrint, setTextToPrint] = useState("");

  const {
    printerIPAddress,
    setPrinterIPAddress,
    printerPort,
    setPrinterPort,
    connectionStatus,
    errorMessage,
    connect,
    printer,
    isConnected,
  } = usePrinterConnection();

  const { isMonitoring, coverStatus } = usePrinterMonitoring(
    printer,
    isConnected
  );

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
                    isConnected || connectionStatus === ConnectionStatus.CONNECTING
                  }
                  onClick={() => connect()}
                >
                  {connectionStatus === ConnectionStatus.CONNECTING && (
                    <Spinner
                      as="span"
                      animation="border"
                      size="sm"
                      role="status"
                      aria-hidden="true"
                      className="me-2"
                    />
                  )}
                  {connectionStatus === ConnectionStatus.CONNECTING
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
                  disabled={!isConnected}
                  onClick={() => print(textToPrint)}
                >
                  Print
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={4} md={12} className="mb-4">
          <StatusCard
            connectionStatus={connectionStatus}
            errorMessage={errorMessage}
            isMonitoring={isMonitoring}
            coverStatus={coverStatus}
            isConnected={isConnected}
          />
        </Col>
      </Row>
    </Container>
  );
};

export default ThermalPrinter;
