"use client";
import { useEffect } from "react";

declare global {
  interface Window {
    Checkout?: any;
  }
}

export default function Home() {
  useEffect(() => {
    function getQueryParam(name: string): string | null {
      if (typeof window === "undefined") return null;
      const urlParams = new URLSearchParams(window.location.search);
      return urlParams.get(name);
    }
    async function initializeCheckout() {
      const loaderDiv = document.getElementById("loader");
      if (!loaderDiv) return;
      try {
        const token = getQueryParam("token");
        if (!token) {
          loaderDiv.innerHTML = `
            <div class="container mx-auto max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center mt-10">
              <div class="logo text-3xl font-bold text-green-400 mb-6 tracking-wide">Bank Payment</div>
              <div class="error text-red-600 text-lg mt-4 break-words">Missing payment token.<br>Please start your payment from the app.</div>
            </div>
          `;
          return;
        }
        loaderDiv.innerHTML = `
          <div class="container mx-auto max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center mt-10">
            <div class="logo text-3xl font-bold text-green-400 mb-6 tracking-wide">Bank Payment</div>
            <div class="text-gray-700 text-lg">Please wait while bank API processes your payment...</div>
          </div>
        `;
        const response = await fetch("/api/create-session", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ token })
        });
        const data = await response.json();
        if (!data.session || !data.session.id) {
          loaderDiv.innerHTML = `
            <div class="container mx-auto max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center mt-10">
              <div class="logo text-3xl font-bold text-green-400 mb-6 tracking-wide">Bank Payment</div>
              <div class="error text-red-600 text-lg mt-4 break-words">Could not start payment session.<br>${data.error ? data.error : "Please try again later."}</div>
            </div>
          `;
          return;
        }
        if (!window.Checkout) {
          const script = document.createElement("script");
          script.src = "https://test-bankalfalah.gateway.mastercard.com/static/checkout/checkout.min.js";
          script.onload = () => {
            window.Checkout.configure({
              session: { id: data.session.id },
            });
            window.Checkout.showPaymentPage();
          };
          document.body.appendChild(script);
        } else {
          window.Checkout.configure({
            session: { id: data.session.id },
          });
          window.Checkout.showPaymentPage();
        }
      } catch (error) {
        const loaderDiv = document.getElementById("loader");
        if (!loaderDiv) return;
        let errorMsg = "";
        if (error instanceof Error) {
          errorMsg = error.message;
        } else if (typeof error === "string") {
          errorMsg = error;
        } else {
          errorMsg = "Unknown error";
        }
        loaderDiv.innerHTML = `
          <div class="container mx-auto max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center mt-10">
            <div class="logo text-3xl font-bold text-green-400 mb-6 tracking-wide">Bank Payment</div>
            <div class="error text-red-600 text-lg mt-4 break-words">Error initializing checkout.<br>${errorMsg}</div>
          </div>
        `;
      }
    }
    initializeCheckout();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div id="loader">
        <div className="container mx-auto max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center mt-10">
          <div className="logo text-3xl font-bold text-green-400 mb-6 tracking-wide">Bank Payment</div>
          <div className="text-gray-700 text-lg">Please wait while bank API processes your payment...</div>
        </div>
      </div>
    </div>
  );
}
