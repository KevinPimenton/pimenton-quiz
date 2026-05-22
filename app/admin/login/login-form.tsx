"use client";

import { useActionState, useEffect } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signInAction, type AuthActionState } from "./actions";

const INITIAL_STATE: AuthActionState = {
  error: null,
  fieldErrors: null,
  success: false,
};

export function LoginForm() {
  const [state, action, isPending] = useActionState(signInAction, INITIAL_STATE);

  useEffect(() => {
    if (state.error) toast.error(state.error);
  }, [state]);

  return (
    <form action={action} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="signin-email" className="font-display">
          Email
        </Label>
        <Input
          id="signin-email"
          name="email"
          type="email"
          autoComplete="email"
          required
          placeholder="kevin@pimenton.com"
          aria-invalid={!!state.fieldErrors?.email}
        />
        {state.fieldErrors?.email && (
          <p className="text-sm text-destructive">{state.fieldErrors.email}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="signin-password" className="font-display">
          Contraseña
        </Label>
        <Input
          id="signin-password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          aria-invalid={!!state.fieldErrors?.password}
        />
        {state.fieldErrors?.password && (
          <p className="text-sm text-destructive">{state.fieldErrors.password}</p>
        )}
      </div>

      <Button
        type="submit"
        disabled={isPending}
        className="w-full font-display font-semibold rounded-button bg-terracotta hover:bg-terracotta-600 text-cream"
      >
        {isPending ? "Ingresando..." : "Ingresar"}
      </Button>
    </form>
  );
}
