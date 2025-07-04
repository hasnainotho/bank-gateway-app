import React from "react";

export default function TransactionSuccessCard({ result, pythonApiPayload }: any) {
  return (
    <div className="w-full max-w-md mx-auto p-4">
      <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
        <div className="flex flex-col items-center">
          <svg className="w-16 h-16 text-green-400 mb-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth={2} fill="none"/><path d="M8 12l2 2l4-4" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/></svg>
          <h2 className="text-2xl font-bold text-green-600 mb-2">Transaction Successful!</h2>
          <div className="text-gray-700 mb-4">Thank you for your payment.</div>
          <div className="w-full flex flex-col gap-2 text-left bg-gray-50 rounded-lg p-4 mb-4">
            <div><span className="font-semibold text-gray-600">Order ID:</span> <span className="text-gray-900">{result.id}</span></div>
            <div><span className="font-semibold text-gray-600">Amount:</span> <span className="text-gray-900">{result.amount} {result.currency}</span></div>
            <div><span className="font-semibold text-gray-600">Status:</span> <span className="text-gray-900">{result.status}</span></div>
            <div><span className="font-semibold text-gray-600">Card Brand:</span> <span className="text-gray-900">{pythonApiPayload.source}</span></div>
            <div><span className="font-semibold text-gray-600">Transaction Type:</span> <span className="text-gray-900">{pythonApiPayload.transaction_type}</span></div>
          </div>
          {/* <a href="/" className="inline-block mt-4 px-6 py-2 bg-green-400 text-white rounded-lg font-semibold shadow hover:bg-green-500 transition">Go to Home</a> */}
        </div>
      </div>
    </div>
  );
}
