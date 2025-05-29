"use client";

import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="grid grid-rows-[auto_1fr_auto] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 bg-black text-white font-sans">
      <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start text-center sm:text-left max-w-2xl">
        <Image
          className="dark:invert"
          src="/next.svg"
          alt="Next.js logo"
          width={180}
          height={38}
          priority
        />

        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
          E-Commerce Chatbot – Demo & Teststrategie
        </h1>

        <p className="text-base sm:text-lg text-neutral-300 leading-relaxed">
          Diese Anwendung dient als <strong>Demonstration</strong> und
          technische Basis für die Entwicklung einer{" "}
          <strong>Teststrategie</strong> im Kontext eines KI-gestützten
          E-Commerce-Chatbots.
          <br />
          <br />
          Der Fokus liegt <strong>nicht auf der Funktionalität des Bots</strong>
          , sondern auf der strukturierten Planung und Durchführung
          automatisierter und manueller Testszenarien.
        </p>

        <Link href="/chat">
          <div className="inline-block mt-2 rounded-full border border-transparent bg-white text-black font-medium px-6 py-3 text-sm sm:text-base hover:bg-neutral-200 transition">
            Chatbot-Demo starten
          </div>
        </Link>
      </main>

      <footer className="row-start-3 flex gap-6 flex-wrap items-center justify-center text-sm text-neutral-500">
        <a
          className="hover:underline underline-offset-4"
          href="https://nextjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Powered by Next.js
        </a>
        <a
          className="hover:underline underline-offset-4"
          href="https://platform.openai.com"
          target="_blank"
          rel="noopener noreferrer"
        >
          Built with OpenAI GPT
        </a>
      </footer>
    </div>
  );
}
