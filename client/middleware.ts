import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
//  import { getAuth } from './store'
// This function can be marked `async` if using `await` inside
export function middleware(request: NextRequest) {
  // const checkAuth = getAuth();
  // if(checkAuth === null){
    // return NextResponse.redirect(new URL('/login', request.url))
  // }
  console.log('request :>> ', request.cookies);
}
 
// See "Matching Paths" below to learn more
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}