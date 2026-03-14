"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { requestResetSchema } from "@/lib/validations/auth.schema";

type ForgotPasswordValues = z.infer<typeof requestResetSchema>;

export function ForgotPasswordForm() {
  const [message, setMessage] = useState<string | null>(null);
  const [resetPath, setResetPath] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordValues>({
    resolver: zodResolver(requestResetSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    setMessage(null);
    setResetPath(null);

    try {
      const response = await fetch("/api/auth/password/request-reset", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: values.email,
        }),
      });

      let payload: { error?: string; message?: string; resetPath?: string } = {};
      try {
        payload = (await response.json()) as {
          error?: string;
          message?: string;
          resetPath?: string;
        };
      } catch {
        payload = {};
      }

      if (!response.ok) {
        setError("root", {
          message: payload.error ?? "Unable to create reset link",
        });
        return;
      }

      setMessage(payload.message ?? "If your account exists, a reset link has been generated.");
      setResetPath(payload.resetPath ?? null);
    } catch {
      setError("root", {
        message: "Network error. Please try again.",
      });
    }
  });

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="email">
          Email
        </label>
        <input
          id="email"
          type="email"
          {...register("email")}
          className="ui-input"
        />
        {errors.email ? <p className="mt-1 text-sm text-red-600">{errors.email.message}</p> : null}
      </div>

      {errors.root?.message ? <p className="text-sm text-red-600">{errors.root.message}</p> : null}
      {message ? <p className="text-sm text-emerald-700">{message}</p> : null}
      {resetPath ? (
        <p className="rounded-[18px] border border-emerald-200 bg-emerald-50/80 px-4 py-3 text-sm text-emerald-800">
          Demo reset link:{" "}
          <Link href={resetPath} className="underline">
            Open reset page
          </Link>
        </p>
      ) : null}

      <button
        type="submit"
        disabled={isSubmitting}
        className="ui-button-primary w-full"
      >
        {isSubmitting ? "Generating link..." : "Generate reset link"}
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
