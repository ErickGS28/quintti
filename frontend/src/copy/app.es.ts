/**
 * Spanish text of the app screens. Kept apart from the components so the wording can change without
 * touching layout, and so another language can be added later. Messages for failures live in
 * `errors.es.ts`. Short on purpose: every word has to earn its place.
 */
export const appCopy = {
  meta: {
    title: "Cuenta del edificio · Quintti",
    description: "El saldo, el presupuesto y cada gasto del edificio, con las firmas del consejo, a la vista de todos.",
  },

  brand: "Quintti",
  skip: "Saltar al contenido",

  nav: {
    label: "Secciones",
    overview: "Resumen",
    expenses: "Gastos",
    rules: "Reglas",
    openMenu: "Abrir el menú",
    closeMenu: "Cerrar el menú",
    drawer: "Menú",
  },

  building: {
    fallbackName: "Cuenta del edificio",
  },

  network: {
    testnet: "Red de pruebas de Stellar",
    local: "Red local",
    short: { testnet: "Red de pruebas", local: "Red local" },
  },

  wallet: {
    connect: "Conectar billetera",
    connectShort: "Conectar",
    connecting: "Abriendo tu billetera…",
    connectHint: "Solo para firmar. Para mirar, no.",
    disconnect: "Desconectar billetera",
    you: "Tu billetera",
    noRole: "Sin rol: puedes ver todo",
    retry: "Intentar de nuevo",
  },

  roles: {
    assembly: "Asamblea",
    administrator: "Administración",
    council: "Consejo",
  },

  address: {
    copy: "Copiar dirección",
    copied: "Dirección copiada",
    explorer: "Ver en el explorador",
  },

  states: {
    readError: "No pudimos leer la cuenta",
    retry: "Reintentar",
    notYet: "Todavía no",
  },

  status: {
    pending: "Pendiente",
    paid: "Pagado",
    cancelled: "Cancelado",
  },

  tx: {
    pending: "Confirma en tu billetera y espera a la red.",
    explorer: "Ver la transacción",
    needsWallet: "Conecta tu billetera para hacer esto.",
  },

  toasts: {
    close: "Cerrar aviso",
  },

  overview: {
    balance: "Saldo",
    used: "Presupuesto usado",
    usedHint: (limit: string) => `de ${limit}`,
    pending: "Por aprobar",
    threshold: "Firmas para pagar",
    thresholdValue: (threshold: number, size: number) => `${threshold} de ${size}`,
    recentTitle: "Últimos gastos",
    recentLink: "Ver todos",
    whoTitle: "Quién decide",
  },

  role: {
    title: "Tu papel",
    visitor: {
      title: "Estás como vecino",
      body: "Ves todo, sin cuenta.",
    },
    connectedResident: {
      title: "Sin papel en esta cuenta",
      body: "Puedes ver todo.",
    },
    administrator: {
      title: "Eres la administración",
      body: "Propones los gastos. El consejo los aprueba.",
      action: "Proponer gasto",
    },
    council: {
      title: "Eres del consejo",
      body: "Apruebas los gastos pendientes.",
      action: "Ver gastos",
    },
    assembly: {
      title: "Representas a la asamblea",
      body: "Fijas el presupuesto y los proveedores.",
      action: "Ver reglas",
    },
  },

  expenses: {
    title: "Gastos",
    propose: "Proponer gasto",
    filterLabel: "Filtrar gastos",
    filters: { all: "Todos", pending: "Por aprobar", paid: "Pagados", cancelled: "Cancelados" },
    emptyTitle: "Aún no hay gastos",
    emptyBody: "Aparecerán aquí cuando la administración los proponga.",
    emptyFiltered: "Sin gastos con este estado.",
    number: (id: number) => `Gasto #${id}`,
    signatures: (valid: number, needed: number) => `${valid} de ${needed} firmas`,
  },

  detail: {
    back: "Gastos",
    notFoundTitle: "Ese gasto no existe",
    notFoundBody: "Revisa el número.",
    infoTitle: "Detalle",
    category: "Categoría",
    vendor: "Proveedor",
    proposedAt: "Propuesto",
    paidAt: "Pagado",
    fingerprint: "Huella de la factura",
    invoiceTitle: "Comprobar la factura",
    approvalsTitle: "Firmas",
    approvalsHint: (missing: number) =>
      missing === 0 ? "Firmas completas." : `Falta${missing === 1 ? "" : "n"} ${missing} firma${missing === 1 ? "" : "s"}.`,
    signed: "Firmó",
    notSigned: "Sin firmar",
    stale: "Firmas de quienes ya no están en el consejo (no cuentan):",
    actionsTitle: "Acciones",
    approve: "Aprobar",
    approveHint: "Tu firma queda pública. Si completa las necesarias, el pago sale en la misma operación.",
    alreadySigned: "Ya firmaste.",
    cancel: "Cancelar gasto",
    cancelConfirm: "Sí, cancelar",
    keep: "No",
    cancelHint: "No se puede reabrir.",
    approved: "Firma registrada",
    paid: "Firma registrada y gasto pagado",
    cancelled: "Gasto cancelado",
    closed: {
      paid: "Pagado.",
      cancelled: "Cancelado.",
    },
    noActions: "Firma el consejo; cancela la administración o la asamblea.",
  },

  propose: {
    title: "Proponer gasto",
    onlyAdministrator: {
      title: "Solo la administración propone",
      body: "Conecta su billetera.",
    },
    category: "Categoría",
    categoryPlaceholder: "Elige una categoría",
    available: (amount: string) => `Disponible: ${amount}`,
    vendor: "Proveedor",
    vendorPlaceholder: "Elige un proveedor aprobado",
    vendorNone: "La asamblea aún no aprobó proveedores.",
    amount: "Monto",
    amountHint: "Usa punto o coma para decimales.",
    invoice: "Factura",
    invoicePrompt: "Arrastra la factura o haz clic",
    invoiceHint: "PDF o imagen. Solo su huella va a la red.",
    invoiceReplace: "Cambiar archivo",
    fingerprint: "Huella",
    hashing: "Calculando la huella…",
    checksTitle: "Lo que revisa la cuenta",
    checks: {
      vendor: "Proveedor aprobado",
      budget: "Cabe en el presupuesto",
      funds: "Hay saldo en la cuenta",
      invoice: "Factura adjunta",
    },
    submit: "Proponer gasto",
    overBudget: "Supera lo disponible. La cuenta lo rechazaría.",
    noFunds: "Supera el saldo de la cuenta.",
    proposed: (id: number) => `Gasto #${id} propuesto`,
    proposedBody: "Registrado. Ahora el consejo puede firmarlo.",
    remainingLabel: "Disponible",
    viewExpense: "Ver el gasto",
    another: "Proponer otro",
  },

  rules: {
    title: "Reglas",
    description: "Solo la asamblea las cambia.",
    budgetTitle: "Presupuesto",
    vendorsTitle: "Proveedores",
    whoTitle: "Quién decide",
    councilLine: (threshold: number, size: number) => `${threshold} de ${size} firmas para pagar`,
  },

  budget: {
    emptyTitle: "Sin presupuesto",
    emptyBody: "La asamblea carga una categoría con su tope.",
    remaining: "Disponible",
    share: (percent: number) => `${percent}% usado`,
    formTitle: "Crear o cambiar un tope",
    category: "Categoría",
    categoryHint: "Una palabra, sin espacios ni tildes.",
    newLimit: "Tope",
    submit: "Guardar",
    edit: "Cambiar",
    saved: "Tope guardado",
  },

  vendors: {
    emptyTitle: "Sin proveedores",
    emptyBody: "La asamblea aprueba a cada uno antes de poder pagarle.",
    paid: (count: number, total: string) => (count === 0 ? "Sin pagos" : `${count} pago${count === 1 ? "" : "s"} · ${total}`),
    formTitle: "Aprobar un proveedor",
    address: "Dirección de Stellar",
    addressPlaceholder: "G…",
    submit: "Aprobar",
    remove: "Quitar",
    removeConfirm: "Sí, quitar",
    added: "Proveedor aprobado",
    removed: "Proveedor quitado",
  },

  verify: {
    prompt: "Arrastra el archivo original",
    hint: "No sale de tu navegador.",
    replace: "Probar con otro",
    checking: "Comparando…",
    matchExpected: "Es la factura de este gasto",
    noMatchExpected: "No es la factura de este gasto",
    noMatchBody: "Pide el original a la administración.",
    yourFingerprint: "Huella de tu archivo",
  },
} as const;
