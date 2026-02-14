import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import "./SignDocument.css";

export default function SignDocument() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const [signer, setSigner] = useState(null);
  const [error, setError] = useState("");

  const canvasRef = useRef(null);
  const drawing = useRef(false);

  /* ---------------- LOAD SIGNER ---------------- */
  useEffect(() => {
    if (!token) {
      setError("Invalid or missing token");
      return;
    }

    fetch(`http://localhost:8080/api/documents/open?token=${token}`)
      .then(res => {
        if (!res.ok) throw new Error("Invalid token");
        return res.json();
      })
      .then(data => setSigner(data))
      .catch(() => setError("Invalid or expired signing link"));
  }, [token]);

  /* ---------------- SIGNATURE PAD ---------------- */
  const startDraw = () => (drawing.current = true);
  const endDraw = () => (drawing.current = false);

  const draw = e => {
    if (!drawing.current) return;
    const ctx = canvasRef.current.getContext("2d");
    ctx.fillStyle = "#000";
    ctx.beginPath();
    ctx.arc(e.nativeEvent.offsetX, e.nativeEvent.offsetY, 2, 0, Math.PI * 2);
    ctx.fill();
  };

  const clearSignature = () => {
    const ctx = canvasRef.current.getContext("2d");
    ctx.clearRect(0, 0, 500, 200);
  };

  /* ---------------- SUBMIT SIGN ---------------- */
  const submitSignature = () => {
    const image = canvasRef.current.toDataURL("image/png");

    fetch("http://localhost:8080/api/documents/sign", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        token,
        signature: image
      })
    })
      .then(res => {
        if (!res.ok) throw new Error();
        return res.text();
      })
      .then(() => alert("Document signed successfully"))
      .catch(() => alert("Failed to submit signature"));
  };

  /* ---------------- UI ---------------- */
  if (error) return <div className="sign-page error">{error}</div>;
  if (!signer) return <div className="sign-page">Loading document...</div>;

  return (
    <div className="sign-page">
      <h2>Sign Document</h2>

      <div className="sign-info">
        <b>Signer:</b> {signer.signerName} ({signer.email})<br />
        <b>Page:</b> {signer.pageNumber}
      </div>

      <iframe
        title="PDF Viewer"
        className="pdf-viewer"
        src={`http://localhost:8080${signer.documentPath}`}
      />

      <h3>Draw your signature</h3>

      <canvas
        ref={canvasRef}
        width={500}
        height={200}
        className="signature-pad"
        onMouseDown={startDraw}
        onMouseUp={endDraw}
        onMouseMove={draw}
      />

      <div className="actions">
        <button className="btn secondary" onClick={clearSignature}>
          Clear
        </button>
        <button className="btn primary" onClick={submitSignature}>
          Submit Signature
        </button>
      </div>
    </div>
  );
}


