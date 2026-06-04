/**
 * POST /api/users/me/avatar
 *
 * 头像上传接口 - 上传文件 + 更新用户头像字段
 */

import { prisma } from '../../../../lib/prisma';
import { requireAuth } from '../../../../lib/utils/auth';
import { withErrorHandling } from '../../../../lib/utils/error-handler';
import { successResponse } from '../../../../lib/utils/response';
import { processUpload } from '../../../../lib/utils/upload';

export const dynamic = 'force-dynamic';

export const POST = withErrorHandling(async (request: Request) => {
  const auth = requireAuth(request);

  const formData = await request.formData();
  const result = await processUpload(formData, 'avatar');

  // 更新用户 avatar 字段（存储访问 URL）
  await prisma.user.update({
    where: { id: auth.userId },
    data: { avatar: result.fileUrl },
  });

  return successResponse({
    avatarUrl: result.fileUrl,
    originalName: result.originalName,
    size: result.fileSize,
    mimeType: result.mimeType,
  }, '头像更新成功');
});
