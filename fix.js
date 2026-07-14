const fs = require('fs');
let c = fs.readFileSync('src/app/dashboard/permissions/page.tsx', 'utf8');

c = c.replace(/className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-\[2.5rem\] shadow-xl overflow-hidden max-w-4xl"/g, 'className="w-full min-w-0 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-[2.5rem] shadow-xl overflow-hidden max-w-4xl"');

c = c.replace(/className="w-full overflow-x-auto overflow-y-auto max-h-\[70vh\]"/g, 'className="w-full max-w-full overflow-x-auto overflow-y-auto max-h-[70vh]"');
c = c.replace(/className="overflow-x-auto"/g, 'className="w-full max-w-full overflow-x-auto"');

// Ensure xl:col-span-12 doesn't bleed out of the grid. Oh wait, it is NOT in a grid!
// Let's add overflow-hidden to xl:col-span-12 just in case.
c = c.replace(/className="xl:col-span-12"/g, 'className="xl:col-span-12 w-full max-w-full overflow-hidden"');

fs.writeFileSync('src/app/dashboard/permissions/page.tsx', c);
console.log('Fixed');
