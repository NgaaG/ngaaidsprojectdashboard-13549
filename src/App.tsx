import { useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Sidebar } from "@/components/Sidebar";
import { OnboardingOverlay } from "@/components/OnboardingOverlay";
import { setMode } from "@/lib/storage";
import { Mode } from "@/types";
import Home from "./pages/Home";
import Reflections from "./pages/Reflections";
import MentorLogs from "./pages/MentorLogs";
import Growth from "./pages/Growth";
import GrowthPortfolio from "./pages/GrowthPortfolio";
import Focus from "./pages/Focus";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => {
  const [showOnboarding, setShowOnboarding] = useState(false);

  const handleModeSelect = (selectedMode: Mode) => {
    setMode(selectedMode);
    setShowOnboarding(false);
    window.location.reload(); // Refresh to apply mode change
  };

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="dark">
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            {showOnboarding && (
              <OnboardingOverlay
                onSelectMode={handleModeSelect}
                onClose={() => setShowOnboarding(false)}
              />
            )}
            <div className="flex">
              <Sidebar onHeartClick={() => setShowOnboarding(true)} />
              <main className="flex-1 ml-20">
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/reflections" element={<Reflections />} />
                  <Route path="/mentor-logs" element={<MentorLogs />} />
                  <Route path="/growth" element={<Growth />} />
                  <Route path="/growth-portfolio" element={<GrowthPortfolio />} />
                  <Route path="/focus" element={<Focus />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </main>
            </div>
          </BrowserRouter>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
