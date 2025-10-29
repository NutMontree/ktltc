// /lib/data.js (หรือที่ที่คุณสะดวก)
import Ticket from "@/app/models/Ticket";

export async function getAllTickets() {
    try {
        //   await connectToDb(); // ถ้าจำเป็นต้อง connect ทุกครั้ง
        const tickets = await Ticket.find();

        // สำคัญ: เรา return { tickets } เพื่อให้มีโครงสร้างเหมือน API เดิม
        return { tickets };
    } catch (error) {
        console.error("❌ Error fetching tickets directly:", error);
        // คืนค่าว่าง เพื่อให้หน้าเว็บไม่พัง
        return { tickets: [] };
    }
}