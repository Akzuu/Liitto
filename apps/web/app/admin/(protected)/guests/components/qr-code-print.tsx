"use client";

import { Button } from "@heroui/react";
import { Printer } from "lucide-react";
import { useState } from "react";
import QRCode from "react-qr-code";

type Guest = {
  id: string;
  primaryGuestName: string;
  code: string;
};

type QRCodePrintProps = {
  guests: Guest[];
  rsvpDeadline: string;
};

export const QRCodePrint = ({ guests, rsvpDeadline }: QRCodePrintProps) => {
  const [isPrintReady, setIsPrintReady] = useState(false);

  const handlePrint = () => {
    setIsPrintReady(true);
    // Wait for render, then print
    setTimeout(() => {
      window.print();
      setIsPrintReady(false);
    }, 100);
  };

  const getInvitationUrl = (code: string) => {
    if (typeof window !== "undefined") {
      return `${window.location.origin}/?id=${code}`;
    }
    return `/?id=${code}`;
  };

  // Split guests into pages of 4
  const pages: Guest[][] = [];
  for (let i = 0; i < guests.length; i += 4) {
    pages.push(guests.slice(i, i + 4));
  }

  return (
    <>
      <Button onPress={handlePrint} variant="secondary">
        <Printer className="h-4 w-4" />
        Print All QR Codes ({guests.length})
      </Button>

      {isPrintReady && (
        <div className="print-container">
          {pages.map((pageGuests, pageIndex) => (
            <div
              key={`page-${pageIndex}-${pageGuests[0]?.id}`}
              className="print-page"
            >
              <div className="qr-grid">
                {pageGuests.map((guest) => (
                  <div key={guest.id} className="qr-item">
                    <div className="qr-header">
                      <h3 className="qr-title">Hääkutsu</h3>
                      <p className="qr-deadline">
                        Vastaa viimeistään <strong>{rsvpDeadline}</strong>
                      </p>
                    </div>
                    <div className="qr-wrapper">
                      <QRCode
                        value={getInvitationUrl(guest.code)}
                        size={256}
                        style={{
                          height: "auto",
                          maxWidth: "100%",
                          width: "100%",
                        }}
                        viewBox="0 0 256 256"
                      />
                    </div>
                    <div className="qr-info">
                      <p className="guest-name">{guest.primaryGuestName}</p>
                      <p className="guest-code">{guest.code}</p>
                      <p className="qr-instructions">
                        Skannaa QR-koodi tai vieraile:
                      </p>
                      <p className="qr-url">
                        {typeof window !== "undefined"
                          ? window.location.origin
                          : ""}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}

          <style jsx global>{`
            @media print {
              body * {
                visibility: hidden;
              }

              .print-container,
              .print-container * {
                visibility: visible;
              }

              .print-container {
                position: absolute;
                left: 0;
                top: 0;
                width: 100%;
                background: white;
              }

              .print-page {
                page-break-after: always;
                page-break-inside: avoid;
                width: 210mm;
                min-height: 257mm;
                padding: 15mm;
                box-sizing: border-box;
                position: relative;
              }

              .print-page:last-child {
                page-break-after: avoid;
              }

              .qr-grid {
                display: grid;
                grid-template-columns: repeat(2, 1fr);
                grid-template-rows: repeat(2, 1fr);
                gap: 8mm;
                width: 100%;
              }

              .qr-item {
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: flex-start;
                border: 2px dashed #d1d5db;
                border-radius: 8px;
                padding: 5mm;
                background: white;
              }

              .qr-header {
                text-align: center;
                width: 100%;
                margin-bottom: 3mm;
                padding-bottom: 2mm;
                border-bottom: 1px solid #e5e7eb;
              }

              .qr-title {
                font-size: 11pt;
                font-weight: 700;
                margin: 0 0 1mm 0;
                color: #111827;
              }

              .qr-deadline {
                font-size: 8pt;
                margin: 0;
                color: #dc2626;
              }

              .qr-deadline strong {
                font-weight: 700;
              }

              .qr-wrapper {
                width: 100%;
                max-width: 55mm;
                padding: 3mm;
                background: white;
                border-radius: 4px;
              }

              .qr-info {
                margin-top: 3mm;
                text-align: center;
                width: 100%;
                padding-top: 3mm;
                border-top: 1px solid #e5e7eb;
              }

              .guest-name {
                font-size: 10pt;
                font-weight: 600;
                margin: 0 0 1mm 0;
                color: #111827;
              }

              .guest-code {
                font-size: 9pt;
                font-family: monospace;
                margin: 0 0 2mm 0;
                color: #6b7280;
              }

              .qr-instructions {
                font-size: 7pt;
                margin: 0 0 1mm 0;
                color: #6b7280;
              }

              .qr-url {
                font-size: 7pt;
                font-family: monospace;
                font-weight: 600;
                margin: 0;
                color: #111827;
                word-break: break-all;
              }
            }

            @media screen {
              .print-container {
                position: fixed;
                inset: 0;
                background: rgba(0, 0, 0, 0.5);
                z-index: 9999;
                overflow-y: auto;
                padding: 20px;
              }

              .print-page {
                margin: 0 auto 20px;
                background: white;
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
              }
            }
          `}</style>
        </div>
      )}
    </>
  );
};
