import { useEffect, useRef, useState } from "react";
import { BrowserMultiFormatReader } from "@zxing/library";

export function useBarcodeScanner() {
  const videoRef = useRef(null);
  const [code, setCode] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const codeReader = new BrowserMultiFormatReader();

    async function startScanner() {
      try {
        // Request camera stream
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" },
        });

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();

          // Start decoding from video
          codeReader.decodeFromVideoDevice(
            null,
            videoRef.current,

            (result, err) => {
              if (result) {
                setCode(result.getText()); // decoded barcode string
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

  return { videoRef, code, error };
}
