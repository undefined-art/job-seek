"use client";

export function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center">
      <div className="relative">
        <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div
            className="w-6 h-6 border-2 border-transparent border-t-primary-400 rounded-full animate-spin"
            style={{
              animationDirection: "reverse",
              animationDuration: "0.75s",
            }}
          ></div>
        </div>
      </div>
    </div>
  );
}
