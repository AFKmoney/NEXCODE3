import { NextResponse } from "next/server";

/**
 * Mock Auth Route for Static Export
 */
export async function GET() {
  return NextResponse.json({ user: null });
}

export async function POST() {
  return NextResponse.json({ user: null });
}

export async function generateStaticParams() {
  return [];
}
