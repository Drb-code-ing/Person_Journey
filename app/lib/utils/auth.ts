/**
 * JWT 认证中间件
 *
 * 从 request cookie 中提取 auth_token，验证 JWT，返回解码后的用户信息。
 * 所有需要登录的接口在开头调用 requireAuth(req)。
 */

import jwt from 'jsonwebtoken';
import { Errors } from './error-handler';

export interface AuthUser {
  userId: string;
  email: string;
}

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('JWT_SECRET environment variable is required');
  return secret;
}

/**
 * 从请求中提取并验证 JWT
 * @throws AppError 401 如果未登录或 token 无效
 */
export function requireAuth(request: Request): AuthUser {
  const cookieHeader = request.headers.get('cookie') || '';
  const tokenMatch = cookieHeader.match(/auth_token=([^;]+)/);
  const token = tokenMatch?.[1];

  if (!token) {
    throw Errors.unauthorized();
  }

  try {
    const decoded = jwt.verify(token, getJwtSecret()) as AuthUser;
    return decoded;
  } catch {
    throw Errors.tokenExpired();
  }
}

/**
 * 尝试提取用户信息，未登录返回 null（不抛异常）
 */
export function optionalAuth(request: Request): AuthUser | null {
  try {
    return requireAuth(request);
  } catch {
    return null;
  }
}

/** 生成 JWT token */
export function signToken(payload: AuthUser): string {
  return jwt.sign(payload, getJwtSecret(), { expiresIn: '7d' });
}
