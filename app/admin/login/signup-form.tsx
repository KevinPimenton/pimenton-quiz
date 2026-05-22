"use client";

import { useActionState, useEffect } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signUpAction, type AuthActionState } from "./actions";

const INITIAL_STATE: AuthActionState = {
  error: null,
  fieldErrors: null,
  success: false,
};

export function SignupForm() {
  const [state, action, isPending] = useActionState(signUpAction, INITIAL_STATE);

  useEffect(() => {
    if (state.error) toast.error(state.error);
  }, [state]);

  return (
    <form action={action} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="signup-email" className="font-display">
          Email
        </Label>
        <Input
          id="signup-email"
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
        <Label htmlFor="signup-password" className="font-display">
          Contraseña
        </Label>
        <Input
          id="signup-password"
          name="password"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          aria-invalid={!!state.fieldErrors?.password}
        />
        {state.fieldErrors?.password && (
          <p className="text-sm text-destructive">{state.fieldErrors.password}</p>
        )}
        <p className="text-xs text-ink-soft">Mínimo 8 caracteres.</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="signup-confirm" className="font-display">
          Confirmar contraseña
        </Label>
        <Input
          id="signup-confirm"
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
          required
          aria-invalid={!!state.fieldErrors?.confirmPassword}
        />
        {state.fieldErrors?.confirmPassword && (
          <p className="text-sm text-destructive">
            {state.fieldErrors.confirmPassword}
          </p>
        )}
      </div>

      <Button
        type="submit"
        disabled={isPending}
        className="w-full font-display font-semibold rounded-button bg-terracotta hover:bg-terracotta-600 text-cream"
      >
        {isPending ? "Creando cuenta..." : "Registrarse"}
      </Button>
    </form>
  );
}
