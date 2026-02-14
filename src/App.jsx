import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/login/login";
import ProtectedRoute from "./component/ProtectedRoute";

import Dashboard from "./pages/dashboard/Dashboard";
import DashboardHome from "./pages/dashboard/DashboardHome";
import PdfSignatureSelector from "./pages/PdfSignatureSelector";
import ViewSignedDocument from "./pages/signedDoc/ViewSignedDocument";
import Customers from "./pages/customer/Customers";
import SignDocument from "./pages/sign/SignDocument";
// import Customers from "./pages/customers/Customers";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* PUBLIC */}
        <Route path="/" element={<Login />} />
        <Route path="/sign" element={<SignDocument/>} />


        {/* PROTECTED DASHBOARD */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        >
          {/* when user visits /dashboard directly, show home */}
          <Route index element={<DashboardHome />} />
          <Route path="home" element={<DashboardHome />} />
          <Route path="requestsign" element={<PdfSignatureSelector />} />
          <Route path="view-signed" element={<ViewSignedDocument />} />
          <Route path="customers" element={<Customers />} />
          {/* <Route path="customers" element={<Customers />} /> */}
        </Route>

      </Routes>
    </BrowserRouter>
  );
}

export default App;
