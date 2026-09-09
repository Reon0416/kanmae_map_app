import { z } from "zod";

const safeRedirectPathSchema = z.string().refine((value) => value.startsWith("/") && !value.startsWith("//"), {
  message: "Invalid redirect path"
});

export const authRedirectSchema = z.object({
  redirectTo: safeRedirectPathSchema.default("/my")
});

export const signupRequestSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(8),
  displayName: z.string().trim().max(40).optional(),
  redirectTo: safeRedirectPathSchema.default("/my")
});

export const loginRequestSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(1),
  redirectTo: safeRedirectPathSchema.default("/my")
});

export type AuthApiResponse =
  | {
      ok: true;
      status: "signed_in";
      redirectTo: string;
      role: "user" | "store" | "admin";
    }
  | {
      ok: true;
      status: "confirmation_required";
      message: string;
    }
  | {
      ok: false;
      status: "failed" | "rate_limited" | "invalid_request";
      message: string;
    };
