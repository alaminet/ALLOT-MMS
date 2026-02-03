import React from "react";
import { useContinuousBarcodeScanner } from "../hooks/useContinuousBarcodeScanner";

function BarCodeListScanUI() {
  const { videoRef, codes, error } = useContinuousBarcodeScanner();

  return (
    <div>
      <video ref={videoRef} style={{ width: "20%" }} />
      <h3>Scanned Codes:</h3>
      <ul>
        {codes.map((c, i) => (
          <li key={i}>{c}</li>
        ))}
      </ul>
      {error && <p style={{ color: "red" }}>Error: {error}</p>}
    </div>
  );
}

export default BarCodeListScanUI;
