// 文件路径必须是: src/middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const locales = ['zh', 'en']
const defaultLocale = 'zh'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  const pathnameHasLocale = locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  )
  if (pathnameHasLocale) return

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

  request.nextUrl.pathname = `/${targetLocale}${pathname}`
  return NextResponse.redirect(request.nextUrl)
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\.).*)'],
  runtime: 'experimental-edge', 
}