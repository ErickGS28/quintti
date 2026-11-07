import {
  detailsErrorResponse,
  NOT_CONFIGURED,
  parseDetailsForm,
  parseExpenseId,
  serverDetailsService,
} from "@/features/expense-details/server";

type Context = { params: Promise<{ id: string }> };

/**
 * Saves an expense's description and invoice (multipart form: `description`, `vendorLabel`,
 * `invoice`). Accepted only if the file is the invoice the contract recorded, and only once.
 */
export async function POST(request: Request, { params }: Context) {
  const service = serverDetailsService();
  if (!service) return Response.json(NOT_CONFIGURED, { status: 503 });
  try {
    const expenseId = parseExpenseId((await params).id);
    const input = parseDetailsForm(await request.formData());
    return Response.json(await service.attach(expenseId, input), { status: 201 });
  } catch (error) {
    return detailsErrorResponse(error);
  }
}
