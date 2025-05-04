import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { users } from '@/lib/db/schema'
import { hash } from 'bcryptjs'
import { generateMfaSecret } from '@/lib/auth'
import { sql } from 'drizzle-orm'

export async function POST(request: Request) {
  try {
    const { email, password, name } = await request.json()

    // 1. 이메일 중복 확인
    const existingUser = await db.select().from(users).where(sql`${users.email} = ${email}`)

    if (existingUser.length > 0) {
      return NextResponse.json(
        { error: '이미 존재하는 이메일입니다.' },
        { status: 400 }
      )
    }

    // 2. 비밀번호 해시화
    const hashedPassword = await hash(password, 12)

    // 3. 2FA 시크릿 생성
    const mfaSecret = generateMfaSecret()

    // 4. 관리자 계정 생성
    const [adminUser] = await db.insert(users).values({
      email,
      password: hashedPassword,
      name,
      role: 'admin',
      mfaEnabled: true,
      mfaSecret
    }).returning()

    // 5. 민감한 정보 제외하고 응답
    const { password: _, mfaSecret: __, ...safeUser } = adminUser

    return NextResponse.json({
      message: '관리자 계정이 생성되었습니다.',
      user: safeUser,
      mfaSecret // 2FA 설정을 위해 일회성으로 시크릿 반환
    })

  } catch (error) {
    console.error('관리자 계정 생성 중 오류:', error)
    return NextResponse.json(
      { 
        error: '관리자 계정 생성 중 오류가 발생했습니다.',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
} 