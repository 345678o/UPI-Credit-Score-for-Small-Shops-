import type {Metadata} from 'next';
import './globals.css';
import { FirebaseClientProvider } from '@/firebase/client-provider';
import { Toaster } from '@/components/ui/toaster';

export const metadata: Metadata = {
  title: 'CrediPay | Merchant Payments & Credit',
  description: 'Smart payment and credit platform for small business owners in India',
};

import { TransactionProvider } from '@/context/TransactionContext';
import { StoreProvider } from '@/context/StoreContext';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body className="antialiased bg-background selection:bg-emerald-500/30">
        <FirebaseClientProvider>
          <StoreProvider>
            <TransactionProvider>
              {children}
              <Toaster />
            </TransactionProvider>
          </StoreProvider>
        </FirebaseClientProvider>
      </body>
    </html>
  );
}
