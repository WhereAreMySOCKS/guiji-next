import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const locales = ['zh', 'en']
const defaultLocale = 'zh'

// 这里是关键修复：将导出的函数名从 middleware 改为 proxy
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // 1. 检查路径是否已经包含语言
  const pathnameHasLocale = locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  )
  if (pathnameHasLocale) return

  // 2. 智能嗅探
  let targetLocale = defaultLocale
  const acceptLanguage = request.headers.get('accept-language')
  if (acceptLanguage && acceptLanguage.includes('en')) {
    targetLocale = 'en'
  }

  const country = request.headers.get('cf-ipcountry')
  const zhCountries = ['CN', 'TW', 'HK', 'MO', 'SG']
  if (country) {
      if (!zhCountries.includes(country)) {
          targetLocale = 'en'
      } else {
          targetLocale = 'zh'
      }
  }

  // 3. 重定向
  request.nextUrl.pathname = `/${targetLocale}${pathname}`
  return NextResponse.redirect(request.nextUrl)
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\.).*)'],
}
