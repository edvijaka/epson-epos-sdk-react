export const ConnectionStatus = {
  DISCONNECTED: "DISCONNECTED",
  CONNECTING: "CONNECTING",
  CONNECTED: "CONNECTED",
  ERROR: "ERROR",
};

export const MONITOR_INTERVAL = 1000; // milliseconds

export const getConnectionStatusText = (status, errorMessage = "") => {
  switch (status) {
    case ConnectionStatus.DISCONNECTED:
      return "Not Connected";
    case ConnectionStatus.CONNECTING:
      return "Connecting...";
    case ConnectionStatus.CONNECTED:
      return "Connected";
    case ConnectionStatus.ERROR:
      return errorMessage || "Connection Error";
    default:
      return "Unknown";
  }
};
