declare module "next/server" {
  export class NextResponse {
    static next(): Response
    static redirect(input: URL | string): Response
  }

  export interface NextURL {
    pathname: string
    clone(): URL
  }

  export interface NextCookie {
    name: string
    value: string
  }

  export interface NextCookies {
    get(name: string): NextCookie | undefined
  }

  export interface NextRequest extends Request {
    nextUrl: NextURL
    cookies: NextCookies
  }
}
