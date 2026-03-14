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
        <label className="mb-1.5 block text-sm font-medium text-slate-700" htmlFor="email">
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
        <label className="mb-1.5 block text-sm font-medium text-slate-700" htmlFor="password">
          Password
        </label>
        <div className="relative">
          <input
            id="password"
            type="password"
            {...register("password")}
            className="ui-input pr-28"
          />
          <Link
            href="/forgot-password"
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-[#0d5c7b] hover:underline"
          >
            Forgot?
          </Link>
        </div>
        {errors.password ? (
          <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
        ) : null}
      </div>

      {errors.root?.message ? <p className="text-sm text-red-600">{errors.root.message}</p> : null}

      <button
        type="submit"
        disabled={isSubmitting}
        className="ui-button-primary w-full py-3 text-[15px]"
      >
        {isSubmitting ? "Signing in..." : "Sign in"}
      </button>

      <p className="text-center text-sm text-slate-500">
        No account?{" "}
        <Link href="/signup" className="font-semibold text-[#0d5c7b] hover:underline">
          Create one
        </Link>
      </p>
    </form>
  );
}
