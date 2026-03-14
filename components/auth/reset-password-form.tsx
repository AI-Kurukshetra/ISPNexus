"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { resetPasswordFormSchema } from "@/lib/validations/auth.schema";

type ResetPasswordValues = z.infer<typeof resetPasswordFormSchema>;

export function ResetPasswordForm({ token }: { token: string }) {
  const router = useRouter();
  const [message, setMessage] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordValues>({
    resolver: zodResolver(resetPasswordFormSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    setMessage(null);

    if (!token) {
      setError("root", {
        message: "Missing reset token",
      });
      return;
    }

    try {
      const response = await fetch("/api/auth/password/reset", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token,
          password: values.password,
        }),
      });

      let payload: { error?: string } = {};
      try {
        payload = (await response.json()) as { error?: string };
      } catch {
        payload = {};
      }

      if (!response.ok) {
        setError("root", {
          message: payload.error ?? "Unable to reset password",
        });
        return;
      }

      setMessage("Password updated. Redirecting to sign in...");
      setTimeout(() => {
        router.push("/login");
        router.refresh();
      }, 900);
    } catch {
      setError("root", {
        message: "Network error. Please try again.",
      });
    }
  });

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="password">
          New Password
        </label>
        <input
          id="password"
          type="password"
          {...register("password")}
          className="ui-input"
        />
        {errors.password ? (
          <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
        ) : null}
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="confirmPassword">
          Confirm New Password
        </label>
        <input
          id="confirmPassword"
          type="password"
          {...register("confirmPassword")}
          className="ui-input"
        />
        {errors.confirmPassword ? (
          <p className="mt-1 text-sm text-red-600">{errors.confirmPassword.message}</p>
        ) : null}
      </div>

      {errors.root?.message ? <p className="text-sm text-red-600">{errors.root.message}</p> : null}
      {message ? <p className="text-sm text-emerald-700">{message}</p> : null}

      <button
        type="submit"
        disabled={isSubmitting}
        className="ui-button-primary w-full"
      >
        {isSubmitting ? "Resetting password..." : "Reset password"}
      </button>

      <p className="text-sm text-slate-600">
        Back to{" "}
        <Link href="/login" className="font-semibold text-[var(--brand-primary)] hover:underline">
          Sign in
        </Link>
      </p>
    </form>
  );
}
