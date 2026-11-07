/** Decorative wash behind the top of a page. Sits behind everything and ignores the pointer. */
export function PageWash() {
  return <div aria-hidden="true" className="page-wash pointer-events-none absolute inset-x-0 top-0 -z-10 h-[60rem]" />;
}
