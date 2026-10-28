"use client";

import { useMemo } from "react";
import { generateCode128Svg } from "@/lib/barcode";
import { formatDate } from "@/lib/utils";

export interface LibraryCardData {
  cardNo: string;
  name: string;
  fatherName?: string | null;
  department?: string | null;
  mobile?: string | null;
  batch?: string | null;
  libraryName?: string | null;
  institutionName?: string | null;
  courseName?: string | null;
  cardExpiry?: string | null;
  patronType?: string | null;
  academicYear?: number | null;
  semester?: number | null;
  admissionDate?: string | null;
}

/**
 * Derives a human-friendly batch string from academic year, semester, admission date, or card number.
 * E.g., "2024-2028 • 3rd Yr (Sem 5)" or "2024-2028"
 */
export function derivePatronBatch(p: {
  batch?: string | null;
  academicYear?: number | null;
  semester?: number | null;
  admissionDate?: string | null;
  cardNo?: string | null;
}): string {
  if (p.batch?.trim()) return p.batch.trim();

  // Try card number prefix (e.g. "24150016" -> 2024)
  let yearSpan = "";
  const cardMatch = p.cardNo?.match(/^(\d{2})/);
  if (cardMatch) {
    const startYr = 2000 + Number.parseInt(cardMatch[1], 10);
    yearSpan = `${startYr}-${startYr + 4}`;
  } else if (p.admissionDate) {
    const yr = new Date(p.admissionDate).getFullYear();
    if (!Number.isNaN(yr)) {
      yearSpan = `${yr}-${yr + 4}`;
    }
  }

  let yearSem = "";
  if (p.academicYear) {
    const suffix =
      p.academicYear === 1
        ? "st"
        : p.academicYear === 2
          ? "nd"
          : p.academicYear === 3
            ? "rd"
            : "th";
    yearSem = `${p.academicYear}${suffix} Year`;
    if (p.semester) {
      yearSem += ` (Sem ${p.semester})`;
    }
  } else if (p.semester) {
    yearSem = `Semester ${p.semester}`;
  }

  if (yearSpan && yearSem) {
    return `${yearSpan} • ${yearSem}`;
  }
  return yearSpan || yearSem || "2024-2028";
}

interface LibraryCardProps {
  card: LibraryCardData;
  className?: string;
}

/**
 * Printable Library Card Component.
 * Formatted for standard ID card / membership card dimensions (85.6mm x 54mm aspect).
 */
export function LibraryCard({ card, className = "" }: LibraryCardProps) {
  const barcodeSvg = useMemo(() => {
    try {
      return generateCode128Svg(card.cardNo.trim(), {
        height: 28,
        barWidth: 1.5,
        includeText: false,
      });
    } catch {
      return "";
    }
  }, [card.cardNo]);

  const displayBatch = derivePatronBatch(card);
  const collegeName = card.institutionName?.trim() || "RAKSHPAL BAHADUR GROUP OF INSTITUTIONS";
  const libraryTitle = card.libraryName?.trim() || "RBMI Central Library";
  const isStudent = !card.patronType || card.patronType.toUpperCase() === "STUDENT";
  const cardLabel = isStudent ? "STUDENT LIBRARY CARD" : `${card.patronType} LIBRARY CARD`;

  const initials = card.name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((s) => s[0].toUpperCase())
    .join("");

  return (
    <div
      className={`library-card-print relative flex flex-col justify-between overflow-hidden rounded-xl border border-slate-300 bg-white shadow-md print:shadow-none print:border-slate-800 ${className}`}
      style={{
        width: "390px",
        minHeight: "245px",
        boxSizing: "border-box",
        pageBreakInside: "avoid",
        breakInside: "avoid",
      }}
    >
      {/* Top Header Banner */}
      <div className="bg-slate-900 px-3 py-2 text-white print:bg-slate-900 print:text-white">
        <div className="flex items-center justify-between">
          <div className="min-w-0 pr-2">
            <h2 className="text-[11px] font-extrabold uppercase tracking-wider text-slate-100 truncate">
              {collegeName}
            </h2>
            <div className="flex items-center gap-1.5 text-[9px] text-slate-300 font-semibold tracking-wide">
              <span className="text-amber-400 font-bold">🏛️</span>
              <span className="truncate">{libraryTitle}</span>
            </div>
          </div>
          <span className="rounded bg-amber-400 px-1.5 py-0.5 text-[8px] font-black uppercase text-slate-950 shrink-0 tracking-wider">
            {cardLabel}
          </span>
        </div>
      </div>

      {/* Main Card Body */}
      <div className="p-3 flex-1 flex flex-col justify-between space-y-2 bg-gradient-to-b from-white to-slate-50/50">
        <div className="grid grid-cols-12 gap-2.5 items-start">
          {/* Left Column: Avatar & Barcode */}
          <div className="col-span-4 flex flex-col items-center justify-center text-center space-y-1.5 pt-0.5">
            <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-blue-900 text-base font-black text-white shadow-xs border border-blue-950/20">
              {initials || "LIB"}
            </div>

            {/* Barcode SVG */}
            {barcodeSvg ? (
              <div
                className="w-full flex justify-center overflow-hidden py-0.5"
                // biome-ignore lint/security/noDangerouslySetInnerHtml: safe internal Code 128 generator
                dangerouslySetInnerHTML={{ __html: barcodeSvg }}
              />
            ) : null}

            <span className="font-mono text-[10px] font-black tracking-wider text-slate-900">
              {card.cardNo}
            </span>
          </div>

          {/* Right Column: Key Patron Information */}
          <div className="col-span-8 space-y-1 text-[11px] text-slate-800 leading-tight">
            <div className="border-b border-slate-200 pb-1">
              <span className="text-[9px] font-semibold text-slate-500 uppercase tracking-wider block">
                Patron Name
              </span>
              <h3 className="text-xs font-black uppercase text-slate-950 truncate">{card.name}</h3>
            </div>

            <div className="grid grid-cols-2 gap-x-2 gap-y-1 pt-0.5">
              <div>
                <span className="text-[8px] font-semibold text-slate-500 uppercase block">
                  Father&apos;s Name
                </span>
                <span className="font-semibold text-slate-900 truncate block">
                  {card.fatherName?.trim() || "—"}
                </span>
              </div>

              <div>
                <span className="text-[8px] font-semibold text-slate-500 uppercase block">
                  Department
                </span>
                <span className="font-semibold text-slate-900 truncate block">
                  {card.department?.trim() || card.courseName?.trim() || "—"}
                </span>
              </div>

              <div>
                <span className="text-[8px] font-semibold text-slate-500 uppercase block">
                  Batch
                </span>
                <span className="font-semibold text-slate-900 truncate block">{displayBatch}</span>
              </div>

              <div>
                <span className="text-[8px] font-semibold text-slate-500 uppercase block">
                  Mobile No.
                </span>
                <span className="font-semibold text-slate-900 truncate block">
                  {card.mobile?.trim() || "—"}
                </span>
              </div>
            </div>

            <div className="pt-0.5 flex items-center justify-between text-[9px] text-slate-600">
              <span>
                Library:{" "}
                <strong className="text-slate-900">{card.libraryName || "Central Library"}</strong>
              </span>
              {card.cardExpiry && (
                <span>
                  Valid Till:{" "}
                  <strong className="text-slate-900">{formatDate(card.cardExpiry)}</strong>
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Bottom Strip: In-charge Signature Line */}
        <div className="pt-2 border-t border-slate-200 flex items-end justify-between">
          <div className="text-[8px] text-slate-500 leading-tight max-w-[190px]">
            <span>Card is non-transferable. Must be presented at circulation desk.</span>
          </div>

          <div className="text-center w-36">
            <div className="border-b border-dashed border-slate-700 w-full mb-0.5" />
            <span className="text-[9px] font-bold text-slate-900 uppercase tracking-tight block">
              Library Incharge Sign
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

interface LibraryCardModalProps {
  cards: LibraryCardData[];
  open: boolean;
  onClose: () => void;
  title?: string;
}

/**
 * Modal to preview and print one or multiple Library Cards.
 * Includes @media print style injection to ensure clean printing on paper or PDF.
 */
export function LibraryCardModal({ cards, open, onClose, title }: LibraryCardModalProps) {
  if (!open || cards.length === 0) return null;

  const handlePrint = () => {
    window.print();
  };

  const modalTitle =
    title ||
    (cards.length === 1 ? `Library Card — ${cards[0].name}` : `Library Cards (${cards.length})`);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="library-card-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs overflow-y-auto"
    >
      {/* Print-specific CSS */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden !important;
          }
          #printable-library-card-container,
          #printable-library-card-container * {
            visibility: visible !important;
          }
          #printable-library-card-container {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            padding: 12mm !important;
            margin: 0 !important;
            background: white !important;
          }
          .no-print {
            display: none !important;
          }
          .library-card-print {
            break-inside: avoid !important;
            page-break-inside: avoid !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            margin-bottom: 8mm !important;
          }
        }
      `}</style>

      <div className="relative w-full max-w-4xl rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden my-8 max-h-[90vh] flex flex-col">
        {/* Modal Toolbar (hidden on print) */}
        <div className="no-print flex items-center justify-between border-b border-slate-200 bg-slate-50 px-6 py-4">
          <div>
            <h2 id="library-card-modal-title" className="text-base font-bold text-slate-900">
              🪪 {modalTitle}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Ready to print official patron identification and circulation membership cards.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center space-x-1.5 rounded-lg bg-blue-900 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-blue-800 transition active:scale-95 cursor-pointer"
            >
              <span>🖨️</span>
              <span>
                {cards.length === 1 ? "Print Library Card" : `Print All Cards (${cards.length})`}
              </span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>

        {/* Modal Body / Printable Container */}
        <div className="overflow-y-auto p-6 bg-slate-100/60 flex-1">
          <div
            id="printable-library-card-container"
            className="flex flex-wrap gap-6 justify-center"
          >
            {cards.map((card) => (
              <LibraryCard key={`lib-card-${card.cardNo}`} card={card} />
            ))}
          </div>
        </div>

        {/* Modal Footer (hidden on print) */}
        <div className="no-print border-t border-slate-200 bg-white px-6 py-3 flex items-center justify-between text-xs text-slate-500">
          <span>
            Total: <strong>{cards.length}</strong> {cards.length === 1 ? "card" : "cards"} prepared
          </span>
          <span className="text-[11px] text-slate-400">
            Tip: Select &quot;Save as PDF&quot; in the print dialog to export digital ID cards.
          </span>
        </div>
      </div>
    </div>
  );
}
