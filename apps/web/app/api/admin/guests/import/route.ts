import { eq } from "drizzle-orm";
import { type NextRequest, NextResponse } from "next/server";
import * as XLSX from "xlsx";
import { db } from "@/db";
import { invitation } from "@/db/schema";
import { verifySession } from "@/lib/dal";
import { generateInvitationCode } from "@/lib/invitation-code";

type ImportRow = {
  name: string;
  maxGuests: number;
  notes?: string;
};

export const POST = async (req: NextRequest) => {
  try {
    const session = await verifySession();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Read the file
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Parse Excel file
    const workbook = XLSX.read(buffer, { type: "buffer" });
    const sheetName = workbook.SheetNames[0];
    if (!sheetName) {
      return NextResponse.json(
        { error: "No sheets found in Excel file" },
        { status: 400 }
      );
    }
    const worksheet = workbook.Sheets[sheetName];
    if (!worksheet) {
      return NextResponse.json(
        { error: "Could not read worksheet" },
        { status: 400 }
      );
    }

    // Convert to JSON
    const data = XLSX.utils.sheet_to_json<{
      Name?: string;
      "Max Guests"?: number;
      Notes?: string;
    }>(worksheet);

    if (data.length === 0) {
      return NextResponse.json(
        { error: "No data found in Excel file" },
        { status: 400 }
      );
    }

    // Validate and transform data
    const rows: ImportRow[] = [];
    const errors: string[] = [];

    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      if (!row) continue;

      const rowNum = i + 2; // +2 because Excel rows start at 1 and we have a header

      if (!row.Name || row.Name.toString().trim() === "") {
        errors.push(`Row ${rowNum}: Name is required`);
        continue;
      }

      const maxGuests = row["Max Guests"];
      if (
        !maxGuests ||
        typeof maxGuests !== "number" ||
        maxGuests < 1 ||
        maxGuests > 20
      ) {
        errors.push(
          `Row ${rowNum}: Max Guests must be a number between 1 and 20`
        );
        continue;
      }

      rows.push({
        name: row.Name.toString().trim(),
        maxGuests: Math.floor(maxGuests),
        notes: row.Notes?.toString().trim() || undefined,
      });
    }

    if (rows.length === 0) {
      return NextResponse.json(
        {
          error: "No valid rows found",
          details: errors,
        },
        { status: 400 }
      );
    }

    // Generate unique codes for all guests
    const existingCodes = new Set<string>();
    const codesForRows: string[] = [];

    for (const _row of rows) {
      let code: string;
      let attempts = 0;
      const maxAttempts = 10;

      while (attempts < maxAttempts) {
        code = generateInvitationCode();

        // Check against existing codes in DB and newly generated codes
        const [existing] = await db
          .select()
          .from(invitation)
          .where(eq(invitation.code, code))
          .limit(1);

        if (!existing && !existingCodes.has(code)) {
          existingCodes.add(code);
          codesForRows.push(code);
          break;
        }
        attempts++;
      }

      if (attempts === maxAttempts) {
        throw new Error("Failed to generate unique invitation codes");
      }
    }

    // Insert guests in bulk with generated codes
    const inserted = await db
      .insert(invitation)
      .values(
        rows.map((row, index) => {
          const code = codesForRows[index];
          if (!code) {
            throw new Error(`Missing code for row ${index}`);
          }
          return {
            code,
            primaryGuestName: row.name,
            maxGuests: row.maxGuests,
            notes: row.notes || null,
          };
        })
      )
      .returning();

    return NextResponse.json({
      success: true,
      imported: inserted.length,
      skipped: errors.length,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    console.error("Error importing guests:", error);
    return NextResponse.json(
      { error: "Failed to import guests" },
      { status: 500 }
    );
  }
};
