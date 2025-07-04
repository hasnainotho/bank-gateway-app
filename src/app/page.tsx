<<<<<<< HEAD
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
            <div class="loader border-4 border-gray-100 border-t-4 border-t-green-400 rounded-full w-12 h-12 animate-spin mx-auto mb-6"></div>
            <div class="text-gray-700">Loading, please wait...</div>
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
          <div className="loader border-4 border-gray-100 border-t-4 border-t-green-400 rounded-full w-12 h-12 animate-spin mx-auto mb-6"></div>
          <div className="text-gray-700">Loading, please wait...</div>
        </div>
      </div>
=======
import Image from "next/image";

export default function Home() {
  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
        <Image
          className="dark:invert"
          src="/next.svg"
          alt="Next.js logo"
          width={180}
          height={38}
          priority
        />
        <ol className="list-inside list-decimal text-sm/6 text-center sm:text-left font-[family-name:var(--font-geist-mono)]">
          <li className="mb-2 tracking-[-.01em]">
            Get started by editing{" "}
            <code className="bg-black/[.05] dark:bg-white/[.06] px-1 py-0.5 rounded font-[family-name:var(--font-geist-mono)] font-semibold">
              src/app/page.tsx
            </code>
            .
          </li>
          <li className="tracking-[-.01em]">
            Save and see your changes instantly.
          </li>
        </ol>

        <div className="flex gap-4 items-center flex-col sm:flex-row">
          <a
            className="rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-foreground text-background gap-2 hover:bg-[#383838] dark:hover:bg-[#ccc] font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 sm:w-auto"
            href="https://vercel.com/new?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Image
              className="dark:invert"
              src="/vercel.svg"
              alt="Vercel logomark"
              width={20}
              height={20}
            />
            Deploy now
          </a>
          <a
            className="rounded-full border border-solid border-black/[.08] dark:border-white/[.145] transition-colors flex items-center justify-center hover:bg-[#f2f2f2] dark:hover:bg-[#1a1a1a] hover:border-transparent font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 w-full sm:w-auto md:w-[158px]"
            href="https://nextjs.org/docs?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
            target="_blank"
            rel="noopener noreferrer"
          >
            Read our docs
          </a>
        </div>
      </main>
      <footer className="row-start-3 flex gap-[24px] flex-wrap items-center justify-center">
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://nextjs.org/learn?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/file.svg"
            alt="File icon"
            width={16}
            height={16}
          />
          Learn
        </a>
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://vercel.com/templates?framework=next.js&utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/window.svg"
            alt="Window icon"
            width={16}
            height={16}
          />
          Examples
        </a>
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://nextjs.org?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/globe.svg"
            alt="Globe icon"
            width={16}
            height={16}
          />
          Go to nextjs.org →
        </a>
      </footer>
>>>>>>> e0723af61f3815c5e6c6351408bc3b8d480c9a9d
    </div>
  );
}
