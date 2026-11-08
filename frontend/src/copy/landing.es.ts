/**
 * Spanish text of the landing page. Kept apart from the components so the wording can change
 * without touching layout, and so another language can be added later.
 */
export const landingCopy = {
  meta: {
    title: "Quintti: la cuenta del edificio con las reglas de la asamblea",
    description:
      "Quintti es la cuenta compartida de tu edificio: el dinero solo sale si se cumplen las reglas de la asamblea y cada vecino ve a dónde va su cuota. Powered by Stellar.",
  },

  nav: {
    menuLabel: "Secciones de la página",
    problem: "El problema",
    solution: "La solución",
    flow: "Cómo funciona",
    example: "Un ejemplo",
    why: "Por qué Stellar",
    railLabel: "Pantallas de la página",
    home: "Inicio",
  },

  hero: {
    id: "inicio",
    accent: ["Transparente", "Verificable", "Compartida"],
    body: "Quintti es la cuenta compartida de tu edificio. El dinero solo sale si se cumplen las reglas de la asamblea, y cada vecino ve a dónde va su cuota.",
    poweredBy: "Powered by Stellar",
    primary: "Ver el problema",
    secondary: "Ver un ejemplo",
  },

  problem: {
    id: "problema",
    eyebrow: "El problema",
    title: "Pagas tu cuota cada mes. ¿Sabes en qué se gasta?",
    lead: "Con una cuota de $300.000, un edificio de 40 apartamentos junta $12.000.000 cada mes en una sola cuenta. Una persona la maneja y casi nadie puede revisarla.",
    items: [
      {
        title: "«¿En qué se gastó mi cuota?»",
        body: "Las cuentas llegan semanas después, en un PDF. Y preguntar se siente como acusar.",
      },
      {
        title: "«Se aprobó un presupuesto… ¿y se cumple?»",
        body: "La asamblea aprueba un monto, pero nada impide gastar más o en otra cosa.",
      },
      {
        title: "«Una sola persona decide»",
        body: "El dinero sale con la firma de una persona. El consejo se entera después.",
      },
      {
        title: "«Cambió la administración y se perdió todo»",
        body: "Llegan cajas de papeles y desconfianza, no un registro que se pueda consultar.",
      },
    ],
    closing: "Tú pones el dinero. Pero no tienes cómo comprobar nada.",
  },
  solution: {
    id: "solucion",
    eyebrow: "La solución",
    title: "Las reglas de la asamblea, dentro de la cuenta.",
    lead: "El dinero solo sale si se cumplen las reglas de la asamblea. Todos ven lo mismo.",
    rules: [
      {
        title: "Tope por categoría",
        body: "Si un gasto lo supera, la cuenta lo rechaza.",
      },
      {
        title: "Solo proveedores aprobados",
        body: "El dinero solo va a quienes la asamblea autorizó.",
      },
      {
        title: "Firmas del consejo",
        body: "Se paga cuando suficientes consejeros aprueban, por ejemplo 2 de 3.",
      },
    ],
    stepsId: "flujo",
    stepsEyebrow: "Cómo funciona",
    stepsTitle: "Así fluye un gasto",
    steps: [
      {
        title: "La asamblea fija las reglas",
        body: "Carga el presupuesto y los proveedores aprobados.",
      },
      {
        title: "La administración propone",
        body: "Registra el gasto con su factura. Solo se guarda su huella digital.",
      },
      {
        title: "El consejo aprueba",
        body: "Cada consejero firma. Al llegar al número necesario, el pago sale solo.",
      },
      {
        title: "Todos lo ven",
        body: "El proveedor recibe el pago y cualquier vecino lo verifica, sin cuenta.",
      },
    ],
  },

  figures: {
    budget: {
      title: "Presupuesto",
      rows: ["Mantenimiento", "Vigilancia", "Aseo"],
    },
    proposal: {
      vendor: "Técnico de ascensores",
      invoice: "factura.pdf",
      fingerprint: "Huella 5359…5aa8",
    },
    council: {
      title: "Consejo",
      progress: "2 de 3 firmas",
    },
    receipt: {
      title: "Pagado",
      detail: "Recibo público",
      link: "Ver en stellar.expert",
    },
  },

  example: {
    id: "ejemplo",
    eyebrow: "Un ejemplo",
    title: "Torres del Parque, un martes.",
    lead: "Se daña el ascensor. Mira qué pasa cuando un gasto rompe las reglas.",
    note: "Simulación con valores ilustrativos",
    building: "Torres del Parque · 40 apartamentos",
    accountTitle: "Cuenta del edificio",
    balanceLabel: "Saldo",
    budgetLabel: "Mantenimiento",
    budgetOf: "de",
    remainingLabel: "Disponible",
    expenseTitle: "Gasto",
    expenseVendor: "Técnico de ascensores",
    expenseEmpty: "Aún no se propone ningún gasto.",
    council: ["Ana", "Beto", "Carla"],
    councilLabel: "Consejo (2 de 3)",
    councilSigned: "firmó",
    councilPending: "sin firmar",
    ledgerTitle: "Lo que ve un vecino",
    ledgerEmpty: "Aún no hay movimientos.",
    status: {
      pending: "Pendiente",
      paid: "Pagado",
      rejected: "Rechazado",
    },
    steps: {
      idle: {
        caption:
          "Marta, la administradora, ve que el ascensor necesita reparación. La asamblea aprobó $10.000.000 para mantenimiento este año.",
        action: "Proponer arreglo de $8.000.000",
      },
      proposed: {
        caption:
          "Marta propone pagar $8.000.000 al técnico, con la factura adjunta. La cuenta revisa: el técnico está aprobado y el monto cabe en el presupuesto.",
        action: "Primera firma del consejo",
      },
      firstApproval: {
        caption: "Ana firma. Todavía falta una firma: se necesitan 2 de 3.",
        action: "Segunda firma del consejo",
      },
      paid: {
        caption: "Con la firma de Beto, el pago sale directo al técnico. Cualquier vecino puede ver el recibo.",
        action: "Un mes después: proponer otro arreglo de $5.000.000",
      },
      blocked: {
        caption:
          "Solo quedan $2.000.000 en la categoría: la cuenta rechaza el gasto antes de que nadie firme. Ni con todas las firmas se puede saltar el tope.",
        action: "Volver a empezar",
      },
    },
    ledger: {
      proposed: "Propuesto: $8.000.000 al técnico",
      approvedBy: "Firma de",
      paid: "Pagado: $8.000.000 al técnico",
      rejected: "Rechazado: $5.000.000 (quedan $2.000.000)",
    },
    progress: "Paso",
  },

  why: {
    id: "stellar",
    eyebrow: "Por qué Stellar",
    title: "Lo que una app normal no puede prometer.",
    lead: "Una app te pide confiar en su empresa. Aquí las reglas viven en la cuenta que guarda el dinero, sobre una red pública.",
    compare: {
      headers: ["", "Una app normal", "Con Stellar"],
      rows: [
        {
          question: "¿Quién guarda el dinero?",
          web2: "La empresa del software o un banco.",
          stellar: "Un contrato público. Nadie puede moverlo fuera de las reglas.",
        },
        {
          question: "¿Quién puede cambiar los datos?",
          web2: "Quien administra el sistema.",
          stellar: "Nadie. Cada movimiento queda registrado y no se puede borrar.",
        },
        {
          question: "¿Quién puede comprobarlo?",
          web2: "Solo quien recibe acceso.",
          stellar: "Cualquier vecino o auditor, sin pedir permiso.",
        },
        {
          question: "¿Cuánto cuesta registrar un gasto?",
          web2: "Comisiones por transacción.",
          stellar: "Una fracción de centavo, incluso para un gasto de 10 dólares.",
        },
        {
          question: "¿Y los propietarios en el exterior?",
          web2: "Transferencias lentas y caras.",
          stellar: "Pagos en segundos desde cualquier país.",
        },
      ],
    },
    itemsEyebrow: "Lo que cambia",
    itemsTitle: "Confianza que se puede comprobar.",
    items: [
      {
        title: "Reglas que nadie se salta",
        body: "El tope y los proveedores están en el contrato. Nadie puede esquivarlos.",
      },
      {
        title: "Un registro que cualquiera verifica",
        body: "Cada propuesta, firma y pago es público. Un vecino lo revisa sin cuenta.",
      },
      {
        title: "Pagos en segundos y casi sin costo",
        body: "Registrar un gasto cuesta una fracción de centavo.",
      },
    ],
  },

  footer: {
    line: "Prototipo en la red de pruebas de Stellar. Es una herramienta de transparencia y control interno; no sustituye a la asamblea ni a la ley.",
  },
} as const;
