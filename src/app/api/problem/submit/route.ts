import { NextRequest, NextResponse } from "next/server";



export async function POST(request: NextRequest,){
    try {
        const data = request.body;
        
    } catch (error) {
        return NextResponse.json(error);
    }
}