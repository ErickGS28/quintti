import { AppError } from "@/lib/errors/app-error";

import { describeAnyError } from "./errors.es";

/** The vault's errors by name. A test checks this list against the contract's (`VAULT_ERROR_NAMES`). */
type VaultErrorKey = "WrongCode" | "AlreadyClaimed" | "VaultEmpty" | "InvalidPayout";

/** What a person sees when the vault rejects a claim. One entry per vault error. */
export const vaultErrorMessages: Record<VaultErrorKey, string> = {
  WrongCode: "Ese no es el código. Revísalo e inténtalo de nuevo: no se firmó nada ni se cobró nada.",
  AlreadyClaimed: "Esta billetera ya reclamó su parte de la bóveda. Cada billetera reclama una sola vez.",
  VaultEmpty: "La bóveda ya no tiene fondos para otra parte.",
  InvalidPayout: "La bóveda se creó con un pago inválido.",
};

/** The message for anything thrown while claiming. The vault's own errors are named, the rest are the usual ones. */
export function describeVaultError(error: unknown): string {
  if (error instanceof AppError) {
    if (error.kind === "invalid-input") return "Escribe el código para abrir la bóveda.";
    if (error.kind === "contract" && error.contractError && error.contractError in vaultErrorMessages) {
      return vaultErrorMessages[error.contractError as VaultErrorKey];
    }
  }
  return describeAnyError(error);
}

export const vaultCopy = {
  meta: {
    title: "Bóveda · Quintti",
    description: "Una bóveda en la red de pruebas de Stellar que guarda XLM de testnet y solo los suelta a quien presente el código.",
  },
  topbar: { home: "Quintti", open: "Abrir la app" },
  header: {
    eyebrow: "Ship It · Reto Bóveda",
    title: "Bóveda",
    body: "Un contrato en la red de pruebas de Stellar guarda XLM de testnet y solo los suelta a quien presente el código. Conecta una billetera de testnet, escribe el código y reclama.",
  },
  stats: {
    held: "En la bóveda",
    payout: "Por billetera",
    payoutHint: "Una vez por billetera",
    claims: "Reclamos",
    claimsHint: (count: number) => (count === 1 ? "billetera ha reclamado" : "billeteras han reclamado"),
  },
  contract: {
    label: "Contrato",
    explorer: "Ver el contrato en stellar.expert",
  },
  claim: {
    title: "Abre la bóveda",
    body: "Escribe el código. Si es correcto, el contrato te paga tu parte en el mismo momento.",
    connectTitle: "1. Conecta tu billetera",
    connectBody: "Usa una billetera en la red de pruebas (testnet). No se pide ninguna otra cosa.",
    codeTitle: "2. Escribe el código",
    codeLabel: "Código",
    codePlaceholder: "Escribe el código",
    codeHint: "No importan las mayúsculas.",
    submit: "Abrir la bóveda",
    submitting: "Abriendo…",
    pending: "Revisa tu billetera y firma. El contrato comprueba el código y te paga.",
    alreadyTitle: "Esta billetera ya reclamó",
    alreadyBody: "Cada billetera reclama una sola vez. Prueba con otra si quieres repetirlo.",
    successTitle: (amount: string) => `Recibiste ${amount}`,
    successBody: "El contrato comprobó el código y te pagó desde la bóveda. Puedes verlo en la cadena.",
    explorer: "Ver la transacción",
    wallet: "Billetera conectada",
  },
  rules: {
    title: "Cómo funciona",
    items: [
      "La bóveda guarda XLM de testnet. Solo se despliega con una huella del código (SHA-256), nunca con el código.",
      "Cada billetera que presente el código recibe una parte fija y no puede reclamar otra vez.",
      "No hay dueño ni retiro: lo único que saca XLM de la bóveda es un reclamo correcto.",
      "Un código incorrecto se rechaza al simular la transacción: no pagas comisión ni firmas nada.",
    ],
  },
  notReady: {
    missingTitle: "La bóveda no está configurada",
    missingBody: "Esta versión de la app se construyó sin la dirección del contrato de la bóveda (NEXT_PUBLIC_VAULT_CONTRACT_ID).",
    invalidTitle: "La dirección de la bóveda no es válida",
    invalidBody: "NEXT_PUBLIC_VAULT_CONTRACT_ID no es una dirección de contrato de Stellar (empieza con C).",
  },
  readError: { title: "No pudimos leer la bóveda", retry: "Reintentar" },
  footer: "Red de pruebas de Stellar. XLM de testnet, sin valor. Contrato sin auditar.",
} as const;
