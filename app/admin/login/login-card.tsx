"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { LoginForm } from "./login-form";
import { SignupForm } from "./signup-form";

export function LoginCard() {
  const [tab, setTab] = useState<"signin" | "signup">("signin");

  return (
    <Card className="rounded-card border-2 border-terracotta/15 shadow-sm bg-cream-50">
      <CardContent className="pt-6">
        <Tabs value={tab} onValueChange={(v) => setTab(v as "signin" | "signup")}>
          <TabsList className="grid w-full grid-cols-2 mb-6 bg-cream-100">
            <TabsTrigger
              value="signin"
              className="font-display data-[state=active]:bg-terracotta data-[state=active]:text-cream"
            >
              Ingresar
            </TabsTrigger>
            <TabsTrigger
              value="signup"
              className="font-display data-[state=active]:bg-terracotta data-[state=active]:text-cream"
            >
              Registrarse
            </TabsTrigger>
          </TabsList>
          <TabsContent value="signin">
            <LoginForm />
          </TabsContent>
          <TabsContent value="signup">
            <SignupForm />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
