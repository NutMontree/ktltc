const fs = require('fs');
let data = fs.readFileSync('d:\\ktltc\\src\\components\\NavbarClient.tsx', 'utf8');

// Find the <nav className="..."> and <div absolute inset-0...><GlassSurface...><\/div>
const navStart = data.indexOf('<nav className="relative w-full max-w-[1600px]');
if (navStart !== -1) {
    const glassEnd = data.indexOf('</div>', data.indexOf('<GlassSurface', navStart)) + 6;
    
    if (glassEnd > navStart) {
        const replacement = `<nav \n        className="relative w-full max-w-[1600px] mx-auto bg-white/10 dark:bg-zinc-950/20 backdrop-blur-2xl shadow-[0_8px_32px_rgba(0,0,0,0.08)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.4)] rounded-[28px] border border-white/40 dark:border-zinc-800/60 py-2 px-4 sm:px-6 ring-1 ring-black/5 dark:ring-white/5 transition-all duration-300" \n        style={{ WebkitBackdropFilter: "blur(40px)" }}\n      >`;
        
        data = data.substring(0, navStart) + replacement + data.substring(glassEnd);
        fs.writeFileSync('d:\\ktltc\\src\\components\\NavbarClient.tsx', data, 'utf8');
        console.log("REPLACED");
    } else {
        console.log("GLASS_NOT_FOUND");
    }
} else {
    console.log("NAV_NOT_FOUND");
}
