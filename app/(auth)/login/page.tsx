import Link from "next/link";
import { Metadata } from "next";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";

import { createClient } from "@/lib/supabase";
import { ViableLogo } from "@/components/viable-logo";

export const metadata: Metadata = {
  title: "Login | Viable",
  description: "Login to your Viable account",
};

export default async function LoginPage() {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);
  
  // Check if user is already logged in
  const { data: { session } } = await supabase.auth.getSession();
  if (session) {
    redirect("/dashboard");
  }

  return (
    <div className="container relative flex min-h-screen flex-col items-center justify-center md:grid lg:max-w-none lg:grid-cols-2 lg:px-0">
      <div className="relative hidden h-full flex-col bg-muted p-10 text-white lg:flex dark:border-r">
        <div className="absolute inset-0 bg-asphalt" />
        <div className="relative z-20 flex items-center text-lg font-medium">
          <ViableLogo className="h-10 w-auto mr-2" />
          <span className="text-white text-xl font-semibold">Viable</span>
        </div>
        <div className="relative z-20 mt-auto">
          <blockquote className="space-y-2">
            <p className="text-lg">
              "Viable has saved our business over 15 hours a week in admin time and completely eliminated quote errors. The mobile interface is perfect for our crews in the field."
            </p>
            <footer className="text-sm">John Smith, Asphalt Solutions Sydney</footer>
          </blockquote>
        </div>
      </div>
      <div className="lg:p-8">
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
          <div className="flex flex-col space-y-2 text-center">
            <div className="flex justify-center mb-4 lg:hidden">
              <ViableLogo className="h-10 w-auto" />
            </div>
            <h1 className="text-2xl font-semibold tracking-tight">
              Welcome back
            </h1>
            <p className="text-sm text-muted-foreground">
              Enter your credentials to access your account
            </p>
          </div>

          <Tabs defaultValue="email" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="email">Email</TabsTrigger>
              <TabsTrigger value="magic-link">Magic Link</TabsTrigger>
            </TabsList>
            
            <TabsContent value="email">
              <Card>
                <CardHeader className="space-y-1">
                  <CardTitle className="text-xl">Email & Password</CardTitle>
                  <CardDescription>
                    Enter your email and password to sign in
                  </CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4">
                  <form action="/api/auth/login" method="POST">
                    <div className="grid gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          name="email"
                          placeholder="name@example.com.au"
                          type="email"
                          autoCapitalize="none"
                          autoComplete="email"
                          autoCorrect="off"
                          required
                        />
                      </div>
                      <div className="grid gap-2">
                        <div className="flex items-center justify-between">
                          <Label htmlFor="password">Password</Label>
                          <Link
                            href="/reset-password"
                            className="text-sm text-primary underline-offset-4 hover:underline"
                          >
                            Forgot password?
                          </Link>
                        </div>
                        <Input
                          id="password"
                          name="password"
                          type="password"
                          autoComplete="current-password"
                          required
                        />
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="remember" name="remember" />
                        <label
                          htmlFor="remember"
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          Remember me for 30 days
                        </label>
                      </div>
                      <Button type="submit" className="w-full">
                        Sign In
                      </Button>
                    </div>
                  </form>
                </CardContent>
                <CardFooter className="flex flex-col">
                  <div className="mt-2 text-center text-sm text-muted-foreground">
                    Don't have an account?{" "}
                    <Link
                      href="/register"
                      className="text-primary underline-offset-4 hover:underline"
                    >
                      Sign up
                    </Link>
                  </div>
                </CardFooter>
              </Card>
            </TabsContent>
            
            <TabsContent value="magic-link">
              <Card>
                <CardHeader className="space-y-1">
                  <CardTitle className="text-xl">Magic Link</CardTitle>
                  <CardDescription>
                    We'll email you a magic link for passwordless sign in
                  </CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4">
                  <form action="/api/auth/magic-link" method="POST">
                    <div className="grid gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="email-magic">Email</Label>
                        <Input
                          id="email-magic"
                          name="email"
                          placeholder="name@example.com.au"
                          type="email"
                          autoCapitalize="none"
                          autoComplete="email"
                          autoCorrect="off"
                          required
                        />
                      </div>
                      <Button type="submit" className="w-full">
                        Send Magic Link
                      </Button>
                    </div>
                  </form>
                </CardContent>
                <CardFooter className="flex flex-col">
                  <div className="mt-2 text-center text-sm text-muted-foreground">
                    Don't have an account?{" "}
                    <Link
                      href="/register"
                      className="text-primary underline-offset-4 hover:underline"
                    >
                      Sign up
                    </Link>
                  </div>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>

          <div className="px-8 text-center text-sm text-muted-foreground">
            By continuing, you agree to our{" "}
            <Link
              href="/terms"
              className="underline underline-offset-4 hover:text-primary"
            >
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link
              href="/privacy"
              className="underline underline-offset-4 hover:text-primary"
            >
              Privacy Policy
            </Link>
            .
          </div>
        </div>
      </div>
    </div>
  );
}
