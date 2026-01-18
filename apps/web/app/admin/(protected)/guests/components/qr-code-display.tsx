"use client";

import { Button, Modal } from "@heroui/react";
import { Download, QrCode } from "lucide-react";
import { useRef, useState } from "react";
import QRCode from "react-qr-code";

type QRCodeDisplayProps = {
  code: string;
  guestName: string;
};

export const QRCodeDisplay = ({ code, guestName }: QRCodeDisplayProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const qrRef = useRef<HTMLDivElement>(null);

  const invitationUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/?id=${code}`
      : `/?id=${code}`;

  const handleDownload = () => {
    if (!qrRef.current) return;

    const svg = qrRef.current.querySelector("svg");
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const img = new Image();
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.fillStyle = "white";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);

      canvas.toBlob((blob) => {
        if (!blob) return;
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.download = `invitation-${code}.png`;
        link.href = url;
        link.click();
        URL.revokeObjectURL(url);
      });
    };

    img.src = `data:image/svg+xml;base64,${btoa(svgData)}`;
  };

  return (
    <>
      <Button onPress={() => setIsOpen(true)} variant="secondary" size="sm">
        <QrCode className="h-4 w-4" />
        QR Code
      </Button>

      {isOpen && (
        <Modal.Backdrop
          isOpen
          onOpenChange={(open) => !open && setIsOpen(false)}
        >
          <Modal.Container>
            <Modal.Dialog className="sm:max-w-md">
              <Modal.CloseTrigger />
              <Modal.Header>
                <Modal.Heading>Invitation QR Code</Modal.Heading>
              </Modal.Header>

              <Modal.Body>
                <div className="space-y-4">
                  <div className="text-center">
                    <p className="text-lg font-semibold">{guestName}</p>
                    <p className="mt-1 text-sm text-gray-600">
                      Code: <span className="font-mono">{code}</span>
                    </p>
                  </div>

                  <div
                    ref={qrRef}
                    className="flex justify-center rounded-lg bg-white p-8"
                  >
                    <QRCode
                      value={invitationUrl}
                      size={256}
                      style={{
                        height: "auto",
                        maxWidth: "100%",
                        width: "100%",
                      }}
                      viewBox="0 0 256 256"
                    />
                  </div>

                  <div className="text-center text-sm text-gray-500">
                    <p>Scan to access invitation</p>
                    <p className="mt-1 break-all font-mono text-xs">
                      {invitationUrl}
                    </p>
                  </div>
                </div>
              </Modal.Body>

              <Modal.Footer>
                <Button onPress={() => setIsOpen(false)} variant="secondary">
                  Close
                </Button>
                <Button onPress={handleDownload} variant="primary">
                  <Download className="h-4 w-4" />
                  Download PNG
                </Button>
              </Modal.Footer>
            </Modal.Dialog>
          </Modal.Container>
        </Modal.Backdrop>
      )}
    </>
  );
};
