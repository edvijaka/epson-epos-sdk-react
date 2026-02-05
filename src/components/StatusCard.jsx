import React from "react";
import { Card, Badge } from "react-bootstrap";
import { STATUS_CONNECTED } from "../constants";

const StatusCard = ({ connectionStatus, isMonitoring, coverStatus, isConnected }) => {
  const getConnectionBadgeVariant = () => {
    return isConnected ? "success" : "secondary";
  };

  const getMonitoringBadgeVariant = () => {
    return isMonitoring ? "success" : "danger";
  };

  const getCoverBadgeVariant = () => {
    if (coverStatus === "open") return "danger";
    if (coverStatus === "closed") return "success";
    return "secondary";
  };

  const getCoverStatusText = () => {
    if (coverStatus === "open") return "Open";
    if (coverStatus === "closed") return "Closed";
    return "Unknown";
  };

  return (
    <Card>
      <Card.Header>Printer Status</Card.Header>
      <Card.Body>
        <div className="mb-3">
          <strong className="me-2">Connection:</strong>
          <Badge bg={getConnectionBadgeVariant()}>
            {connectionStatus || "Not Connected"}
          </Badge>
        </div>

        {isConnected && (
          <>
            <div className="mb-3">
              <strong className="me-2">Monitoring:</strong>
              <Badge bg={getMonitoringBadgeVariant()}>
                {isMonitoring ? "Active" : "Inactive"}
              </Badge>
            </div>
            <div>
              <strong className="me-2">Cover Status:</strong>
              <Badge bg={getCoverBadgeVariant()}>
                {getCoverStatusText()}
              </Badge>
            </div>
          </>
        )}
      </Card.Body>
    </Card>
  );
};

export default StatusCard;
