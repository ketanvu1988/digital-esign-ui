import { useEffect, useRef, useState } from "react";
import * as pdfjsLib from "pdfjs-dist";

pdfjsLib.GlobalWorkerOptions.workerSrc =
  "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js";

export default function PdfSignatureSelector() {

  const token = localStorage.getItem("token");

  const pdfCanvasRef = useRef(null);
  const overlayCanvasRef = useRef(null);
  const boxRef = useRef(null);
  const fileInputRef = useRef(null);

  const [pdfDoc, setPdfDoc] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);

  // 🔹 Customers
  const [customers, setCustomers] = useState([]);
  const [currentCustomer, setCurrentCustomer] = useState(null);

  // 🔹 Multiple signers
  const [signers, setSigners] = useState([]);

  const drawing = useRef(false);
  const start = useRef({ x: 0, y: 0 });

  const pdfActual = useRef({ w: 0, h: 0 });
  const rendered = useRef({ w: 0, h: 0 });

  const BOX_BORDER = 2;

  /* ---------- LOAD CUSTOMERS ---------- */
  useEffect(() => {
    fetch("http://localhost:8080/api/customers", {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(r => r.json())
      .then(setCustomers);
  }, []);

  /* ---------- LOAD PDF ---------- */
  const loadPdf = async (file) => {
    const bytes = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument(bytes).promise;

    setPdfDoc(pdf);
    setTotalPages(pdf.numPages);
    setCurrentPage(1);

    renderPage(pdf, 1);
  };

  /* ---------- RENDER PAGE ---------- */
  const renderPage = async (pdf, pageNum) => {
    const page = await pdf.getPage(pageNum);

    const scale = 1.5;

    const actualVp = page.getViewport({ scale: 1 });
    pdfActual.current = { w: actualVp.width, h: actualVp.height };

    const vp = page.getViewport({ scale });
    rendered.current = { w: vp.width, h: vp.height };

    const pdfCanvas = pdfCanvasRef.current;
    const overlay = overlayCanvasRef.current;

    pdfCanvas.width = vp.width;
    pdfCanvas.height = vp.height;
    overlay.width = vp.width;
    overlay.height = vp.height;

    await page.render({
      canvasContext: pdfCanvas.getContext("2d"),
      viewport: vp
    }).promise;

    boxRef.current.style.width = "0px";
    boxRef.current.style.height = "0px";
  };

  /* ---------- PAGE NAV ---------- */
  const nextPage = () => {
    if (currentPage < totalPages) {
      renderPage(pdfDoc, currentPage + 1);
      setCurrentPage(p => p + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      renderPage(pdfDoc, currentPage - 1);
      setCurrentPage(p => p - 1);
    }
  };

  /* ---------- DRAW ---------- */
  const mouseDown = (e) => {
    if (!currentCustomer) {
      alert("Select customer first");
      return;
    }

    drawing.current = true;
    start.current = {
      x: e.nativeEvent.offsetX,
      y: e.nativeEvent.offsetY
    };

    const box = boxRef.current;
    box.style.left = `${start.current.x}px`;
    box.style.top = `${start.current.y}px`;
    box.style.width = "0px";
    box.style.height = "0px";
  };

  const mouseMove = (e) => {
    if (!drawing.current) return;

    const x = e.nativeEvent.offsetX;
    const y = e.nativeEvent.offsetY;

    const box = boxRef.current;
    box.style.left = `${Math.min(start.current.x, x)}px`;
    box.style.top = `${Math.min(start.current.y, y)}px`;
    box.style.width = `${Math.abs(x - start.current.x)}px`;
    box.style.height = `${Math.abs(y - start.current.y)}px`;
  };

  const mouseUp = (e) => {
    drawing.current = false;

    const endX = e.nativeEvent.offsetX;
    const endY = e.nativeEvent.offsetY;

    const uiX = Math.min(start.current.x, endX) + BOX_BORDER;
    const uiY = Math.min(start.current.y, endY) + BOX_BORDER;
    const uiW = Math.abs(endX - start.current.x) - BOX_BORDER * 2;
    const uiH = Math.abs(endY - start.current.y) - BOX_BORDER * 2;

    const scaleX = pdfActual.current.w / rendered.current.w;
    const scaleY = pdfActual.current.h / rendered.current.h;

    const signer = {
      customerId: currentCustomer.id,
      email: currentCustomer.email,
      pageNumber: currentPage,
      x: uiX * scaleX,
      y: uiY * scaleY,
      width: uiW * scaleX,
      height: uiH * scaleY
    };

    setSigners(prev =>
      [...prev.filter(s => s.customerId !== currentCustomer.id), signer]
    );

    alert(`Signature position saved for ${currentCustomer.name}`);
  };

  /* ---------- UPLOAD ---------- */
  const upload = async () => {
    if (!fileInputRef.current.files.length) {
      alert("Select PDF first");
      return;
    }

    if (signers.length === 0) {
      alert("Add at least one signer");
      return;
    }

    const formData = new FormData();
    formData.append("file", fileInputRef.current.files[0]);
    formData.append("meta", JSON.stringify({
      title: "Document Signing",
      signers
    }));

    await fetch("http://localhost:8080/api/documents/create", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: formData
    });

    alert("Document sent for signing");
  };

  return (
    <div style={{ display: "flex", gap: 20 }}>

      {/* LEFT */}
      <div style={{ width: 260 }}>
        <h3>Customers</h3>
        {customers.map(c => (
          <button
            key={c.id}
            style={{
              display: "block",
              width: "100%",
              marginBottom: 6,
              background: currentCustomer?.id === c.id ? "#145374" : "#eee",
              color: currentCustomer?.id === c.id ? "#fff" : "#000"
            }}
            onClick={() => setCurrentCustomer(c)}
          >
            {c.name}
          </button>
        ))}

        <br />
        <input
          type="file"
          accept="application/pdf"
          ref={fileInputRef}
          onChange={(e) => loadPdf(e.target.files[0])}
        />

        <br /><br />
        <button onClick={upload}>Send for Signing</button>
      </div>

      {/* PDF */}
      <div>
        <div style={{ marginBottom: 10 }}>
          <button onClick={prevPage}>⬅</button>
          <span style={{ margin: "0 10px" }}>
            {currentPage} / {totalPages}
          </span>
          <button onClick={nextPage}>➡</button>
        </div>

        <div style={{ position: "relative", border: "1px solid #aaa" }}>
          <canvas ref={pdfCanvasRef} />
          <canvas
            ref={overlayCanvasRef}
            style={{ position: "absolute", top: 0, left: 0 }}
            onMouseDown={mouseDown}
            onMouseMove={mouseMove}
            onMouseUp={mouseUp}
          />
          <div
            ref={boxRef}
            style={{
              position: "absolute",
              border: "2px dashed red",
              pointerEvents: "none"
            }}
          />
        </div>
      </div>
    </div>
  );
}
