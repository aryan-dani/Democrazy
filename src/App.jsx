import { Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import FirestoreProgressBridge from "./components/FirestoreProgressBridge";
import AIChatDrawer from "./components/AIChatDrawer";
import LoadingState from "./components/LoadingState";
import { ProgressProvider } from "./hooks/useProgress";
import { AuthProvider } from "./context/AuthContext";

const LandingPage = lazy(() => import("./pages/LandingPage.jsx"));
const SimulationPage = lazy(() => import("./pages/SimulationPage.jsx"));
const QuizPage = lazy(() => import("./pages/QuizPage.jsx"));
const DashboardPage = lazy(() => import("./pages/DashboardPage.jsx"));
const TimelinePage = lazy(() => import("./pages/TimelinePage.jsx"));

export default function App() {
  return (
    <AuthProvider>
      <ProgressProvider>
        <FirestoreProgressBridge />
        <BrowserRouter>
          <a href="#main-content" className="skip-to-content">
            Skip to content
          </a>
          <Navbar />
          <main id="main-content" tabIndex={-1}>
            <Suspense
              fallback={
                <div className="dc-route-fallback">
                  <LoadingState label="Loading page..." />
                </div>
              }
            >
              <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/simulation" element={<SimulationPage />} />
                <Route path="/timeline" element={<TimelinePage />} />
                <Route path="/quiz" element={<QuizPage />} />
                <Route path="/dashboard" element={<DashboardPage />} />
              </Routes>
            </Suspense>
          </main>
          <AIChatDrawer />
        </BrowserRouter>
      </ProgressProvider>
    </AuthProvider>
  );
}
