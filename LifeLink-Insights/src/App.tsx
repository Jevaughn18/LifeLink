import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import RegionalMap from "./pages/RegionalMap";
import DiseaseTrends from "./pages/DiseaseTrends";
import RiskScoring from "./pages/RiskScoring";
import ProductOptimizer from "./pages/ProductOptimizer";
import ClaimsPrediction from "./pages/ClaimsPrediction";
import PreventiveCare from "./pages/PreventiveCare";
import FraudDetection from "./pages/FraudDetection";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/regional-map" element={<RegionalMap />} />
          <Route path="/disease-trends" element={<DiseaseTrends />} />
          <Route path="/risk-scoring" element={<RiskScoring />} />
          <Route path="/product-optimizer" element={<ProductOptimizer />} />
          <Route path="/claims-prediction" element={<ClaimsPrediction />} />
          <Route path="/preventive-care" element={<PreventiveCare />} />
          <Route path="/fraud-detection" element={<FraudDetection />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
