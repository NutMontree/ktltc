import SuveryList from '@/components/SuveryList';
import Link from 'next/link';
export const dynamic = 'force-dynamic';

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
// const NEXT_PUBLIC_BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

const getsuverys = async () => {
    try {
        // *** 2. ใช้ BASE_URL + Relative Path เพื่อให้ทำงานบน Dev ได้ ***
        const apiUrl = `${BASE_URL}/api/suvery`;

        console.log(`📡 Fetching data from: ${apiUrl}`); // Debug URL

        const res = await fetch(apiUrl, {
            cache: 'no-store'
        });

        if (!res.ok) {
            const errorBody = await res.text();
            throw new Error(`Failed to fetch data: ${res.status} ${res.statusText}. Response body: ${errorBody}`);
        }
        return res.json();
    } catch (error) {
        console.error("❌ Error loading suvery:", (error as Error).message);
        return { suverys: [] };
    }
}

export default async function EmploymentDashboard() {
    const suverysData = await getsuverys();
    let suverys = suverysData?.suverys || [];

    // 💡 การแก้ไข: เรียงลำดับข้อมูลจากใหม่ไปเก่า (โดยใช้ reverse)
    if (suverys.length > 0) {
        // การใช้ .reverse() จะกลับลำดับของ Array ซึ่งถ้า API ดึงข้อมูลเก่ามาใหม่
        // การ reverse() จะทำให้ข้อมูลใหม่ขึ้นไปอยู่ข้างบนสุด
        suverys = suverys.reverse();
    }

    return (
        <div className="min-h-screen bg-white/50 py-16 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto space-y-12">

                <div className="flex justify-between items-center pb-6 border-b border-gray-100">
                    <h1 className="text-4xl font-extrabold text-violet-800 tracking-tight flex items-center">
                        <svg className="w-9 h-9 mr-3 text-violet-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19V6l12-3v14M9 19h12M9 19c-1.333 0-2-1.333-2-2 0-1.333 0-2 2-2M21 5c-1.333 0-2-1.333-2-2 0-1.333 0-2 2-2"></path></svg>
                        Dashboard ข้อมูลแบบสำรวจ
                    </h1>
                    <Link
                        href="/suvery"
                        className="inline-flex items-center px-6 py-3 border border-transparent text-base font-semibold rounded-xl shadow-lg text-white bg-violet-600 hover:bg-violet-700 focus:outline-none focus:ring-4 focus:ring-offset-2 focus:ring-violet-500 transition duration-300 transform hover:scale-[1.02] active:scale-[0.98] drop-shadow-md"
                    >
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
                        กรอกแบบสำรวจใหม่
                    </Link>
                </div>

                <div className=" ">
                    <h2 className="text-3xl font-bold text-gray-900 mb-8 border-b border-violet-100 pb-4">
                        รายการข้อมูลที่ถูกบันทึก
                    </h2>
                    {suverys && suverys.length > 0 ? (
                        // ส่งข้อมูลที่ถูก reverse แล้วไปยัง SuveryList
                        <SuveryList suverys={suverys} isLoading={false} isError={false} />
                    ) : (
                        <div className="p-12 text-center bg-violet-50/50 border-2 border-dashed border-violet-300 rounded-xl transition duration-500 hover:border-violet-500 shadow-inner">
                            <svg className="mx-auto h-14 w-14 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true"><path vectorEffect="non-scaling-stroke" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 13h6m-3-3v6m-9 1-2 2V5a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path></svg>
                            <h3 className="mt-4 text-xl font-semibold text-gray-900">ยังไม่มีข้อมูลแบบสำรวจ</h3>
                            <p className="mt-2 text-base text-gray-600">
                                ลองเพิ่มข้อมูลแบบสำรวจใหม่เพื่อเริ่มต้นใช้งาน
                            </p>
                            <div className="mt-8">
                                <Link
                                    href="/suvery"
                                    className="inline-flex items-center px-6 py-3 border border-violet-500 text-base font-medium rounded-full shadow-sm text-violet-600 bg-white hover:bg-violet-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500 transition duration-300 hover:shadow-md"
                                >
                                    กรอกข้อมูลแบบสำรวจ
                                </Link>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}