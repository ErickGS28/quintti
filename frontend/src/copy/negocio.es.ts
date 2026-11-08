/**
 * Spanish text of the business model and roadmap page (`/negocio`). Every figure here is an
 * assumption to validate with administrators, and the page says so. The numbers are kept as numbers
 * so a test can check the arithmetic behind the sentences.
 */

/** The example behind the pricing: a building of 40 apartments, a monthly fee, a price per apartment. */
export const PRICING_EXAMPLE = {
  apartments: 40,
  monthlyFee: 300_000,
  pricePerApartment: 2_000,
} as const;

const pesos = (amount: number) => `$${amount.toLocaleString("es-CO")}`;

const monthlyMoved = PRICING_EXAMPLE.apartments * PRICING_EXAMPLE.monthlyFee;
const monthlyPrice = PRICING_EXAMPLE.apartments * PRICING_EXAMPLE.pricePerApartment;

export const negocioCopy = {
  meta: {
    title: "Modelo de negocio y plan a futuro · Quintti",
    description: "Cómo se sostiene Quintti y cómo seguimos el producto después del hackathon.",
  },

  nav: {
    label: "Secciones",
    model: "Modelo",
    income: "Ingresos",
    plan: "Plan",
    steps: "Seguimiento",
    rail: "Pantallas de la página",
  },

  model: {
    id: "modelo",
    eyebrow: "Modelo de negocio",
    title: "Una suscripción pequeña por vigilar mucho dinero.",
    lead: "El dinero no pasa por nosotros: vive en el contrato del edificio. Cobramos el servicio, no la custodia.",
    moved: {
      label: "Lo que mueve un edificio",
      value: `${pesos(monthlyMoved)} al mes`,
      detail: `${PRICING_EXAMPLE.apartments} apartamentos × cuota de ${pesos(PRICING_EXAMPLE.monthlyFee)}`,
    },
    share: "menos del 1 %",
    price: {
      label: "Lo que cuesta Quintti",
      value: `${pesos(monthlyPrice)} al mes`,
      detail: `${pesos(PRICING_EXAMPLE.pricePerApartment)} por apartamento`,
    },
    note: "Precio de ejemplo, por validar con administradores.",
  },

  income: {
    id: "ingresos",
    eyebrow: "De dónde viene el ingreso",
    title: "Tres fuentes, de la más cercana a la más ambiciosa.",
    items: [
      {
        when: "Primero",
        title: "Suscripción por edificio",
        body: "Una cuota mensual según el número de apartamentos. La paga el edificio, por decisión de su asamblea.",
      },
      {
        when: "Después",
        title: "Plan para administradoras",
        body: "Una empresa que maneja varios edificios paga por volumen y los ve todos en un solo lugar.",
      },
      {
        when: "Más adelante",
        title: "Servicios sobre el recaudo",
        body: "Cobrar las cuotas con un servicio local de transferencias y entregar reportes para auditorías. Comisión por uso.",
      },
    ],
    why: {
      title: "Por qué Stellar lo hace viable",
      body: "Registrar un gasto cuesta una fracción de centavo, no hay servidores que custodien fondos y el dinero se mueve en dólares digitales. Cada edificio suma un contrato y pagos recurrentes en la red.",
    },
  },

  plan: {
    id: "plan",
    eyebrow: "Plan a futuro",
    title: "Del prototipo a un piloto real, paso a paso.",
    lead: "Cada paso se apoya en el anterior y se puede medir. Los plazos son estimados.",
    steps: [
      {
        horizon: "2 semanas",
        title: "Validar",
        body: "Entrevistas con administradores y consejos. Ajustar el producto con lo que digan.",
      },
      {
        horizon: "1 a 2 meses",
        title: "Piloto",
        body: "Un edificio real en la red de pruebas, con sus reglas y sus proveedores.",
      },
      {
        horizon: "2 a 4 meses",
        title: "Completar",
        body: "Cobro de cuotas, USDC en vez de XLM, aviso a los vecinos y una asamblea que firme con varios representantes.",
      },
      {
        horizon: "4 a 6 meses",
        title: "Producción",
        body: "Auditoría del contrato, revisión legal de la Ley 675 de 2001 y el primer edificio con dinero real.",
      },
    ],
  },

  follow: {
    id: "seguimiento",
    eyebrow: "Seguimiento",
    title: "Qué hacemos primero y cómo sabremos que funciona.",
    first: {
      title: "Primeros 30 días",
      items: [
        "Hablar con 5 administradores y 3 consejos.",
        "Probar la app con un edificio real en la red de pruebas.",
        "Ver si proponen y aprueban un gasto sin ayuda.",
      ],
    },
    measure: {
      title: "Cómo lo medimos",
      items: [
        "Edificios activos.",
        "Gastos aprobados por mes.",
        "Tiempo entre la propuesta y el pago.",
        "Vecinos que consultan la cuenta.",
      ],
    },
    today: "Hoy: contrato probado, app funcionando en la red de pruebas y demo grabada. Lo siguiente es validar con quien lo va a usar.",
  },
} as const;
