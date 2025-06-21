import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  try {
    return NextResponse.json({
      status: 'success',
      message: 'AI API is working correctly',
      timestamp: new Date().toISOString(),
      features: {
        designSuggestions: 'Available',
        userProfileAnalysis: 'Available',
        inspirationAnalysis: 'Available',
        energyAnalysis: 'Available',
        imageGeneration: 'Available'
      }
    });
  } catch (error) {
    console.error('AI API test failed:', error);
    return NextResponse.json({
      status: 'error',
      error: error instanceof Error ? error.message : '未知错误',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { test, prompt = '你好，这是一个测试消息。' } = body;
    
    return NextResponse.json({
      status: 'success',
      test: test || 'basic',
      prompt,
      message: 'API endpoint is working correctly',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('AI API test failed:', error);
    return NextResponse.json({
      status: 'error',
      error: error instanceof Error ? error.message : '未知错误',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}