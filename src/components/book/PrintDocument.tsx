import React, { forwardRef } from 'react';
import { IPage } from '@/models/Page';
import { IBook } from '@/models/Book';

interface PrintDocumentProps {
  book: IBook;
  pages: IPage[];
}

export const PrintDocument = forwardRef<HTMLDivElement, PrintDocumentProps>(
  ({ book, pages }, ref) => {
    return (
      <div ref={ref} className="bg-white text-black p-8 print:p-0">
        <style type="text/css" media="print">
          {`
            @page { size: A4 portrait; margin: 20mm; }
            body { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
            .page-break-after-always { page-break-after: always; break-after: page; }
            .print-hidden { display: none !important; }
          `}
        </style>

        {/* Cover Page */}
        <div className="min-h-[297mm] flex flex-col justify-center items-center text-center page-break-after-always">
          {book.coverImageUrl ? (
            <img src={book.coverImageUrl} alt="Cover" className="w-full max-h-[150mm] object-contain mb-10" />
          ) : (
            <div className="w-32 h-32 border-4 border-black rounded-full flex items-center justify-center mb-8">
              <span className="text-4xl font-black">BOOK</span>
            </div>
          )}
          <h1 className="text-5xl font-black mb-6 uppercase tracking-wider">{book.title}</h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl">{book.description}</p>
        </div>

        {/* Content Pages */}
        {pages.map((page, index) => (
          <div key={page._id?.toString() || index} className="min-h-[297mm] py-10 relative page-break-after-always flex flex-col">
            
            {/* Header */}
            <div className="flex justify-between items-end border-b-2 border-black pb-4 mb-8">
              <div>
                <h2 className="text-3xl font-black uppercase tracking-tight">{page.title || `Page ${index + 1}`}</h2>
              </div>
              <div className="text-right">
                <div className="text-sm font-bold text-gray-500 uppercase tracking-widest">{book.title}</div>
                <div className="text-2xl font-black">PAGE {String(index + 1).padStart(2, '0')}</div>
              </div>
            </div>

            {/* Image (if available) */}
            {page.imageUrl && (
              <div className="w-full max-h-[120mm] mb-8 overflow-hidden flex justify-center border border-gray-200">
                <img src={page.imageUrl} alt={page.title} className="w-full object-contain" style={{ maxHeight: '120mm' }} />
              </div>
            )}

            {/* Content */}
            <div className="text-base font-medium leading-relaxed whitespace-pre-wrap">
              {page.content}
            </div>

            {/* Meta */}
            {page.meta?.creator && (
              <div className="mt-8 pt-8 border-t border-gray-200 text-sm font-bold text-gray-600">
                ผู้จัดทำ: {page.meta.creator} {page.meta.department && `(${page.meta.department})`}
              </div>
            )}

            {/* Footer */}
            <div className="absolute bottom-0 left-0 right-0 pt-4 border-t-2 border-black flex justify-between items-center text-xs font-bold uppercase tracking-widest">
              <span>{book.title}</span>
              <span>Kantharalak Technical College</span>
            </div>
          </div>
        ))}
      </div>
    );
  }
);
PrintDocument.displayName = 'PrintDocument';
