import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET environment variable is required');
  }
  return secret;
}

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    // 验证
    if (!email || !password) {
      return NextResponse.json({ success: false, error: '请输入邮箱和密码' }, { status: 400 });
    }

    // 查找用户
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return NextResponse.json({ success: false, error: '邮箱或密码错误' }, { status: 401 });
    }

    // 验证密码
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return NextResponse.json({ success: false, error: '邮箱或密码错误' }, { status: 401 });
    }

    // 生成 JWT
    const token = jwt.sign({ userId: user.id, email: user.email }, getJwtSecret(), { expiresIn: '7d' });

    const userData = { id: user.id, email: user.email, name: user.name, phone: user.phone, avatar: user.avatar };

    const response = NextResponse.json({ success: true, user: userData });
    response.cookies.set('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60,
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ success: false, error: '登录失败' }, { status: 500 });
  }
}
