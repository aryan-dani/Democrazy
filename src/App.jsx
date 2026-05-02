import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import LandingPage from "./pages/LandingPage";
import SimulationPage from "./pages/SimulationPage";
import QuizPage from "./pages/QuizPage";
import DashboardPage from "./pages/DashboardPage";
import TimelinePage from "./pages/TimelinePage";
import FirestoreProgressBridge from "./components/FirestoreProgressBridge";
import AIChatDrawer from "./components/AIChatDrawer";
import { ProgressProvider } from "./hooks/useProgress";
import { AuthProvider } from "./context/AuthContext";

export default function App() {
  return (
    <AuthProvider>
      <ProgressProvider>
        <FirestoreProgressBridge />
        <BrowserRouter>
          <Navbar />
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/simulation" element={<SimulationPage />} />
            <Route path="/timeline" element={<TimelinePage />} />
            <Route path="/quiz" element={<QuizPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
          </Routes>
          <AIChatDrawer />
        </BrowserRouter>
      </ProgressProvider>
    </AuthProvider>
  );
}
