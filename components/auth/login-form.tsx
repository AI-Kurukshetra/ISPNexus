"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { signInSchema } from "@/lib/validations/auth.schema";

type LoginValues = z.infer<typeof signInSchema>;

export function LoginForm({ callbackUrl = "/dashboard" }: { callbackUrl?: string }) {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: "admin@ispnexus.demo",
      password: "Demo1234!",
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    const result = await signIn("credentials", {
      email: values.email,
      password: values.password,
      redirect: false,
      callbackUrl,
    });

    if (!result || result.error) {
      setError("root", {
        message: "Invalid credentials.",
      });
      return;
    }

    router.push(result.url ?? callbackUrl);
    router.refresh();
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

      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="password">
          Password
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

      {errors.root?.message ? <p className="text-sm text-red-600">{errors.root.message}</p> : null}

      <button
        type="submit"
        disabled={isSubmitting}
        className="ui-button-primary w-full"
      >
        {isSubmitting ? "Signing in..." : "Sign in"}
      </button>

      <div className="flex items-center justify-between text-sm">
        <Link href="/forgot-password" className="font-semibold text-[var(--brand-primary)] hover:underline">
          Forgot password?
        </Link>
        <Link href="/signup" className="font-semibold text-[var(--brand-primary)] hover:underline">
          Create account
        </Link>
      </div>
    </form>
  );
}
