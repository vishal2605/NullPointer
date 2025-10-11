import { NextRequest, NextResponse } from "next/server"
import { userSignUpSchema } from "@/app/lib/schema";
import bcrypt from "bcryptjs";
import { prisma } from "@/app/lib/db";


export async function POST(request:NextRequest) {
    try {
        const body = await request.json();
        const {username , password} = body;
        console.log(body);
        const validatedData = userSignUpSchema.safeParse({
            username : username,
            password : password,
            confirmPassword : body.confirm_password
        });
        if(!validatedData.success){
            const error = validatedData.error.issues.map(issue => issue.message).join(',')
            return NextResponse.json({
                message: error,
                status: 400
            });
        }
        const existingUser = await prisma.user.findFirst({
            where : {username}
        });
        if(existingUser){
            return NextResponse.json({
                message : "user already exist",
                status : 400
            })
        }
        console.log('hii');
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await prisma.user.create({
            data: {
                username: username,
                password: hashedPassword
            }
        });

        return NextResponse.json({
            message : "new user is created successfully",
            user: user,
            status : 201
        });

    } catch (error){
        console.log(error);
        return NextResponse.json(
            { error: error, },
            { status: 500 }
          );
    }
}