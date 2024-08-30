import "@/styles/global.css"
import { UiLayout } from '@/components/ui/ui-layout';
import { ClusterProvider } from '@/components/cluster/cluster-data-access';
import { SolanaProvider } from '@/components/solana/solana-provider';
import { ReactQueryProvider } from './react-query-provider';
import { Inter as FontSans } from "next/font/google";
import { cn } from '@peerly/ui-components';
import { ThemeProvider } from '@/components/ThemeProvider';

const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
})
export const metadata = {
  title: 'Peerly',
  description: 'Decentralized peer to peer lending network',
};

const links: { label: string; path: string }[] = [
  { label: 'Dashboard', path: '/account' },
  { label: 'Explore', path: '/explore' },
  { label: 'Request', path: '/request' },
];

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={cn(
          "min-h-screen  font-sans ",
          fontSans.variable
        )}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <ReactQueryProvider>
            <ClusterProvider>
              <SolanaProvider>
                <UiLayout links={links}>{children}</UiLayout>
              </SolanaProvider>
            </ClusterProvider>
          </ReactQueryProvider>
        
        </ThemeProvider>
      </body>
    </html>
  );
}
