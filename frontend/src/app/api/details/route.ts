import { detailsErrorResponse, serverDetailsService } from "@/features/expense-details/server";

/** Every expense's saved details. When off-chain storage is not connected, an empty, unconfigured list. */
export async function GET() {
  const service = serverDetailsService();
  if (!service) return Response.json({ configured: false, items: [] });
  try {
    return Response.json({ configured: true, items: await service.list() });
  } catch (error) {
    return detailsErrorResponse(error);
  }
}
