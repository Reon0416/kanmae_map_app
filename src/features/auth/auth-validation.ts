import { z } from "zod";

const safeRedirectPathSchema = z.string().refine((value) => value.startsWith("/") && !value.startsWith("//"), {
  message: "Invalid redirect path"
});

export const authRedirectSchema = z.object({
  redirectTo: safeRedirectPathSchema.default("/")
});

export const signupRequestSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(8),
  displayName: z.string().trim().max(40).optional(),
  redirectTo: safeRedirectPathSchema.default("/")
});

export const loginRequestSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(1),
  redirectTo: safeRedirectPathSchema.default("/")
});

export type AuthApiResponse =
  | {
      ok: true;
      status: "signed_in";
      redirectTo: string;
      role: "user" | "store" | "admin";
    }
  | {
      ok: false;
      status: "failed" | "rate_limited" | "invalid_request";
      message: string;
    };
