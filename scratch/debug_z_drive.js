const fs = require('fs');
const path = require('path');

const target = "Z:/";
console.log(`--- Checking access to ${target} ---`);

try {
    if (fs.existsSync(target)) {
        console.log(`✅ Drive ${target} exists.`);
        const files = fs.readdirSync(target);
        console.log(`📁 Files/Folders found: ${files.join(', ')}`);
        
        if (fs.statfsSync) {
            const stats = fs.statfsSync(target);
            console.log(`📊 Stats:`, {
                blocks: stats.blocks,
                bsize: stats.bsize,
                free: stats.bfree,
                totalMB: Math.round((stats.blocks * stats.bsize) / (1024 * 1024))
            });
        } else {
            console.log("❌ statfsSync is not available in this Node.js version.");
        }
    } else {
        console.log(`❌ Drive ${target} NOT found or NOT accessible by Node.js.`);
    }
} catch (err) {
    console.error(`❌ Error: ${err.message}`);
}
