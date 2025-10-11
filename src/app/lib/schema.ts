import {z} from "zod"

export const userSignInSchema = z.object({
    username : z.string().min(1,"username is required"),
    password : z.string().min(8, "Password should atleast 8 character")
    .regex(/[A-Z]/, "Must contain at least one uppercase letter")
    .regex(/[a-z]/, "Must contain at least one lowercase letter")
    .regex(/[0-9]/, "Must contain at least one number")
});

export const userSignUpSchema = z.object({
    username : z.string().min(1,"username is required"),
    password : z.string().min(8, "Password should atleast 8 character")
    .regex(/[A-Z]/, "Must contain at least one uppercase letter")
    .regex(/[a-z]/, "Must contain at least one lowercase letter")
    .regex(/[0-9]/, "Must contain at least one number"),
    confirmPassword : z.string(),
}).refine((data) => data.password===data.confirmPassword,{
    message: "Passwords don't match",
    path: ["confirmPassword"],
});