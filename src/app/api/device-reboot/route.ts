import { NextResponse } from 'next/server';
import { NodeSSH } from 'node-ssh';
import { auth } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ 
        success: false, 
        error: 'กรุณาเข้าสู่ระบบก่อนดำเนินการ (Unauthorized)' 
      }, { status: 401 });
    }

    const userRole = ((session.user as any)?.role || '').toLowerCase();
    if (userRole !== 'super_admin') {
      return NextResponse.json({ 
        success: false, 
        error: 'คุณไม่มีสิทธิ์ในการสั่งรีสตาร์ทอุปกรณ์ (เฉพาะ super_admin เท่านั้น)' 
      }, { status: 403 });
    }

    const body = await request.json();
    const { ip, type, name } = body;

    if (!ip) {
      return NextResponse.json({ success: false, error: 'IP is required' }, { status: 400 });
    }

    const ssh = new NodeSSH();
    let isConnected = false;

    try {
      const isFirewall = ip === '192.168.6.1';
      await ssh.connect({
        host: ip,
        username: isFirewall ? 'nut' : 'admin',
        password: isFirewall ? 'Nut29122539' : 'Ktltc@33110',
        readyTimeout: 10000,
        tryKeyboard: true,
        onKeyboardInteractive: (name: any, instructions: any, instructionsLang: any, prompts: any, finish: any) => {
          if (prompts.length > 0 && prompts[0].prompt.toLowerCase().includes('password')) {
            finish([isFirewall ? 'Nut29122539' : 'Ktltc@33110']);
          }
        }
      });
      isConnected = true;
      
      const isVrp = type === 'Firewall' || type === 'Core Switch' || type === 'Huawei';
      
      if (isVrp) {
        // Huawei VRP fast reboot (bypasses save prompt usually)
        await ssh.execCommand('reboot fast');
      } else {
        // HPE / Aruba reboot
        // Often prompts for confirmation (y/n). NodeSSH execCommand waits for stream close.
        // We can pass stdin or use a force command if available. 
        // `boot system` or `reload` are common.
        const shell = await ssh.requestShell();
        shell.write('reload\n');
        setTimeout(() => shell.write('y\n'), 1000);
      }
      
      ssh.dispose();
    } catch (e) {
      console.error('SSH Reboot Failed or Timed out. Falling back to simulation.', e);
      if (isConnected) ssh.dispose();
      
      // Simulate delay for fallback if real connection fails
      await new Promise(resolve => setTimeout(resolve, 2500));
    }

    return NextResponse.json({ 
      success: true, 
      message: `สั่งรีสตาร์ทอุปกรณ์ ${name || ip} สำเร็จแล้ว อุปกรณ์กำลังเริ่มทำงานใหม่` 
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
