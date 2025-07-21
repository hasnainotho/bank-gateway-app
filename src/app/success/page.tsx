"use client";
import { useEffect, useState } from "react";
import TransactionSuccessCard from "@/components/TransactionSuccessCard";
import TransactionErrorCard from "@/components/TransactionErrorCard";

export default function SuccessPage() {
  const [status, setStatus] = useState<'loading'|'success'|'error'>("loading");
  const [result, setResult] = useState<any>(null);
  const [pythonApiPayload, setPythonApiPayload] = useState<any>(null);
  const [error, setError] = useState<{title:string, message:string}|null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const orderId = params.get("orderId");
    const org_id = params.get("org_id");
    const auth_token = params.get("auth_token");
    const booking_id = params.get("booking_id");
    if (!orderId || !org_id || !booking_id || !auth_token) {
      setStatus("error");
      setError({ title: "Missing Required Fields", message: "Please provide all required"});
      return;
    }
    fetch(`/api/success?orderId=${orderId}&org_id=${org_id}&booking_id=${booking_id}&auth_token=${auth_token}`)
      .then(async (res) => {
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          setStatus("error");
          setError({ title: data.title || "Transaction Error", message: data.message || "Could not fetch transaction status." });
        } else {
          const data = await res.json();
          setResult(data.result);
          setPythonApiPayload(data.pythonApiPayload);
          setStatus("success");
        }
      })
      .catch(() => {
        setStatus("error");
        setError({ title: "Network Error", message: "Could not connect to server." });
      });
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      {status === "loading" && <div className="text-gray-500">Loading...</div>}
      {status === "success" && result && pythonApiPayload && <TransactionSuccessCard result={result} pythonApiPayload={pythonApiPayload} />}
      {status === "error" && error && <TransactionErrorCard title={error.title} message={error.message} />}
    </div>
  );
}
