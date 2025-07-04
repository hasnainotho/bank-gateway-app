import React from "react";

export default function TransactionErrorCard({ title, message }: { title: string, message: string }) {
  return (
    <div className="w-full max-w-md mx-auto p-4">
      <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
        <div className="flex flex-col items-center">
          <svg className="w-16 h-16 text-red-400 mb-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth={2} fill="none"/><path d="M15 9l-6 6M9 9l6 6" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/></svg>
          <h2 className="text-2xl font-bold text-red-600 mb-2">{title}</h2>
          <div className="text-gray-700 mb-4">{message}</div>
          {/* <a href="/" className="inline-block mt-4 px-6 py-2 bg-red-400 text-white rounded-lg font-semibold shadow hover:bg-red-500 transition">Go to Home</a> */}
        </div>
      </div>
    </div>
  );
}
