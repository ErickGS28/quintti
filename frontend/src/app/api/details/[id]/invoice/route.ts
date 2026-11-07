import {
  detailsErrorResponse,
  NOT_CONFIGURED,
  parseExpenseId,
  serverDetailsService,
} from "@/features/expense-details/server";

type Context = { params: Promise<{ id: string }> };

/** Streams an expense's invoice, so any resident can download it and check its fingerprint. */
export async function GET(_request: Request, { params }: Context) {
  const service = serverDetailsService();
  if (!service) return Response.json(NOT_CONFIGURED, { status: 503 });
  try {
    const expenseId = parseExpenseId((await params).id);
    const { body, details } = await service.invoice(expenseId);
    const fileName = encodeURIComponent(details.invoice.name);
    return new Response(body, {
      headers: {
        "Content-Type": details.invoice.type,
        "Content-Disposition": `inline; filename*=UTF-8''${fileName}`,
        // The file never changes once saved: its path carries its fingerprint.
        "Cache-Control": "public, max-age=86400, immutable",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    return detailsErrorResponse(error);
  }
}
