const fs = require('fs');
const path = 'd:/ktltc/public/attendance_photos/1777590205497-9mmqpr129.blob';

try {
    if (fs.existsSync(path)) {
        fs.unlinkSync(path);
        console.log(`Successfully deleted: ${path}`);
    } else {
        console.log(`File not found: ${path}`);
    }
} catch (err) {
    console.error(`Error deleting file: ${err.message}`);
}
