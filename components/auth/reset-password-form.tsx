"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2, Circle, Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";

import { resetPasswordFormSchema } from "@/lib/validations/auth.schema";

type ResetPasswordValues = z.infer<typeof resetPasswordFormSchema>;

const RULES = [
  { label: "At least 8 characters", test: (p: string) => p.length >= 8 },
  { label: "One uppercase letter (A–Z)", test: (p: string) => /[A-Z]/.test(p) },
  { label: "One lowercase letter (a–z)", test: (p: string) => /[a-z]/.test(p) },
  { label: "One number (0–9)", test: (p: string) => /\d/.test(p) },
  { label: "One special character (!@#…)", test: (p: string) => /[^A-Za-z0-9]/.test(p) },
] as const;

const STRENGTH = [
  { label: "Very weak", color: "bg-red-500" },
  { label: "Weak", color: "bg-red-400" },
  { label: "Fair", color: "bg-amber-400" },
  { label: "Good", color: "bg-emerald-400" },
  { label: "Strong", color: "bg-emerald-500" },
];

export function ResetPasswordForm({ token }: { token: string }) {
  const router = useRouter();
  const [message, setMessage] = useState<string | null>(null);
  const [showPw, setShowPw] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const {
    register,
    control,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordValues>({
    resolver: zodResolver(resetPasswordFormSchema),
    defaultValues: { password: "", confirmPassword: "" },
  });

  const password = useWatch({ control, name: "password", defaultValue: "" });
  const passedRules = RULES.map((r) => r.test(password));
  const score = passedRules.filter(Boolean).length;
  const strength = password.length > 0 ? STRENGTH[Math.max(0, score - 1)] : null;

  const onSubmit = handleSubmit(async (values) => {
    setMessage(null);

    if (!token) {
      setError("root", { message: "Missing reset token" });
      return;
    }

    try {
      const response = await fetch("/api/auth/password/reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password: values.password }),
      });

      let payload: { error?: string } = {};
      try {
        payload = (await response.json()) as { error?: string };
      } catch {
        payload = {};
      }

      if (!response.ok) {
        setError("root", { message: payload.error ?? "Unable to reset password" });
        return;
      }

      setMessage("Password updated. Redirecting to sign in...");
      setTimeout(() => {
        router.push("/login");
        router.refresh();
      }, 900);
    } catch {
      setError("root", { message: "Network error. Please try again." });
    }
  });

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {/* New password with strength UI */}
      <div>
        <label className="mb-1.5 block text-sm font-medium text-slate-700" htmlFor="password">
          New Password
        </label>
        <div className="relative">
          <input
            id="password"
            type={showPw ? "text" : "password"}
            {...register("password")}
            className="ui-input pr-11"
          />
          <button
            type="button"
            aria-label={showPw ? "Hide password" : "Show password"}
            onClick={() => setShowPw((v) => !v)}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
          >
            {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>

        {password.length > 0 && (
          <div className="mt-2.5 space-y-2">
            <div className="flex gap-1">
              {RULES.map((_, i) => (
                <div
                  key={i}
                  className={`h-1 flex-1 rounded-full transition-colors duration-300 ${i < score ? (strength?.color ?? "bg-slate-200") : "bg-slate-100"
                    }`}
                />
              ))}
            </div>

            {strength && (
              <p
                className={`text-xs font-semibold ${score <= 2 ? "text-red-500" : score === 3 ? "text-amber-500" : "text-emerald-600"
                  }`}
              >
                {strength.label} password
              </p>
            )}

            <ul className="space-y-1 pt-0.5">
              {RULES.map((rule, i) => (
                <li key={i} className="flex items-center gap-2 text-xs">
                  {passedRules[i] ? (
                    <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-500" />
                  ) : (
                    <Circle className="h-3.5 w-3.5 shrink-0 text-slate-300" />
                  )}
                  <span className={passedRules[i] ? "text-slate-500" : "text-slate-400"}>
                    {rule.label}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {errors.password && !password.length ? (
          <p className="mt-1 text-xs text-red-600">{errors.password.message}</p>
        ) : null}
      </div>

      {/* Confirm password */}
      <div>
        <label className="mb-1.5 block text-sm font-medium text-slate-700" htmlFor="confirmPassword">
          Confirm New Password
        </label>
        <div className="relative">
          <input
            id="confirmPassword"
            type={showConfirm ? "text" : "password"}
            {...register("confirmPassword")}
            className="ui-input pr-11"
          />
          <button
            type="button"
            aria-label={showConfirm ? "Hide password" : "Show password"}
            onClick={() => setShowConfirm((v) => !v)}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
          >
            {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        {errors.confirmPassword ? (
          <p className="mt-1 text-xs text-red-600">{errors.confirmPassword.message}</p>
        ) : null}
      </div>

      {errors.root?.message ? (
        <p className="text-xs text-red-600">{errors.root.message}</p>
      ) : null}
      {message ? (
        <p className="text-xs font-medium text-emerald-600">{message}</p>
      ) : null}

      <button
        type="submit"
        disabled={isSubmitting}
        className="ui-button-primary w-full py-3 text-[15px]"
      >
        {isSubmitting ? "Resetting password..." : "Reset password"}
      </button>

      <p className="text-center text-sm text-slate-500">
        Back to{" "}
        <Link href="/login" className="font-semibold text-[#0d5c7b] hover:underline">
          Sign in
        </Link>
      </p>
    </form>
  );
}
