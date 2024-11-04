import React from 'react';
import { Loader2 } from 'lucide-react';

function Loader() {
  return (
    <div className="flex flex-col gap-4 items-center justify-center mt-52">
      <div className="rounded-full p-2 dark:bg-slate-800/50 bg-gray-100/90">
        <Loader2 className="animate-spin h-5 w-5 text-red-500" />
      </div>
    </div>
  );
}

export default Loader;
