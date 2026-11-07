import { EMPTY_DIRECTORY, serverDirectoryService } from "@/features/directory/server";

/** The building's profile and the names of known addresses. Empty when off-chain storage is off. */
export async function GET() {
  const service = serverDirectoryService();
  if (!service) return Response.json(EMPTY_DIRECTORY);
  try {
    return Response.json(await service.load());
  } catch (error) {
    console.error("Could not read the directory", error);
    // Names are a convenience: without them the app shows addresses.
    return Response.json(EMPTY_DIRECTORY);
  }
}
