'use client';

import { WalletButton } from '../solana/solana-provider';
import * as React from 'react';
import { ReactNode, Suspense, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import toast, { ToastBar, Toaster } from 'react-hot-toast';
import { ExplorerLink } from '../cluster/cluster-ui';
import Loader from '../common/Loader';
import { Button, Card } from '@peerly/ui-components';
import { Menu, MoonIcon, Sun} from 'lucide-react';
import { IoClose } from 'react-icons/io5';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from 'next-themes';

export function UiLayout({
  children,
  links,
}: {
  children: ReactNode;
  links: { label: string; path: string }[];
}) {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }
  return (
    <>
      <div className="flex items-center justify-center">
        <Card
          className="flex z-50 items-center justify-between md:justify-center align-baseline px-4 md:px-8 gap-2 md:gap-8 lg:gap-16 shadow-lg 
        border-b mb-4 py-1.5 mt-4 rounded-2xl w-11/12 h-16  transition-colors duration-300"
        >
          <Link
            href="/"
            className="text-base hover:text-sky-500 transition-colors"
          >
            Home
          </Link>
          <div className="hidden md:flex md:items-center md:gap-16">
            {links.map(({ label, path }) => (
              <p key={path}>
                <Link
                  className={`transition-colors hover:text-sky-500 ${
                    pathname.startsWith(path) ? 'text-sky-500' : ''
                  }`}
                  href={path}
                >
                  {label}
                </Link>
              </p>
            ))}
          </div>
          <div className="hidden md:block">
            <WalletButton />
          </div>
          <Button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            variant={"outline"} size={"icon"}
            className="hidden md:flex transition-colors duration-300 p-2"
          >
            {theme === 'dark' ? (
              <Sun className="h-6 w-6" />
            ) : ( 
              <MoonIcon className="h-6 w-6" />
            )}
          </Button>
          <Button
            variant="outline" size="icon"
            className="md:hidden p-2 transition-colors duration-300"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={isMenuOpen ? 'close' : 'menu'}
                initial={{ opacity: 0, rotate: -90 }}
                animate={{ opacity: 1, rotate: 0 }}
                exit={{ opacity: 0, rotate: 90 }}
                transition={{ duration: 0.2 }}
              >
                {isMenuOpen ? (
                  <IoClose className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </motion.div>
            </AnimatePresence>
            <span className="sr-only">Toggle menu</span>
          </Button>
          <AnimatePresence>
            {isMenuOpen && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="absolute top-24 left-0 right-0 bottom-0 bg-background pt-4  p-2 shadow-lg md:hidden"
              >
                <div className="flex flex-col items-center justify-center py-10 space-y-4 gap-6">
                  {links.map(({ label, path }) => (
                    <Link
                      key={path}
                      href={path}
                      className={`transition-colors hover:text-sky-400 ${
                        pathname.startsWith(path) ? 'text-sky-400' : ''
                      }`}
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {label}
                    </Link>
                  ))}
                  <WalletButton />
                  <Button
                    onClick={() =>
                      setTheme(theme === 'dark' ? 'light' : 'dark')
                    }
                    variant={"outline"} size={"icon"}
            className="md:flex  transition-colors duration-300 p-2"
          >
            {theme === 'dark' ? (
              <Sun className="h-6 w-6" />
            ) : ( 
              <MoonIcon className="h-6 w-6" />
            )}
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </Card>
      </div>
      <div>
        <Suspense fallback={<Loader />}>{children}</Suspense>
        <Toaster
          position="bottom-right"
          toastOptions={{
            className: '',
            style: {
              backgroundColor: '#020617',
              color: '#fff',
              border: '1px solid #1f2937',
              padding: '16px',
            },
            success: {
              style: {
                background: '#020617',
                color: '#fff',
              },
              iconTheme: {
                primary: '#4CAF50',
                secondary: '#ffffff',
              },
            },
            error: {
              style: {
                background: '#020617',
              },
              iconTheme: {
                primary: '#F44336',
                secondary: '#ffffff',
              },
            },
          }}
          containerStyle={{
            top: 20,
            left: 20,
            bottom: 20,
            right: 20,
          }}
          gutter={16}
        >
          {(t) => (
            <ToastBar
              toast={t}
              style={{
                ...t.style,
                animation: t.visible
                  ? 'custom-enter 1s ease'
                  : 'custom-exit 1s ease',
              }}
            />
          )}
        </Toaster>
      </div>
    </>
  );
}

export function AppModal({
  children,
  title,
  hide,
  show,
  submit,
  submitDisabled,
  submitLabel,
}: {
  children: ReactNode;
  title: string;
  hide: () => void;
  show: boolean;
  submit?: () => void;
  submitDisabled?: boolean;
  submitLabel?: string;
}) {
  const dialogRef = useRef<HTMLDialogElement | null>(null);

  useEffect(() => {
    if (!dialogRef.current) return;
    if (show) {
      dialogRef.current.showModal();
    } else {
      dialogRef.current.close();
    }
  }, [show, dialogRef]);

  return (
    <dialog className="modal" ref={dialogRef}>
      <div className="modal-box space-y-5">
        <h3 className="font-bold text-lg">{title}</h3>
        {children}
        <div className="modal-action">
          <div className="join space-x-2">
            {submit ? (
              <button
                className="btn btn-xs lg:btn-md btn-primary"
                onClick={submit}
                disabled={submitDisabled}
              >
                {submitLabel || 'Save'}
              </button>
            ) : null}
            <button onClick={hide} className="btn">
              Close
            </button>
          </div>
        </div>
      </div>
    </dialog>
  );
}

export function useTransactionToast() {
  return (signature: string) => {
    toast.success(
      <div className={'text-center'}>
        <div className="text-lg">Transaction sent</div>
        <ExplorerLink
          path={`tx/${signature}`}
          label={'View Transaction'}
          className="btn btn-xs btn-primary"
        />
      </div>,
    );
  };
}
