import { Fira_Code, Inter, Prompt } from "next/font/google";

export const fontSans = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const fontMono = Fira_Code({
  subsets: ["latin"],
  variable: "--font-mono",
});

export const fontPrompt = Prompt({
  subsets: ["latin"],
  variable: "--font-prompt",
  weight: "100",
});
