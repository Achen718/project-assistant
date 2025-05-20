import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  console.log('Test API /api/test GET handler was hit!');
  return NextResponse.json({
    message: 'Test API endpoint reached successfully',
  });
}

export async function POST(request: NextRequest) {
  console.log('Test API /api/test POST handler was hit!');
  return NextResponse.json({
    message: 'Test API POST endpoint reached successfully',
  });
}
