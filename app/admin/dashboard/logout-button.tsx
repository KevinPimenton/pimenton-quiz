"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { signOutAction } from "../login/actions";

export function LogoutButton() {
  const [isPending, startTransition] = useTransition();

  return (
    <Button
      variant="outline"
      size="sm"
      disabled={isPending}
      onClick={() =>
        startTransition(async () => {
          await signOutAction();
        })
      }
      className="font-display rounded-button border-terracotta/30 text-terracotta hover:bg-terracotta/10"
    >
      {isPending ? "Saliendo..." : "Cerrar sesión"}
    </Button>
  );
}
