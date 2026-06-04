/**
 * 统一响应体构造器
 *
 * 所有 API 接口返回此格式：
 * - successResponse<T>(data, message?, status?)
 * - paginatedResponse<T>(data, pagination, status?)
 */

import { NextResponse } from 'next/server';

interface Pagination {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

/** 成功响应 */
export function successResponse<T>(data: T, message?: string, status = 200): NextResponse {
  return NextResponse.json(
    {
      success: true,
      data,
      ...(message && { message }),
    },
    { status }
  );
}

/** 分页响应 */
export function paginatedResponse<T>(
  data: T[],
  pagination: Pagination,
  status = 200
): NextResponse {
  return NextResponse.json(
    {
      success: true,
      data,
      pagination,
    },
    { status }
  );
}

/** 计算分页元数据 */
export function buildPagination(page: number, pageSize: number, total: number) {
  const safePage = Math.max(1, page);
  const safePageSize = Math.min(Math.max(1, pageSize), 100);
  return {
    page: safePage,
    pageSize: safePageSize,
    total,
    totalPages: Math.ceil(total / safePageSize),
  };
}

/** 解析分页查询参数 */
export function parsePagination(searchParams: URLSearchParams) {
  const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10) || 1);
  const pageSize = Math.min(Math.max(1, parseInt(searchParams.get('pageSize') || '20', 10) || 20), 100);
  return { page, pageSize };
}
