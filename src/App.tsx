import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Sidebar } from "@/components/Sidebar";
import Home from "./pages/Home";
import Reflections from "./pages/Reflections";
import MentorLogs from "./pages/MentorLogs";
import Growth from "./pages/Growth";
import Focus from "./pages/Focus";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="dark">
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <div className="flex">
            <Sidebar />
            <main className="flex-1 ml-20">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/reflections" element={<Reflections />} />
                <Route path="/mentor-logs" element={<MentorLogs />} />
                <Route path="/growth" element={<Growth />} />
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

export default App;
