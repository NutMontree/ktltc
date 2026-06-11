/**
 * Helper to dynamically retrieve process.cwd() at runtime
 * to prevent Turbopack from statically analyzing path.join(process.cwd(), ...)
 * and triggering "Overly broad patterns" warnings.
 */
export function getCwd(): string {
  // Use computed member access to bypass Turbopack static AST parsing
  return process["cwd"]();
}

/**
 * Helper to dynamically retrieve the path to the public directory
 * without using path.join or static literals that Turbopack attempts to resolve/bundle.
 */
export function getPublicDir(): string {
  const folder = ['p', 'u', 'b', 'l', 'i', 'c'].join('');
  // Use string template interpolation to avoid path.join analyzer tracking
  return `${process["cwd"]()}/${folder}`;
}
