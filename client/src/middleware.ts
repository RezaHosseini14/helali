import { NextRequest, NextResponse } from 'next/server';

export default async function middleware(req: NextRequest) {
  const url = req.url;
  const accessToken = req.cookies.get('accessToken');

  if (accessToken?.value) {
    if (url.includes('/login')) {
      return NextResponse.redirect('http://localhost:3001/dashboard');
    }
  }

  if (!accessToken?.value) {
    if (url.includes('/dashboard')) {
      return NextResponse.redirect('http://localhost:3001/login');
    }
  }
}

export const config = {
  matcher: ['/login', '/dashboard/:path*'],
};

// import { NextRequest, NextResponse } from 'next/server';

// export default async function middleware(req: NextRequest) {
//   const url = req.url;
//   const accessToken = req.cookies.get('accessToken');

//   const loginUrl = `${process.env.NEXT_PUBLIC_URL}/login`;
//   const dashboardUrl = `${process.env.NEXT_PUBLIC_URL}/dashboard`;
//   console.log(accessToken?.value);

//   if (accessToken?.value) {
//     if (url.includes('/login')) {
//       return NextResponse.redirect(dashboardUrl);
//     }
//   }

//   if (!accessToken?.value) {
//     if (url.includes('/dashboard')) {
//       return NextResponse.redirect(loginUrl);
//     }
//   }
// }

// export const config = {
//   matcher: ['/login', '/dashboard/:path*'],
// };
