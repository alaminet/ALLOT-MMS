import { useEffect, useRef, useState } from "react";
import { BrowserMultiFormatReader } from "@zxing/library";

export function useContinuousBarcodeScanner() {
  const videoRef = useRef(null);
  const [codes, setCodes] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const codeReader = new BrowserMultiFormatReader();

    async function startScanner() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" },
        });

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();

          codeReader.decodeFromVideoDevice(
            null,
            videoRef.current,
            (result, err) => {
              if (result) {
                const scannedCode = result.getText();

                // Append only if not already in list
                setCodes((prev) => {
                  if (!prev.includes(scannedCode)) {
                    return [...prev, scannedCode];
                  }
                  return prev;
                });
              }
              if (err && !(err.name === "NotFoundException")) {
                setError(err.message);
              }
            },
          );
        }
      } catch (err) {
        setError(err.message);
      }
    }

    startScanner();

    return () => {
      codeReader.reset();
      if (videoRef.current?.srcObject) {
        videoRef.current.srcObject.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  return { videoRef, codes, error };
}
