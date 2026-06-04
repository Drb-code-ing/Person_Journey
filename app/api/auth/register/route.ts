/**
 * POST /api/auth/register
 *
 * 用户注册 - 创建账户 + 自动初始化关联记录
 * （user_profile、user_member 默认银卡、dimension_space 默认配置）
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('JWT_SECRET environment variable is required');
  return secret;
}

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { email, password, name, phone } = await request.json();

    // 验证
    if (!email || !password || !name) {
      return NextResponse.json({ success: false, error: '请填写所有必填项' }, { status: 400 });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ success: false, error: '邮箱格式不正确' }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ success: false, error: '密码至少6位' }, { status: 400 });
    }

    // 检查邮箱是否已注册
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ success: false, error: '该邮箱已注册' }, { status: 400 });
    }

    // 查找默认银卡等级
    const silverLevel = await prisma.memberLevel.findUnique({
      where: { levelCode: 'silver' },
      select: { id: true },
    });

    // 创建用户 + 关联记录（事务）
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.$transaction(async (tx) => {
      // 1. 创建用户账户
      const newUser = await tx.user.create({
        data: {
          email,
          password: hashedPassword,
          name,
        },
      });

      // 2. 创建用户资料
      await tx.userProfile.create({
        data: {
          userId: newUser.id,
          phone: phone || null,
        },
      });

      // 3. 创建会员关联（默认银卡）
      if (silverLevel) {
        await tx.userMember.create({
          data: {
            userId: newUser.id,
            levelId: silverLevel.id,
            totalSpend: 0,
            orderCount: 0,
          },
        });
      }

      // 4. 创建次元空间（默认配置）
      await tx.dimensionSpace.create({
        data: {
          userId: newUser.id,
          spaceName: '我的次元空间',
          theme: 'nebula',
        },
      });

      return newUser;
    });

    // 生成 JWT
    const token = jwt.sign({ userId: user.id, email: user.email }, getJwtSecret(), { expiresIn: '7d' });

    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        phone: phone || null,
        avatar: null,
      },
    });

    response.cookies.set('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Register error:', error);
    return NextResponse.json({ success: false, error: '注册失败' }, { status: 500 });
  }
}
