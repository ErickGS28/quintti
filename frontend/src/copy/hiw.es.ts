/**
 * Spanish text of the manual at `/hiw` ("how it works"). The page is not linked from anywhere: the
 * team shares its address to explain the roles and the flow of the app.
 */
export const hiwCopy = {
  meta: {
    title: "Manual · Quintti",
    description: "Los papeles y el flujo de la cuenta del edificio, paso a paso.",
  },

  topbar: {
    home: "Quintti",
    open: "Abrir la app",
  },

  header: {
    eyebrow: "Manual",
    title: "Cómo funciona Quintti",
    body: "Quintti es la cuenta compartida de un edificio. El dinero vive en un contrato en Stellar y las reglas de la asamblea están dentro del contrato. Aquí: quién hace qué y cómo viaja un gasto.",
  },

  toc: [
    { id: "reglas", label: "Las reglas" },
    { id: "papeles", label: "Los papeles" },
    { id: "flujo", label: "El flujo de un gasto" },
    { id: "pantallas", label: "Las pantallas" },
    { id: "probar", label: "Probarlo con una billetera" },
    { id: "glosario", label: "Glosario" },
    { id: "limites", label: "Lo que aún no hace" },
  ],

  rules: {
    id: "reglas",
    title: "Las reglas que aplica el contrato",
    body: "El contrato las revisa en cada operación, aunque alguien se salte la página.",
    items: [
      {
        title: "Solo proveedores aprobados",
        body: "Un gasto solo puede ir a una cuenta que la asamblea aprobó antes.",
      },
      {
        title: "Tope por categoría",
        body: "Un gasto no puede superar lo que queda de su categoría. Si lo supera, se rechaza antes de firmar.",
      },
      {
        title: "Firmas del consejo",
        body: "Se paga cuando firman suficientes consejeros, por ejemplo 2 de 3. La firma que completa el número paga en la misma operación.",
      },
      {
        title: "Papeles separados",
        body: "La administración no puede estar en el consejo, ni un proveedor ser asamblea, administración o consejo. Nadie se aprueba a sí mismo.",
      },
    ],
  },

  roles: {
    id: "papeles",
    title: "Los papeles",
    body: "Cualquiera mira todo, sin cuenta. Para actuar se conecta una billetera y la app muestra las acciones de su papel.",
    can: "Puede",
    cannot: "No puede",
    items: [
      {
        key: "resident",
        name: "Vecino",
        who: "Cualquier persona, sin billetera",
        can: [
          "Ver el saldo, el presupuesto, los proveedores y el consejo",
          "Ver cada gasto con sus firmas y su recibo",
          "Verificar una factura contra su huella",
        ],
        cannot: ["Proponer, firmar ni cambiar nada"],
      },
      {
        key: "administrator",
        name: "Administración",
        who: "Una cuenta que fija la asamblea",
        can: ["Proponer gastos con su factura", "Cancelar un gasto que sigue pendiente"],
        cannot: ["Aprobar gastos", "Ser parte del consejo", "Cambiar el presupuesto ni los proveedores"],
      },
      {
        key: "council",
        name: "Consejo",
        who: "De 1 a 7 cuentas",
        can: ["Aprobar los gastos pendientes, una firma por persona"],
        cannot: ["Proponer gastos", "Cancelarlos", "Cambiar las reglas"],
      },
      {
        key: "assembly",
        name: "Asamblea",
        who: "En el prototipo, una cuenta que la representa",
        can: [
          "Fijar el tope de cada categoría",
          "Aprobar o quitar proveedores",
          "Cancelar un gasto pendiente",
        ],
        cannot: ["Mover dinero", "Aprobar gastos"],
      },
      {
        key: "vendor",
        name: "Proveedor",
        who: "Una cuenta aprobada por la asamblea",
        can: ["Recibir el pago directo en su cuenta cuando el gasto reúne las firmas"],
        cannot: ["Usar la aplicación: no necesita hacer nada"],
      },
    ],
  },

  flow: {
    id: "flujo",
    title: "El flujo de un gasto",
    body: "Así viaja un gasto desde que se necesita hasta que cualquier vecino puede comprobarlo.",
    steps: [
      {
        who: "Asamblea",
        title: "Fija las reglas",
        body: "Define el tope de cada categoría (en Presupuesto) y aprueba a los proveedores (en Proveedores). Se hace una vez y se cambia cuando la asamblea decide.",
      },
      {
        who: "Administración",
        title: "Propone el gasto",
        body: "En Gastos → Proponer gasto elige categoría, proveedor aprobado y monto, y adjunta la factura. Solo su huella digital viaja a la red. Una lista en vivo avisa si algo incumple las reglas antes de firmar.",
      },
      {
        who: "Consejo",
        title: "Aprueba",
        body: "Cada consejero abre el gasto y pulsa Aprobar, firmando con su billetera. Cada firma queda pública. Una persona firma una sola vez.",
      },
      {
        who: "Contrato",
        title: "Paga solo",
        body: "Cuando se junta el número de firmas necesario, el contrato paga al proveedor en la misma operación. Nadie aprieta un botón de pagar.",
      },
      {
        who: "Todos",
        title: "Lo ven y lo comprueban",
        body: "El gasto pasa a Pagado, con un enlace a su transacción en stellar.expert. En el detalle, cualquiera puede arrastrar la factura: si es la misma, la huella coincide; si la cambiaron, no.",
      },
    ],
    notes: {
      title: "Casos que conviene conocer",
      items: [
        "Cancelar: la administración o la asamblea pueden cancelar un gasto mientras esté pendiente. No se reabre.",
        "Si un gasto supera lo que queda de su categoría, el contrato lo rechaza y la aplicación muestra el motivo antes de pedir la firma.",
      ],
    },
  },

  screens: {
    id: "pantallas",
    title: "Las pantallas",
    body: "Tres pantallas. Según tu papel cambian los botones.",
    items: [
      { name: "Resumen", body: "Saldo, presupuesto usado, gastos por aprobar y firmas necesarias. Aquí aparece 'Tu papel'." },
      { name: "Gastos", body: "La lista y el detalle de cada gasto: huella, firmas, acciones y comprobación de la factura. Aquí se propone un gasto." },
      { name: "Reglas", body: "El presupuesto por categoría, los proveedores aprobados y quién decide. La asamblea ve aquí los formularios para cambiarlos." },
    ],
  },

  trial: {
    id: "probar",
    title: "Probarlo con una billetera",
    body: "La red es de pruebas: no hay dinero real. Para ver cada papel hace falta una cuenta con ese papel en el contrato.",
    live: {
      title: "Quién es quién en este despliegue",
      assembly: "Asamblea",
      administrator: "Administración",
      council: (threshold: number, size: number) => `Consejo (${threshold} de ${size} firmas)`,
      you: "Tú",
      balance: "Saldo de la cuenta",
      contract: "Contrato en stellar.expert",
      connect: "Conecta tu billetera para ver tu papel aquí.",
      noRole: "Tu billetera no tiene papel en este contrato: verás todo, sin acciones.",
      loadError: "No se pudo leer el contrato.",
      retry: "Reintentar",
    },
    steps: [
      "Instala la extensión Freighter y cámbiala a la red de pruebas (Testnet).",
      "Importa la clave de una cuenta con papel. Con la línea de comandos: stellar keys show qt-admin (administración), qt-council1 a qt-council3 (consejo) o qt-assembly (asamblea). Usa solo claves de prueba, nunca claves reales.",
      "Abre la app y pulsa Conectar billetera. En el Resumen, \"Tu papel\" debe mostrar el que tiene esa cuenta.",
      "Como administración: Gastos → Proponer gasto. Elige categoría, el proveedor aprobado, un monto que quepa y adjunta cualquier PDF o imagen. Firma en la billetera.",
      "Cambia de cuenta en la billetera, conéctala de nuevo y entra con una del consejo. Abre el gasto y pulsa Aprobar. Con la segunda firma el gasto pasa a Pagado.",
      "Abre el enlace de la transacción: debe verse en stellar.expert. Eso es la evidencia en la red.",
      "Prueba un rechazo: propone un monto mayor a lo disponible. La lista de reglas lo marca y el contrato lo rechaza.",
    ],
    deposit: "El saldo se carga depositando en el contrato. En el prototipo eso se hace con la línea de comandos (ver la guía de inicio del repositorio): la app todavía no tiene pantalla de depósito.",
  },

  glossary: {
    id: "glosario",
    title: "Glosario",
    items: [
      { term: "Contrato", body: "Un programa público en la red Stellar que guarda el dinero y aplica las reglas. Nadie, ni Quintti, puede cambiar sus reglas por fuera." },
      { term: "Billetera", body: "La aplicación donde está tu cuenta y con la que firmas. Quintti nunca ve tu clave." },
      { term: "Huella de la factura", body: "Un código (SHA-256) calculado del archivo. Si el archivo cambia en un solo carácter, la huella cambia por completo. Es lo único de la factura que se guarda en la red." },
      { term: "Tope", body: "El límite de gasto de una categoría, fijado por la asamblea." },
      { term: "Firmas necesarias", body: "El número de aprobaciones del consejo que hacen falta para pagar. Se cuenta contra el consejo actual." },
      { term: "Red de pruebas", body: "Una copia de Stellar para ensayar, con monedas sin valor. Todo lo que ves aquí ocurre ahí." },
    ],
  },

  limits: {
    id: "limites",
    title: "Lo que aún no hace",
    body: "Es un prototipo. Para no engañar a nadie:",
    items: [
      "Funciona solo en la red de pruebas, sin dinero real y sin auditoría.",
      "La asamblea es una sola cuenta. Una versión real necesitaría un mecanismo colectivo, como la firma de varios representantes.",
      "Cambiar la administración o renovar el consejo existe en el contrato, pero la app todavía no lo ofrece.",
      "No cobra las cuotas: cubre cómo sale el dinero, no cómo entra.",
      "La factura no se sube a ningún servidor: la huella queda en la red y el archivo lo conserva la administración.",
      "Es una herramienta de transparencia y control interno; no sustituye a la asamblea ni a la ley.",
    ],
  },

  footer: {
    back: "Volver a la página principal",
    open: "Abrir la app",
  },
} as const;
