import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function logActivity(data: {
  userId: string;
  action: string;
  resourceId?: string;
  details?: any;
  ipAddress?: string;
  userAgent?: string;
}) {
  try {
    await prisma.activityLog.create({
      data: {
        userId: data.userId,
        action: data.action,
        resourceId: data.resourceId,
        details: data.details ? JSON.parse(JSON.stringify(data.details)) : undefined,
        ipAddress: data.ipAddress,
        userAgent: data.userAgent,
      },
    });
    
    return true;
  } catch (error) {
    console.error('Error logging activity:', error);
    return false;
  }
} 