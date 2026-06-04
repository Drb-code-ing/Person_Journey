/**
 * 文件上传工具
 *
 * 处理 FormData 文件验证、存储路径生成、文件保存。
 */

import { mkdir, writeFile } from 'fs/promises';
import { join } from 'path';
import { randomUUID } from 'crypto';
import { Errors } from './error-handler';

/** 允许的文件类型配置 */
const ALLOWED_TYPES = {
  avatar: {
    mimeTypes: ['image/png', 'image/jpeg', 'image/webp'],
    maxSize: 5 * 1024 * 1024, // 5MB
    dir: 'avatars',
  },
  image: {
    mimeTypes: ['image/png', 'image/jpeg', 'image/webp'],
    maxSize: 10 * 1024 * 1024, // 10MB
    dir: 'images',
  },
  document: {
    mimeTypes: ['application/pdf', 'text/plain'],
    maxSize: 20 * 1024 * 1024, // 20MB
    dir: 'documents',
  },
} as const;

export type FileType = keyof typeof ALLOWED_TYPES;

export interface UploadResult {
  storedName: string;
  filePath: string;
  fileUrl: string;
  fileSize: number;
  mimeType: string;
  originalName: string;
}

/**
 * 处理文件上传
 * @param formData - 请求的 FormData
 * @param type - 文件类型 (avatar | image | document)
 * @returns UploadResult
 */
export async function processUpload(formData: FormData, type: FileType): Promise<UploadResult> {
  const config = ALLOWED_TYPES[type];
  if (!config) {
    throw Errors.validation('不支持的文件类型');
  }

  const file = formData.get('file');
  if (!file || !(file instanceof File)) {
    throw Errors.validation('请选择文件', 'file');
  }

  // 验证 MIME 类型
  if (!config.mimeTypes.includes(file.type as never)) {
    throw Errors.uploadTypeNotAllowed();
  }

  // 验证文件大小
  if (file.size > config.maxSize) {
    throw Errors.uploadTooLarge(Math.round(config.maxSize / 1024 / 1024));
  }

  // 生成存储路径
  const ext = file.name.split('.').pop() || 'bin';
  const storedName = `${randomUUID()}.${ext}`;
  const uploadDir = join(process.cwd(), 'public', 'uploads', config.dir);
  const filePath = join(uploadDir, storedName);

  // 确保目录存在
  await mkdir(uploadDir, { recursive: true });

  // 写入文件
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(filePath, buffer);

  // 返回访问 URL
  const fileUrl = `/uploads/${config.dir}/${storedName}`;

  return {
    storedName,
    filePath,
    fileUrl,
    fileSize: file.size,
    mimeType: file.type,
    originalName: file.name,
  };
}
