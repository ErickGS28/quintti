/**
 * Spanish text of the landing page. Kept apart from the components so the wording can change
 * without touching layout, and so another language can be added later.
 */
export const landingCopy = {
  meta: {
    title: "Quintti: la cuenta del edificio con las reglas de la asamblea",
    description:
      "Una cuenta compartida donde nadie gasta fuera del presupuesto aprobado y cada vecino ve a dónde va su cuota. Construida sobre Stellar.",
  },

  nav: {
    menuLabel: "Secciones de la página",
    problem: "El problema",
    solution: "La solución",
    example: "Un ejemplo",
    why: "Por qué Stellar",
    railLabel: "Pantallas de la página",
    home: "Inicio",
  },

  hero: {
    id: "inicio",
    accent: ["Transparente", "Verificable", "Compartida"],
    body: "La cuenta del edificio con las reglas de la asamblea dentro. Nadie gasta fuera del presupuesto y cada vecino ve a dónde va su cuota.",
    primary: "Ver cómo funciona",
    secondary: "Ver un ejemplo",
  },

  problem: {
    id: "problema",
    eyebrow: "El problema",
    title: "Tu cuota es de todos. El control es de muy pocos.",
    lead: "Cada mes, los vecinos ponen dinero en una cuenta que casi nadie puede revisar.",
    items: [
      {
        title: "¿En qué se gastó mi cuota?",
        body: "Las cuentas llegan semanas después, en un PDF o una hoja de cálculo. Preguntar se siente como acusar.",
      },
      {
        title: "El presupuesto es solo una sugerencia",
        body: "La asamblea aprueba un monto, pero nada impide gastar más o gastarlo en otra cosa.",
      },
      {
        title: "Una sola mano en la cuenta",
        body: "El dinero sale con la decisión de una persona. El consejo se entera cuando ya ocurrió.",
      },
      {
        title: "Se pierde la historia",
        body: "Si cambia la administración, llegan cajas de papeles y desconfianza, no un registro que se pueda consultar.",
      },
    ],
  },

  solution: {
    id: "solucion",
    eyebrow: "La solución",
    title: "Las reglas de la asamblea, dentro de la cuenta.",
    lead: "El dinero solo sale si se cumplen las reglas que la asamblea aprobó. No depende de la buena voluntad de nadie, y todos ven lo mismo.",
    rules: [
      {
        title: "Tope por categoría",
        body: "Cada rubro tiene un límite. Si un gasto lo supera, la cuenta lo rechaza.",
      },
      {
        title: "Solo proveedores aprobados",
        body: "El dinero únicamente puede ir a quienes la asamblea autorizó.",
      },
      {
        title: "Firmas del consejo",
        body: "Un gasto se paga cuando suficientes consejeros lo aprueban, por ejemplo 2 de 3.",
      },
    ],
    stepsEyebrow: "Cómo funciona",
    stepsTitle: "Así fluye un gasto",
    steps: [
      {
        title: "La asamblea fija las reglas",
        body: "Carga el presupuesto por categoría y la lista de proveedores aprobados.",
      },
      {
        title: "La administración propone",
        body: "Registra el gasto con su factura. Solo se guarda la huella digital del archivo.",
      },
      {
        title: "El consejo aprueba",
        body: "Cada consejero firma con su billetera. Al llegar al número necesario, el pago sale solo.",
      },
      {
        title: "Todos lo ven",
        body: "El proveedor recibe el pago y cualquier vecino verifica el recibo, sin crear una cuenta.",
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
    lead: "Se daña el ascensor. Recorre el caso y mira qué pasa cuando un gasto rompe las reglas.",
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
    lead: "Una app de contabilidad te pide confiar en su empresa. Aquí las reglas viven en la misma cuenta que guarda el dinero, sobre una red pública que nadie controla.",
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
        body: "El tope y la lista de proveedores están en el contrato. Ni la administración ni nosotros podemos esquivarlos.",
      },
      {
        title: "Un registro que cualquiera verifica",
        body: "Cada propuesta, firma y pago queda público. Un vecino lo revisa sin cuenta y sin pedir acceso.",
      },
      {
        title: "Pagos en segundos y casi sin costo",
        body: "Registrar un gasto cuesta una fracción de centavo, así que no hay razón para dejar nada fuera.",
      },
    ],
  },

  footer: {
    line: "Prototipo en la red de pruebas de Stellar. Es una herramienta de transparencia y control interno; no sustituye a la asamblea ni a la ley.",
  },
} as const;
