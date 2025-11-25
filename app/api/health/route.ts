import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
    try {
        // Basic health check
        const health = {
            status: 'ok',
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
            version: process.env.VERSION || 'unknown',
            revision: process.env.REVISION || 'unknown',
            environment: process.env.NODE_ENV || 'development',
            services: {
                database: await checkDatabase(),
                ai: await checkAIService(),
            }
        }

        return NextResponse.json(health, { status: 200 })
    } catch (error) {
        return NextResponse.json(
            {
                status: 'error',
                message: 'Health check failed',
                timestamp: new Date().toISOString()
            },
            { status: 500 }
        )
    }
}

async function checkDatabase(): Promise<string> {
    try {
        // Add your database health check here
        // For example, if using Prisma:
        // const result = await prisma.$queryRaw`SELECT 1`
        return 'ok'
    } catch (error) {
        return 'error'
    }
}

async function checkAIService(): Promise<string> {
    try {
        // Add your AI service health check here
        // For example, check if OpenAI API key is configured:
        return process.env.OPENAI_API_KEY ? 'ok' : 'not_configured'
    } catch (error) {
        return 'error'
    }
}