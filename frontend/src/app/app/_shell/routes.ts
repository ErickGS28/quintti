/** Every app screen's address, in one place, so links never drift from the folders. */
export const appRoutes = {
  overview: "/app",
  expenses: "/app/gastos",
  expense: (id: number) => `/app/gastos/${id}`,
  propose: "/app/gastos/nuevo",
  rules: "/app/reglas",
} as const;