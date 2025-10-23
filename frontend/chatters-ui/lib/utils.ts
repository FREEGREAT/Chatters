export function cn(...classes: (string | boolean | undefined | null | { [key: string]: boolean })[]) {
  return classes.filter(Boolean).join(" ");
}