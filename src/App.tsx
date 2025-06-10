
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { WagmiProvider } from 'wagmi';
import { defaultWagmiConfig } from '@web3modal/wagmi';
import { mainnet, bsc } from 'wagmi/chains';
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// WalletConnect configuration
const PROJECT_ID = '5727e933b117fb2899f78b5e7221b2f2';
const chains = [mainnet, bsc] as const;

const metadata = {
  name: 'Portfolio Tracker',
  description: 'Track your crypto portfolio across multiple wallets',
  url: window.location.origin,
  icons: [`${window.location.origin}/favicon.ico`]
};

const wagmiConfig = defaultWagmiConfig({
  chains,
  projectId: PROJECT_ID,
  metadata
});

const App = () => (
  <WagmiProvider config={wagmiConfig}>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </WagmiProvider>
);

export default App;
