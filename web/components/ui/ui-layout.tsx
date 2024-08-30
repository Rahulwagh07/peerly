'use client';

import { WalletButton } from '../solana/solana-provider';
import * as React from 'react';
import { ReactNode, Suspense, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import toast, { ToastBar, Toaster } from 'react-hot-toast';
import { ExplorerLink } from '../cluster/cluster-ui';
import Loader from '../common/Loader';

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
      <div  className="flex justify-between items-center align-baseline px-8  shadow-lg 
     dark:bg-gray-900 border-b mb-4 p-2  dark:border-slate-800">
        <div className="flex-1">
          <Link className="btn btn-ghost normal-case text-xl" href="/">
            Peerly
          </Link>
          <ul className="menu menu-horizontal px-1  space-x-2">
            {links.map(({ label, path }) => (
              <li key={path}>
                <Link
                  className={pathname.startsWith(path) ? 'active' : ''}
                  href={path}
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div className="flex items-center justify-center gap-2">
          <WalletButton />
        </div>
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
              backgroundColor: '#111827',  
              color: '#fff',  
              border: '1px solid #555',  
              padding: '16px',
            },
            success: {
              style: {
                background: '#111827',  
                color: '#fff',
              },
              iconTheme: {
                primary: '#4CAF50',
                secondary: '#ffffff',
              },
            },
            error: {
              style: {
                background: '#111827',  
                
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
