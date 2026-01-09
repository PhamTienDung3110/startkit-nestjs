/**
 * Authentication Service
 * File này chứa business logic cho authentication
 * Service layer - xử lý logic nghiệp vụ, không liên quan đến HTTP
 */
import crypto from 'crypto';
import { prisma } from '../../db/prisma';
import { env } from '../../config/env';
import { hashPassword, comparePassword } from '../../utils/password';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../../utils/jwt';

/**
 * Hash refresh token bằng SHA256 trước khi lưu vào database
 * Mục đích: Bảo mật - nếu database bị leak, attacker không thể dùng token trực tiếp
 * 
 * @param token - Refresh token cần hash
 * @returns SHA256 hash của token
 */
const hashToken = (token: string) => crypto.createHash('sha256').update(token).digest('hex');

/**
 * Parse duration string (như "7d", "15m") thành milliseconds
 * Hỗ trợ các đơn vị: s (seconds), m (minutes), h (hours), d (days)
 * 
 * @param v - Duration string (ví dụ: "7d", "15m", "1h")
 * @returns Số milliseconds tương ứng, mặc định 7 ngày nếu parse fail
 */
function parseDurationToMs(v: string) {
  const m = /^(\d+)([smhd])$/.exec(v);
  if (!m) return 7 * 24 * 60 * 60 * 1000; // Default: 7 days
  const n = Number(m[1]); // Số lượng
  const unit = m[2]; // Đơn vị (s, m, h, d)
  const map: Record<string, number> = { s: 1000, m: 60e3, h: 3600e3, d: 86400e3 };
  return n * map[unit];
}

export const AuthService = {
  /**
   * Đăng ký user mới
   * 
   * @param email - Email của user (phải unique)
   * @param password - Plain password (sẽ được hash)
   * @param name - Tên của user (optional)
   * @returns User object (không có password)
   * @throws Error('EMAIL_EXISTS') nếu email đã tồn tại
   */
  async register(email: string, password: string, name?: string) {
    // Kiểm tra email đã tồn tại chưa
    const exists = await prisma.user.findUnique({ where: { email } });
    if (exists) throw new Error('EMAIL_EXISTS');

    // Tạo user mới với password đã được hash
    // Role mặc định là USER
    const user = await prisma.user.create({
      data: { 
        email, 
        password: await hashPassword(password), // Hash password trước khi lưu
        name, 
        role: 'USER' 
      },
      // Chỉ select các field cần thiết, không trả về password
      select: { id: true, email: true, name: true, role: true },
    });
    return user;
  },

  /**
   * Đăng nhập user
   * 
   * @param email - Email của user
   * @param password - Plain password để verify
   * @param meta - Metadata từ request (IP, User-Agent) để tracking
   * @returns Object chứa accessToken và refreshToken
   * @throws Error('INVALID_CREDENTIALS') nếu email hoặc password không đúng
   */
  async login(email: string, password: string, meta?: { ip?: string; userAgent?: string }) {
    // Tìm user theo email
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) throw new Error('INVALID_CREDENTIALS');

    // Verify password
    const ok = await comparePassword(password, user.password);
    if (!ok) throw new Error('INVALID_CREDENTIALS');

    // Tạo JWT payload (chứa user id và role)
    const payload = { sub: user.id, role: user.role } as const;

    // Tạo access token (short-lived) và refresh token (long-lived)
    const accessToken = signAccessToken(payload);
    const refreshToken = signRefreshToken(payload);

    // Lưu refresh token vào database (đã hash) để quản lý session
    // Kèm theo metadata để tracking
    await prisma.refreshToken.create({
      data: {
        tokenHash: hashToken(refreshToken), // Hash token trước khi lưu
        userId: user.id,
        ip: meta?.ip, // IP address của client
        userAgent: meta?.userAgent, // User agent string
        expiresAt: new Date(Date.now() + parseDurationToMs(env.JWT_REFRESH_EXPIRES)), // Thời gian hết hạn
      },
    });

    return { accessToken, refreshToken };
  },

  /**
   * Làm mới access token bằng refresh token (Token Rotation)
   * Mỗi lần refresh, tạo token mới và xóa token cũ để tăng bảo mật
   * 
   * @param refreshToken - Refresh token hiện tại
   * @returns Object chứa accessToken và refreshToken mới
   * @throws Error('REFRESH_REVOKED') nếu token không tồn tại trong DB (đã bị revoke)
   * @throws Error('REFRESH_EXPIRED') nếu token đã hết hạn
   */
  async refresh(refreshToken: string) {
    // Verify refresh token (kiểm tra signature và expiration)
    const payload = verifyRefreshToken(refreshToken);

    // Tìm refresh token trong database (so sánh hash)
    const row = await prisma.refreshToken.findFirst({
      where: { 
        tokenHash: hashToken(refreshToken), // So sánh hash
        userId: payload.sub // Đảm bảo token thuộc về user đúng
      },
    });
    // Nếu không tìm thấy trong DB, token đã bị revoke (logout hoặc bị xóa)
    if (!row) throw new Error('REFRESH_REVOKED');
    // Kiểm tra token đã hết hạn chưa
    if (row.expiresAt.getTime() < Date.now()) throw new Error('REFRESH_EXPIRED');

    // Tạo tokens mới
    const newAccessToken = signAccessToken({ sub: payload.sub, role: payload.role });
    const newRefreshToken = signRefreshToken({ sub: payload.sub, role: payload.role });

    // Token rotation: Xóa token cũ và tạo token mới trong một transaction
    // Đảm bảo atomicity - hoặc cả hai thành công, hoặc cả hai fail
    await prisma.$transaction([
      // Xóa refresh token cũ
      prisma.refreshToken.delete({ where: { id: row.id } }),
      // Tạo refresh token mới
      prisma.refreshToken.create({
        data: {
          tokenHash: hashToken(newRefreshToken),
          userId: payload.sub,
          expiresAt: new Date(Date.now() + parseDurationToMs(env.JWT_REFRESH_EXPIRES)),
        },
      }),
    ]);

    return { accessToken: newAccessToken, refreshToken: newRefreshToken };
  },

  /**
   * Đăng xuất - Revoke refresh token
   * Xóa refresh token khỏi database để không thể sử dụng lại
   * 
   * @param refreshToken - Refresh token cần revoke
   */
  async logout(refreshToken: string) {
    // Xóa refresh token khỏi database (tìm bằng hash)
    await prisma.refreshToken.deleteMany({ where: { tokenHash: hashToken(refreshToken) } });
  },
};
