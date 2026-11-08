import { AppError, type AppErrorKind } from "@/lib/errors/app-error";
import type { ContractErrorName } from "@/lib/stellar/contract-errors";

/** What a person sees when the contract rejects a call. One entry per contract error. */
export const contractErrorMessages: Record<ContractErrorName, string> = {
  NotInitialized: "La cuenta del edificio todavía no está configurada.",
  InvalidCouncil: "El consejo debe tener entre 1 y 7 personas, sin repetidas.",
  InvalidThreshold:
    "Las firmas necesarias deben ser al menos 1 y no pueden superar el tamaño del consejo.",
  AdministratorInCouncil: "Quien administra no puede ser parte del consejo.",
  InvalidAmount: "El monto debe ser mayor que cero.",
  UnknownCategory: "Esa categoría no existe en el presupuesto.",
  TooManyCategories: "Ya se alcanzó el máximo de categorías del presupuesto.",
  TooManyVendors: "Ya se alcanzó el máximo de proveedores aprobados.",
  BudgetBelowSpent: "El nuevo tope no puede ser menor que lo que ya se pagó en esa categoría.",
  VendorNotApproved: "Ese proveedor no está aprobado por la asamblea.",
  VendorIsInsider:
    "No se puede pagar a la asamblea, a quien administra ni a una persona del consejo.",
  OverBudget: "Este gasto supera lo que queda del presupuesto de la categoría.",
  ExpenseNotFound: "No existe un gasto con ese número.",
  ExpenseNotPending: "Ese gasto ya fue pagado o cancelado.",
  NotCouncilMember: "Solo las personas del consejo pueden aprobar gastos.",
  AlreadyApproved: "Ya aprobaste este gasto.",
  NotAuthorized: "No tienes permiso para hacer esto.",
  InsufficientBalance: "La cuenta del edificio no tiene saldo suficiente para este pago.",
  Overflow: "El monto es demasiado grande.",
};

/** What a person sees for failures that do not come from a contract rule. */
export const appErrorMessages: Record<Exclude<AppErrorKind, "contract">, string> = {
  "invalid-input": "Revisa los datos que ingresaste.",
  "wallet-rejected": "Cancelaste la firma. No se hizo ningún cambio.",
  "wallet-unavailable":
    "No hay una billetera conectada o no pudo firmar. Conéctala e inténtalo de nuevo.",
  "wallet-network":
    "Tu billetera está en otra red. Cámbiala a la red de pruebas (Testnet) en los ajustes de la billetera y vuelve a intentarlo.",
  network: "No pudimos conectar con la red de Stellar. Revisa tu conexión e inténtalo de nuevo.",
  timeout:
    "La transacción se envió pero aún no se confirma. Revísala en el explorador antes de repetirla.",
  "state-expired": "Algunos datos de la cuenta caducaron y hay que restaurarlos antes de continuar.",
  unknown: "Ocurrió un error inesperado.",
};

const UNKNOWN_CONTRACT_ERROR = "El contrato rechazó la operación.";

/** The message to show for any `AppError`. */
export function describeError(error: AppError): string {
  if (error.kind !== "contract") {
    return appErrorMessages[error.kind];
  }
  const name = error.contractError as ContractErrorName | undefined;
  return (name && contractErrorMessages[name]) || UNKNOWN_CONTRACT_ERROR;
}

/** The message for anything thrown, whether or not it is already an `AppError`. */
export function describeAnyError(error: unknown): string {
  return error instanceof AppError ? describeError(error) : appErrorMessages.unknown;
}
