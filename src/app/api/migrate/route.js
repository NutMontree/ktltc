// Migration script obsolete. Old models (Academic, Devdepartment, Resource) have been removed.
export async function GET() {
  return new Response("Obsolete", { status: 410 });
}
