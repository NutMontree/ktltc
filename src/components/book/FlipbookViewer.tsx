"use client";

import React, { useRef } from "react";
// @ts-ignore
import HTMLFlipBook from "react-pageflip";
const FlipBook: any = HTMLFlipBook;
import { ChevronLeft, ChevronRight, ZoomIn, ExternalLink } from "lucide-react";
import { IPage } from "@/models/Page";
import { IBook } from "@/models/Book";

interface FlipbookProps {
  book: IBook;
  pages: IPage[];
}

const themeClasses: Record<string, string> = {
  blue: "bg-blue-900 border-blue-950 text-blue-100",
  amber: "bg-amber-600 border-amber-700 text-amber-100",
  emerald: "bg-emerald-800 border-emerald-950 text-emerald-100",
  rose: "bg-rose-800 border-rose-950 text-rose-100",
  purple: "bg-purple-900 border-purple-950 text-purple-100",
};

const textHighlight: Record<string, string> = {
  blue: "text-amber-500 from-amber-200 to-amber-500",
  amber: "text-blue-900 from-blue-800 to-blue-950",
  emerald: "text-amber-400 from-amber-200 to-amber-400",
  rose: "text-rose-200 from-rose-100 to-rose-300",
  purple: "text-purple-300 from-purple-200 to-purple-400",
};

export default function FlipbookViewer({ book, pages }: FlipbookProps) {
  const bookRef = useRef<any>(null);
  const pageTextRef = useRef<HTMLDivElement>(null);

  const nextPage = () => { if (bookRef.current) bookRef.current.pageFlip().flipNext(); };
  const prevPage = () => { if (bookRef.current) bookRef.current.pageFlip().flipPrev(); };

  const needsBlankPage = pages.length % 2 !== 0;
  const totalPages = 1 + pages.length + (needsBlankPage ? 1 : 0) + 1; 
  const backCoverIndex = totalPages - 1;

  const onPage = (e: any) => {
    const pageNum = e.data;
    if (pageTextRef.current) {
      let text = pageNum.toString();
      if (pageNum === 0) text = "หน้าปก";
      else if (pageNum === backCoverIndex) text = "ปกหลัง";
      pageTextRef.current.innerText = `หน้าปัจจุบัน: ${text} / ${backCoverIndex}`;
    }
  };

  const Page = React.forwardRef<HTMLDivElement, { children: React.ReactNode, number: number, className?: string, style?: React.CSSProperties }>(
    (props, ref) => {
      const { children, number, className, style, ...rest } = props;
      return (
        <div ref={ref} style={style} {...rest} className={`bg-white border-l border-zinc-200 h-full w-full shadow-lg relative overflow-hidden flex flex-col ${className || ""}`}>
          <div className="absolute inset-0 bg-linear-to-r from-zinc-200/50 to-transparent w-4 z-10 pointer-events-none"></div>
          {children}
          <div className="mt-auto pt-4 text-center pb-4 text-xs font-bold text-zinc-400">
            - {number} -
          </div>
        </div>
      );
    }
  );
  Page.displayName = "Page";

  const themeColor = book.themeColor || "blue";
  const bgClass = themeClasses[themeColor] || themeClasses.blue;
  const highlightClass = textHighlight[themeColor] || textHighlight.blue;

  return (
    <div className="w-full flex flex-col items-center bg-zinc-900/5 rounded-3xl p-4 md:p-8 relative">
      <div className="w-full max-w-4xl flex justify-between items-center mb-6">
        <h2 className={`text-xl font-black flex items-center gap-2 text-${themeColor}-900 dark:text-${themeColor}-400`}>
          <ExternalLink size={24} />
          {book.title}
        </h2>
        <div className="flex gap-2">
          <button onClick={prevPage} className="w-10 h-10 rounded-full bg-white dark:bg-zinc-800 flex items-center justify-center text-zinc-600 hover:text-blue-600 shadow-md">
            <ChevronLeft size={20} />
          </button>
          <button onClick={nextPage} className="w-10 h-10 rounded-full bg-white dark:bg-zinc-800 flex items-center justify-center text-zinc-600 hover:text-blue-600 shadow-md">
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      <div className="w-full flex justify-center perspective-[2000px]">
        <div className="shadow-2xl shadow-blue-900/20 rounded-r-lg">
          <FlipBook
            width={400}
            height={565}
            size="stretch"
            minWidth={300}
            maxWidth={500}
            minHeight={400}
            maxHeight={700}
            maxShadowOpacity={0.5}
            showCover={true}
            mobileScrollSupport={true}
            onFlip={onPage}
            className="flip-book"
            ref={bookRef}
          >
            {[
              /* Cover Page */
              <div key="cover-wrapper" className="h-full w-full relative">
                <div className={`${bgClass} absolute inset-0 shadow-lg overflow-hidden flex flex-col justify-center items-center p-8 border-l-8`}
                     style={book.coverImageUrl ? { backgroundImage: `url(${book.coverImageUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}>
                  <div className="absolute inset-0 bg-black/30 pointer-events-none"></div>
                  
                  {!book.coverImageUrl && (
                    <div className="relative z-10 flex flex-col items-center text-center">
                      <div className="w-24 h-24 rounded-full bg-white/10 border-2 border-white/30 flex items-center justify-center mb-6">
                        <ZoomIn size={40} className="text-white" />
                      </div>
                      <h1 className={`text-3xl font-black text-transparent bg-clip-text bg-linear-to-b ${highlightClass} uppercase tracking-wider leading-tight`}>
                        {book.title}
                      </h1>
                      <div className="w-16 h-1 bg-white/30 my-6"></div>
                      <h2 className="text-sm font-bold text-white uppercase tracking-widest px-4 text-center">
                        {book.description}
                      </h2>
                    </div>
                  )}
                </div>
              </div>,

              /* Inner Pages */
              ...pages.map((page, index) => (
                <Page number={index + 1} key={page._id?.toString() || `page-${index}`}>
                  <div className="p-8 flex flex-col h-full">
                    {page.imageUrl && (
                      <div className="w-full aspect-video rounded-xl mb-6 flex items-center justify-center border border-zinc-200 overflow-hidden relative shadow-sm shrink-0">
                        <img src={page.imageUrl} alt={page.title} className="w-full h-full object-cover" />
                      </div>
                    )}

                    <h3 className="text-xl font-black text-zinc-900 mb-2 leading-tight">
                      {page.title}
                    </h3>
                    
                    {page.meta?.creator && (
                      <div className={`text-xs font-bold text-${themeColor}-600 mb-4 pb-4 border-b border-zinc-100 shrink-0`}>
                        โดย {page.meta.creator}
                        {page.meta.department && <><br /><span className="text-zinc-400">{page.meta.department}</span></>}
                      </div>
                    )}
                    
                    <p className="text-sm font-medium text-zinc-600 leading-relaxed text-justify whitespace-pre-wrap flex-1 overflow-hidden">
                      {page.content}
                    </p>
                  </div>
                </Page>
              )),

              /* Blank Page if odd */
              needsBlankPage ? (
                <Page number={pages.length + 1} key="blank-page">
                  <div className="bg-white h-full w-full flex items-center justify-center opacity-50">
                    <span className="text-zinc-300 font-bold uppercase tracking-widest text-xs">Blank Page</span>
                  </div>
                </Page>
              ) : null,

              /* Back Cover */
              <div key="back-cover-wrapper" className="h-full w-full relative">
                <div className={`${bgClass} absolute inset-0 shadow-lg flex flex-col justify-center items-center p-8`}>
                  <div className="w-12 h-12 rounded-full border border-white/30 flex items-center justify-center text-white/50 font-black mb-4">
                    KTC
                  </div>
                </div>
              </div>
            ].filter(Boolean)}
          </FlipBook>
        </div>
      </div>
      
      <div ref={pageTextRef} className="mt-8 text-center text-sm font-bold text-zinc-500">
        หน้าปัจจุบัน: หน้าปก / {backCoverIndex}
      </div>
    </div>
  );
}
