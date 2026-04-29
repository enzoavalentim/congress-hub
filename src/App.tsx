import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./pages/Index.tsx";
import NotFound from "./pages/NotFound.tsx";
import Layout from "./components/Layout";
import Avaliadores from "./pages/Avaliadores";
import AvaliadorForm from "./pages/AvaliadorForm";
import Trabalhos from "./pages/Trabalhos";
import TrabalhoForm from "./pages/TrabalhoForm";
import TrabalhoDetalhe from "./pages/TrabalhoDetalhe";
import Categorias from "./pages/Categorias";
import Atribuicoes from "./pages/Atribuicoes";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Index />} />
            <Route path="/avaliadores" element={<Avaliadores />} />
            <Route path="/avaliadores/novo" element={<AvaliadorForm />} />
            <Route path="/avaliadores/:id/editar" element={<AvaliadorForm />} />
            <Route path="/trabalhos" element={<Trabalhos />} />
            <Route path="/trabalhos/novo" element={<TrabalhoForm />} />
            <Route path="/trabalhos/:id" element={<TrabalhoDetalhe />} />
            <Route path="/trabalhos/:id/editar" element={<TrabalhoForm />} />
            <Route path="/categorias" element={<Categorias />} />
            <Route path="/atribuicoes" element={<Atribuicoes />} />
          </Route>
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
