import React from 'react';

export function Terms({
  isChecked,
  setIsChecked,
  text1,
  text2
} : {
  isChecked: boolean;
  setIsChecked: (checked: boolean) => void;
  text1: string;
  text2: string;
}) {
  return (
    <div className="flex items-center cursor-pointer" onClick={() => setIsChecked(!isChecked)}>
      <input
        type="checkbox"
        checked={isChecked}
        readOnly
        className="w-4 h-5 cursor-pointer text-sky-600 bg-sky-700"
      />
      <p className="ms-2 font-medium text-gray-900 dark:text-gray-300">
        {text1}
        <span className='text-red-500 font-semibold mx-1'>30%</span>
        {text2}
      </p>
    </div>
  );
}
