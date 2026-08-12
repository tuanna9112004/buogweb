import { NextRequest, NextResponse } from 'next/server';
import { authenticateAdmin, setAdminSessionCookie } from '@/lib/auth/session';
import { LoginSchema } from '@/lib/validation/schemas';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = LoginSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Dữ liệu nhập không hợp lệ', details: parsed.error.format() },
        { status: 400 }
      );
    }

    const { username, password } = parsed.data;
    const isValid = await authenticateAdmin(username, password);

    if (!isValid) {
      return NextResponse.json(
        { error: 'Tên đăng nhập hoặc mật khẩu không chính xác' },
        { status: 401 }
      );
    }

    await setAdminSessionCookie(username);
    return NextResponse.json({ success: true, message: 'Đăng nhập thành công' });
  } catch (error: any) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Đã xảy ra lỗi khi đăng nhập' }, { status: 500 });
  }
}
