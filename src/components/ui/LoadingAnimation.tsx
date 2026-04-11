import React from 'react';

export function LoadingAnimation() {
  return (
    <div className="flex justify-center items-center w-full h-full min-h-[200px]">
      <div className="loading">
        <span></span>
        <span></span>
        <span></span>
        <span></span>
        <span></span>
      </div>
    </div>
  );
}
