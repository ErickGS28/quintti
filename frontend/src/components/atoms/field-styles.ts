/**
 * The look shared by every text control: a white surface, a hairline ring that turns purple on
 * focus and wine when the value is invalid. Tall enough for a comfortable touch target.
 */
export const FIELD =
  "w-full rounded-control bg-cloud px-4 text-base text-ink shadow-[0_1px_2px_rgb(69_37_162/0.05)] ring-1 ring-hairline-strong transition-shadow duration-200 outline-none placeholder:text-ink-faint focus:ring-2 focus:ring-royal disabled:cursor-not-allowed disabled:bg-mist disabled:text-ink-faint aria-invalid:ring-2 aria-invalid:ring-wine";
