'use client';

import { WalletButton } from '../solana/solana-provider';
import * as React from 'react';
import { ReactNode, Suspense, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import toast, { ToastBar, Toaster } from 'react-hot-toast';
import { ExplorerLink } from '../cluster/cluster-ui';
import Loader from '../common/Loader';
import { Card } from '@peerly/ui-components';

export function UiLayout({
  children,
  links,
}: {
  children: ReactNode;
  links: { label: string; path: string }[];
}) {
  const pathname = usePathname();
  return (
    <div className="">
     <div className='flex items-center justify-center'>
     <Card  className="flex z-50 items-center justify-between sm:justify-center align-baseline px-8 gap-2 sm:gap-16 shadow-lg 
     dark:bg-gray-900 border-b mb-4 py-1.5 mt-4 rounded-2xl w-11/12 h-16">
      <Link href="/">
        Home
      </Link>
        {links.map(({ label, path }) => (
          <p key={path}
          className='hidden sm:block'>
            <Link
              className={pathname.startsWith(path) ? 'text-sky-400' : ''}
              href={path}
            >
              {label}
            </Link>
          </p>
        ))}

        <WalletButton />
      
    </Card>
     </div>
      <div>
        <Suspense
          fallback={
             <Loader/>
          }
        >
          {children}
        </Suspense>
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
                animation: t.visible ? 'custom-enter 1s ease' : 'custom-exit 1s ease',
              }}
            />
          )}
        </Toaster>
      </div>
    </div>
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
      </div>
    );
  };
}