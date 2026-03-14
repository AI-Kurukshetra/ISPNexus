"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { MailCheck } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { requestResetSchema } from "@/lib/validations/auth.schema";

type ForgotPasswordValues = z.infer<typeof requestResetSchema>;

export function ForgotPasswordForm() {
  const [sent, setSent] = useState(false);
  const {
    register,
    handleSubmit,
    setError,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordValues>({
    resolver: zodResolver(requestResetSchema),
    defaultValues: { email: "" },
  });

  const onSubmit = handleSubmit(async (values) => {
    try {
      const response = await fetch("/api/auth/password/request-reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: values.email }),
      });

      let payload: { error?: string } = {};
      try {
        payload = (await response.json()) as { error?: string };
      } catch {
        payload = {};
      }

      if (!response.ok) {
        setError("root", { message: payload.error ?? "Unable to send reset email" });
        return;
      }

      setSent(true);
    } catch {
      setError("root", { message: "Network error. Please try again." });
    }
  });

  if (sent) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col items-center gap-4 rounded-2xl border border-emerald-100 bg-emerald-50 px-6 py-8 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100">
            <MailCheck className="h-7 w-7 text-emerald-600" />
          </div>
          <div>
            <p className="text-base font-semibold text-slate-900">Check your inbox</p>
            <p className="mt-1 text-sm text-slate-500">
              We sent a password reset link to{" "}
              <span className="font-medium text-slate-700">{getValues("email")}</span>.
              <br />
              It expires in 1 hour.
            </p>
          </div>
        </div>
        <p className="text-center text-sm text-slate-500">
          Didn&apos;t get it?{" "}
          <button
            type="button"
            className="font-semibold text-[#0d5c7b] hover:underline"
            onClick={() => setSent(false)}
          >
            Try again
          </button>
        </p>
        <p className="text-center text-sm text-slate-500">
          Back to{" "}
          <Link href="/login" className="font-semibold text-[#0d5c7b] hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label className="mb-1.5 block text-sm font-medium text-slate-700" htmlFor="email">
          Email address
        </label>
        <input
          id="email"
          type="email"
          placeholder="you@example.com"
          {...register("email")}
          className="ui-input"
        />
        {errors.email ? <p className="mt-1 text-xs text-red-600">{errors.email.message}</p> : null}
      </div>

      {errors.root?.message ? (
        <p className="text-xs text-red-600">{errors.root.message}</p>
      ) : null}

      <button
        type="submit"
        disabled={isSubmitting}
        className="ui-button-primary w-full py-3 text-[15px]"
      >
        {isSubmitting ? "Sending..." : "Send reset link"}
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

