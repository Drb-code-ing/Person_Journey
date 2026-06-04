/**
 * 全局错误处理器
 *
 * 统一异常类型 + WithError 包装函数，所有 Controller 入口使用。
 */

import { NextResponse } from 'next/server';

export class AppError extends Error {
  constructor(
    public code: string,
    message: string,
    public statusCode: number = 500,
    public field?: string
  ) {
    super(message);
    this.name = 'AppError';
  }
}

/** 常用业务错误快速构造 */
export const Errors = {
  unauthorized: (msg = '未登录') => new AppError('AUTH_UNAUTHORIZED', msg, 401),
  forbidden: (msg = '无权限') => new AppError('AUTH_FORBIDDEN', msg, 403),
  invalidCredentials: () => new AppError('AUTH_INVALID_CREDENTIALS', '邮箱或密码错误', 401),
  tokenExpired: () => new AppError('AUTH_TOKEN_EXPIRED', '登录已过期，请重新登录', 401),
  userNotFound: () => new AppError('USER_NOT_FOUND', '用户不存在', 404),
  emailExists: () => new AppError('USER_EMAIL_EXISTS', '该邮箱已注册', 409),
  validation: (msg: string, field?: string) => new AppError('VALIDATION_ERROR', msg, 400, field),
  bookingNotFound: () => new AppError('BOOKING_NOT_FOUND', '订单不存在', 404),
  bookingDuplicate: () => new AppError('BOOKING_DUPLICATE', '重复提交', 409),
  bookingStatusInvalid: (msg: string) => new AppError('BOOKING_STATUS_INVALID', msg, 400),
  uploadTooLarge: (maxMB: number) => new AppError('UPLOAD_FILE_TOO_LARGE', `文件大小不能超过 ${maxMB}MB`, 413),
  uploadTypeNotAllowed: () => new AppError('UPLOAD_TYPE_NOT_ALLOWED', '不支持的文件类型', 400),
  internal: (msg = '服务器内部错误') => new AppError('INTERNAL_ERROR', msg, 500),
} as const;

/** 统一错误响应 */
export function errorResponse(error: unknown): NextResponse {
  if (error instanceof AppError) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: error.code,
          message: error.message,
          ...(error.field && { field: error.field }),
        },
      },
      { status: error.statusCode }
    );
  }

  // 处理 Prisma 错误
  if (error && typeof error === 'object' && 'code' in error) {
    const prismaError = error as { code: string; meta?: { target?: string[] } };
    if (prismaError.code === 'P2002') {
      const target = prismaError.meta?.target || [];
      if (target.includes('email')) return errorResponse(Errors.emailExists());
      if (target.includes('client_token')) return errorResponse(Errors.bookingDuplicate());
      return NextResponse.json(
        { success: false, error: { code: 'DUPLICATE_ENTRY', message: '数据已存在' } },
        { status: 409 }
      );
    }
  }

  console.error('[UNEXPECTED ERROR]', error);
  return NextResponse.json(
    {
      success: false,
      error: { code: 'INTERNAL_ERROR', message: '服务器内部错误' },
    },
    { status: 500 }
  );
}

/**
 * Controller 层错误包装器
 * 用法: export const GET = withErrorHandling(async (req) => { ... })
 */
export function withErrorHandling<T = unknown>(
  handler: (req: Request, ctx: T) => Promise<NextResponse>
) {
  return async (req: Request, ctx?: T): Promise<NextResponse> => {
    try {
      return await handler(req, ctx as T);
    } catch (error) {
      return errorResponse(error);
    }
  };
}
