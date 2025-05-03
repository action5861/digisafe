import { useSession } from 'next-auth/react';
import { useEffect } from 'react';
import { SessionProvider as NextAuthProvider } from 'next-auth/react';
import { logActivity } from '@/lib/activity-logger';

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();

  useEffect(() => {
    if (session?.user?.id) {
      // 로그인 시 활동 로그 기록
      logActivity({
        userId: session.user.id,
        action: 'LOGIN',
        details: {
          email: session.user.email
        }
      });
    }
  }, [session]);

  return (
    <NextAuthProvider>
      {children}
    </NextAuthProvider>
  );
} 