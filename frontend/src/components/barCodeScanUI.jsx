import React from "react";
import { useBarcodeScanner } from "../hooks/useBarcodeScanner";

function BarCodeScanUI() {
  const { videoRef, code, error } = useBarcodeScanner();

  return (
    <div>
      <video ref={videoRef} style={{ width: "20%" }} />
      {code && <p>Scanned Code: {code}</p>}
      {error && <p style={{ color: "red" }}>Error: {error}</p>}
    </div>
  );
}

export default BarCodeScanUI;
