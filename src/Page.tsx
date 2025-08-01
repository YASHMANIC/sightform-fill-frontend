import {Toaster} from 'react-hot-toast'
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/ThemeProvider";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import SignUpPage from "./pages/SignUp";
import { SignInPage } from "./pages/SignIn";
import PrivateRoute from './components/PrivateRoute';

const queryClient = new QueryClient();

const Page = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="light" storageKey="easy-fill-theme">
      <TooltipProvider>
        <Toaster position="top-right" reverseOrder={false}/>
        <Sonner />
        <BrowserRouter>
          <Routes>
          <Route path="/signin" element={<SignInPage />} />
          <Route path="/" element={<SignUpPage />} />
          <Route path="/home" element={
            <PrivateRoute>
              <Index />
            </PrivateRoute>
            } />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default Page;