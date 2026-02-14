import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";

export default function SignDocument() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const [signerData, setSignerData] = useState(null);
  const canvasRef = useRef(null);
  const drawing = useRef(false);

  // ===============================
  // Fetch signer details
  // ===============================
  useEffect(() => {
    // if (!token) {
    //   alert("No token provided in URL");
    //   return;
    // }

    fetch(`http://localhost:8080/api/documents/open?token=b60bd6b5-f43f-4325-a1a4-5aacaa1c8686`)
      .then((r) => {
        if (!r.ok) throw new Error("Invalid token");
        return r.json();
      })
      .then((data) => {
        setSignerData(data);
      })
      .catch(() => alert("Invalid token or error loading signer"));
  }, [token]);

  // ===============================
  // Signature pad logic
  // ===============================
  const startDrawing = () => {
    drawing.current = true;
  };

  const stopDrawing = () => {
    drawing.current = false;
  };

  const draw = (e) => {
    if (!drawing.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    ctx.fillStyle = "black";
    ctx.beginPath();
    ctx.arc(e.nativeEvent.offsetX, e.nativeEvent.offsetY, 2, 0, Math.PI * 2);
    ctx.fill();
  };

  const clearSig = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  // ===============================
  // Submit signature
  // ===============================
  const submitSignature = () => {
    const canvas = canvasRef.current;
    const imgData = canvas.toDataURL("image/png");

    fetch("http://localhost:8080/api/documents/sign", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        token: "b60bd6b5-f43f-4325-a1a4-5aacaa1c8686",
        signature: imgData
      })
    })
      .then((r) => r.text())
      .then((res) => alert("Signature uploaded: " + res))
      .catch(() => alert("Upload failed"));
  };

  // ===============================
  // UI
  // ===============================
  return (
    <div
      style={{
        fontFamily: "Arial",
        display: "flex",
        flexDirection: "column",
        alignItems: "center"
      }}
    >
      <h2>Document Signing Page</h2>

      {!signerData && <p>Loading document...</p>}

      {signerData && (
        <>
          {/* Signer Info */}
          <div style={{ marginBottom: 10 }}>
            <b>Signer:</b> {signerData.signerName} ({signerData.email}) <br />
            <b>Page:</b> {signerData.pageNumber} | X:{signerData.x}, Y:
            {signerData.y}
          </div>

          {/* PDF Viewer */}
          <iframe
            title="pdfViewer"
            src={`http://localhost:8080${signerData.documentPath}`}
            style={{
              width: "80%",
              height: "600px",
              border: "1px solid #ccc"
            }}
          />

          <h3>Draw your signature below:</h3>

          {/* Signature Pad */}
          <canvas
            ref={canvasRef}
            width={500}
            height={200}
            style={{ border: "2px solid black" }}
            onMouseDown={startDrawing}
            onMouseUp={stopDrawing}
            onMouseMove={draw}
            onMouseLeave={stopDrawing}
          />

          <div style={{ marginTop: 20 }}>
            <button
              onClick={clearSig}
              style={{
                padding: "10px 20px",
                marginRight: 10,
                background: "gray",
                color: "white",
                border: "none",
                cursor: "pointer"
              }}
            >
              Clear
            </button>

            <button
              onClick={submitSignature}
              style={{
                padding: "10px 20px",
                background: "darkblue",
                color: "white",
                border: "none",
                cursor: "pointer"
              }}
            >
              Submit Signature
            </button>
          </div>
        </>
      )}
    </div>
  );
}
