import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "@/components/Layout";
import Dashboard from "@/pages/Dashboard";
import QueueHall from "@/pages/QueueHall";
import Dispatch from "@/pages/Dispatch";
import PartsManagement from "@/pages/PartsManagement";
import OutboundRecords from "@/pages/OutboundRecords";

export default function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/queue" element={<QueueHall />} />
          <Route path="/dispatch" element={<Dispatch />} />
          <Route path="/parts" element={<PartsManagement />} />
          <Route path="/outbound" element={<OutboundRecords />} />
        </Routes>
      </Layout>
    </Router>
  );
}
