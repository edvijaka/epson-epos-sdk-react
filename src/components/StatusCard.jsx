import React from "react";
import { Card, Badge } from "react-bootstrap";
import { ConnectionStatus, getConnectionStatusText } from "../constants";

const StatusCard = ({ connectionStatus, errorMessage, isMonitoring, coverStatus, isConnected }) => {
  const getConnectionBadgeVariant = () => {
    if (connectionStatus === ConnectionStatus.CONNECTED) return "success";
    if (connectionStatus === ConnectionStatus.ERROR) return "danger";
    if (connectionStatus === ConnectionStatus.CONNECTING) return "warning";
    return "secondary";
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
            {getConnectionStatusText(connectionStatus, errorMessage)}
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
