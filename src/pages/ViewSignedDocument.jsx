import { useSearchParams } from "react-router-dom";

export default function ViewSignedDocument() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  if (!token) {
    return <h2>Invalid or missing token</h2>;
  }

  const pdfUrl =
    `http://localhost:8080/api/documents/view-signed?token=${token}#zoom=page-fit&toolbar=1&navpanes=0`;

  return (
    <div style={styles.page}>
      <iframe
        src={pdfUrl}
        title="Signed PDF"
        style={styles.iframe}
      />
    </div>
  );
}

/* ---------- STYLES ---------- */
const styles = {
  page: {
    height: "100vh",
    width: "100vw",
    margin: 0,
    padding: 0,
    overflow: "hidden",
    backgroundColor: "#111",
  },

  iframe: {
    width: "100vw",
    height: "100vh",
    border: "none",
  },
};
