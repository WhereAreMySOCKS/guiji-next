import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const locales = ['zh', 'en']
const defaultLocale = 'zh'

function detectLocale(request: NextRequest): string {
  let targetLocale = defaultLocale
  const acceptLanguage = request.headers.get('accept-language')
  if (acceptLanguage && acceptLanguage.includes('en')) {
    targetLocale = 'en'
  }

  const country = request.headers.get('cf-ipcountry')
  const zhCountries = ['CN', 'TW', 'HK', 'MO', 'SG']
  if (country) {
    targetLocale = zhCountries.includes(country) ? 'zh' : 'en'
  }

  return targetLocale
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  const pathnameHasLocale = locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  )

  let lang: string
  let response: NextResponse

  if (pathnameHasLocale) {
    lang = locales.find(
      (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
    ) || defaultLocale
    response = NextResponse.next()
  } else {
    lang = detectLocale(request)
    request.nextUrl.pathname = `/${lang}${pathname}`
    response = NextResponse.redirect(request.nextUrl)
  }

  response.cookies.set('lang', lang, { path: '/' })
  return response
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\.).*)'],
  runtime: 'experimental-edge', 
}