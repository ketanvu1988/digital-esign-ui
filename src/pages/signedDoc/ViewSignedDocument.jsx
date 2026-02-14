import { useEffect, useState } from "react";
import "./ViewSignedDocuments.css";

export default function ViewSignedDocuments() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);

  // pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;

  const token = localStorage.getItem("token");

  useEffect(() => {
    fetch("http://localhost:8080/api/documents/my", {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
      .then(res => {
        if (!res.ok) throw new Error("Unauthorized");
        return res.json();
      })
      .then(data => {
        setDocuments(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const viewSignedDocument = (docId) => {
    window.open(
      `http://localhost:8080/api/documents/view-signed?documentId=${docId}`,
      "_blank"
    );
  };

  // pagination logic
  const totalPages = Math.ceil(documents.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const currentDocs = documents.slice(startIndex, startIndex + rowsPerPage);

  if (loading) {
    return <div className="page">Loading documents...</div>;
  }

  return (
    <div className="page">
      <h2>Signed & Pending Documents</h2>

      <div className="table-wrapper">
        <table className="doc-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Created At</th>
              <th>Total Signers</th>
              <th>Signed</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {currentDocs.map(doc => (
              <tr key={doc.documentId}>
                <td>{doc.documentId}</td>
                <td>{new Date(doc.createdAt).toLocaleString()}</td>
                <td>{doc.totalSigners}</td>
                <td>{doc.signedCount}</td>
                <td>
                  <span className={`status ${doc.status.toLowerCase()}`}>
                    {doc.status}
                  </span>
                </td>
                <td>
                  {doc.status === "COMPLETED" ? (
                    <button
                      className="view-btn"
                      onClick={() => viewSignedDocument(doc.documentId)}
                    >
                      View Signed
                    </button>
                  ) : (
                    <span className="pending-text">—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* PAGINATION */}
      <div className="pagination">
        <button
          disabled={currentPage === 1}
          onClick={() => setCurrentPage(p => p - 1)}
        >
          Prev
        </button>

        {Array.from({ length: totalPages }, (_, i) => (
          <button
            key={i}
            className={currentPage === i + 1 ? "active" : ""}
            onClick={() => setCurrentPage(i + 1)}
          >
            {i + 1}
          </button>
        ))}

        <button
          disabled={currentPage === totalPages}
          onClick={() => setCurrentPage(p => p + 1)}
        >
          Next
        </button>
      </div>
    </div>
  );
}
