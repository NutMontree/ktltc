import { Fira_Code as FontMono, Inter as FontSans } from "next/font/google";
import { Prompt } from "next/font/google";

export const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const fontMono = FontMono({
  subsets: ["latin"],
  variable: "--font-mono",
});

export const prompt = Prompt({
  subsets: ["latin"],
  variable: "--font-sans",
  weight: "100",
});
