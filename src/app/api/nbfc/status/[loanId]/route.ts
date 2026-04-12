import { NextRequest, NextResponse } from "next/server";
import { getLoan, markInstalmentPaid, updateLoanStatus } from "@/lib/nbfc-integration";
import { backend } from "@/lib/backend-core";
import { getFirebaseServer } from "@/lib/firebase-server";

// Ensure Firebase is initialized on the server
getFirebaseServer();

export async function GET(
  req: NextRequest,
  { params }: { params: { loanId: string } }
) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");

  if (!userId) return NextResponse.json({ error: "userId required" }, { status: 400 });

  try {
    const loan = await getLoan(userId, params.loanId);
    if (!loan) return NextResponse.json({ error: "Loan not found" }, { status: 404 });
    return NextResponse.json({ loan });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: { loanId: string } }
) {
  try {
    const body = await req.json();
    const { userId, instalmentNumber, instalmentAmount } = body;

    if (!userId || !instalmentNumber) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    // Mark EMI as paid
    await markInstalmentPaid(userId, params.loanId, instalmentNumber);

    // Record as debit transaction in main ledger
    await backend.recordTransaction({
      userId,
      amount: instalmentAmount,
      type: "debit",
      category: "Loan Repayment",
      payerIdentifier: "NBFC Partner",
      description: `EMI Payment #${instalmentNumber} for loan ${params.loanId}`,
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("[NBFC Status API] Error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
