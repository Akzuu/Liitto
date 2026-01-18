"use client";

import { Alert, Button, Modal } from "@heroui/react";
import { Download, FileSpreadsheet, Upload } from "lucide-react";
import { useRef, useState } from "react";
import * as XLSX from "xlsx";

type ImportGuestsButtonProps = {
  onSuccess: () => void;
};

export const ImportGuestsButton = ({ onSuccess }: ImportGuestsButtonProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [result, setResult] = useState<{
    imported: number;
    skipped: number;
    errors?: string[];
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const downloadTemplate = () => {
    const template = [
      { Name: "Erkki Esimerkki", "Max Guests": 2, Notes: "Osa perhettä" },
    ];

    const ws = XLSX.utils.json_to_sheet(template);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Guests");

    // Set column widths
    ws["!cols"] = [{ wch: 20 }, { wch: 12 }, { wch: 30 }];

    XLSX.writeFile(wb, "guest-import-template.xlsx");
  };

  const handleFileSelect = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setError(null);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/admin/guests/import", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to import guests");
      }

      setResult(data);
      if (data.imported > 0) {
        setTimeout(() => {
          onSuccess();
          handleClose();
        }, 2000);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    setResult(null);
    setError(null);
  };

  return (
    <>
      <Button onPress={() => setIsOpen(true)} variant="secondary">
        <Upload className="h-4 w-4" />
        Import from Excel
      </Button>

      {isOpen && (
        <Modal.Backdrop isOpen onOpenChange={(open) => !open && handleClose()}>
          <Modal.Container>
            <Modal.Dialog className="sm:max-w-lg">
              <Modal.CloseTrigger />
              <Modal.Header>
                <Modal.Heading>Import Guests from Excel</Modal.Heading>
              </Modal.Header>

              <Modal.Body>
                <div className="space-y-4">
                  <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                    <h4 className="mb-2 flex items-center gap-2 font-semibold">
                      <FileSpreadsheet className="h-5 w-5" />
                      Excel Format
                    </h4>
                    <p className="mb-3 text-sm text-gray-600">
                      Your Excel file must have these columns:
                    </p>
                    <ul className="space-y-1 text-sm text-gray-700">
                      <li>
                        <strong>Name</strong> - Guest name (required)
                      </li>
                      <li>
                        <strong>Max Guests</strong> - Number between 1-20
                        (required)
                      </li>
                      <li>
                        <strong>Notes</strong> - Internal notes (optional)
                      </li>
                    </ul>
                  </div>

                  <Button
                    onPress={downloadTemplate}
                    variant="secondary"
                    className="w-full"
                  >
                    <Download className="h-4 w-4" />
                    Download Template
                  </Button>

                  <div className="border-t pt-4">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".xlsx,.xls"
                      onChange={handleFileSelect}
                      className="hidden"
                      id="file-upload"
                    />
                    <label
                      htmlFor="file-upload"
                      className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 px-4 py-8 text-center transition-colors hover:border-gray-400 hover:bg-gray-100"
                    >
                      <Upload className="h-5 w-5 text-gray-400" />
                      <span className="text-sm text-gray-600">
                        {isUploading
                          ? "Uploading..."
                          : "Click to select Excel file"}
                      </span>
                    </label>
                  </div>

                  {result && (
                    <Alert status="success">
                      <Alert.Indicator />
                      <Alert.Content>
                        <Alert.Title>Import Successful!</Alert.Title>
                        <Alert.Description>
                          Imported {result.imported} guests
                          {result.skipped > 0 &&
                            `, skipped ${result.skipped} invalid rows`}
                        </Alert.Description>
                      </Alert.Content>
                    </Alert>
                  )}

                  {result?.errors && result.errors.length > 0 && (
                    <div className="mt-2 rounded-md bg-yellow-50 p-3">
                      <p className="mb-2 text-sm font-semibold text-yellow-800">
                        Skipped Rows:
                      </p>
                      <ul className="space-y-1 text-xs text-yellow-700">
                        {result.errors.map((err) => (
                          <li key={err}>{err}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {error && (
                    <Alert status="danger">
                      <Alert.Indicator />
                      <Alert.Content>
                        <Alert.Title>Error</Alert.Title>
                        <Alert.Description>{error}</Alert.Description>
                      </Alert.Content>
                    </Alert>
                  )}
                </div>
              </Modal.Body>

              <Modal.Footer>
                <Button onPress={handleClose} variant="secondary">
                  Close
                </Button>
              </Modal.Footer>
            </Modal.Dialog>
          </Modal.Container>
        </Modal.Backdrop>
      )}
    </>
  );
};
