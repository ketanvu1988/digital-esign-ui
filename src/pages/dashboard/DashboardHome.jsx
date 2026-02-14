import { useNavigate } from "react-router-dom";

export default function DashboardHome() {
  const navigate = useNavigate();

  return (
    <>
      <div className="card" onClick={() => navigate("/dashboard/requestsign")}>
        <h4>Create Sign Request</h4>
        <p>Upload documents and send for digital signing.</p>
      </div>

      <div className="card" onClick={() => navigate("/dashboard/view-signed")}>
        <h4>View Signed Documents</h4>
        <p>Track completed and pending signing requests.</p>
      </div>

      <div className="card" onClick={() => navigate("/dashboard/customers")}>
        <h4>Manage Customers</h4>
        <p>Add, update or remove customers.</p>
      </div>
    </>
  );
}
