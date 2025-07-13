import { Metadata } from "next";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import Link from "next/link";

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ViableLogo } from "@/components/viable-logo";
import { createClient } from "@/lib/supabase";

export const metadata: Metadata = {
  title: "Register | Viable",
  description: "Create a new Viable account for your asphalt contracting business",
};

export default async function RegisterPage() {
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
              "Viable has transformed how we manage our asphalt operations. The job scoping calculator alone has saved us thousands by eliminating estimation errors."
            </p>
            <footer className="text-sm">Sarah Johnson, Roadworks Australia</footer>
          </blockquote>
        </div>
      </div>
      <div className="lg:p-8">
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[450px]">
          <div className="flex flex-col space-y-2 text-center">
            <div className="flex justify-center mb-4 lg:hidden">
              <ViableLogo className="h-10 w-auto" />
            </div>
            <h1 className="text-2xl font-semibold tracking-tight">
              Create your Viable account
            </h1>
            <p className="text-sm text-muted-foreground">
              Streamline your asphalt contracting operations
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Company & Account Details</CardTitle>
              <CardDescription>
                Enter your business information to get started
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form action="/api/auth/register" method="POST" className="space-y-6">
                {/* Step 1: Business Details */}
                <div className="space-y-4">
                  <h3 className="text-sm font-medium leading-none">Business Information</h3>
                  <Separator />
                  
                  <div className="grid gap-2">
                    <Label htmlFor="business_name">Business Name</Label>
                    <Input
                      id="business_name"
                      name="business_name"
                      placeholder="Your Company Pty Ltd"
                      required
                    />
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="abn">
                      ABN <span className="text-xs text-muted-foreground">(Australian Business Number)</span>
                    </Label>
                    <Input
                      id="abn"
                      name="abn"
                      placeholder="XX XXX XXX XXX"
                      className="abn-input"
                      required
                      pattern="^\d{2} \d{3} \d{3} \d{3}$"
                      title="ABN format: XX XXX XXX XXX"
                    />
                    <p className="text-xs text-muted-foreground">Format: XX XXX XXX XXX</p>
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="acn">
                      ACN <span className="text-xs text-muted-foreground">(Optional)</span>
                    </Label>
                    <Input
                      id="acn"
                      name="acn"
                      placeholder="XXX XXX XXX"
                    />
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="gst_registered">GST Registration</Label>
                    <Select name="gst_registered" defaultValue="true">
                      <SelectTrigger>
                        <SelectValue placeholder="Select GST status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="true">Registered for GST</SelectItem>
                        <SelectItem value="false">Not registered for GST</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                {/* Step 2: Address */}
                <div className="space-y-4">
                  <h3 className="text-sm font-medium leading-none">Business Address</h3>
                  <Separator />
                  
                  <div className="grid gap-2">
                    <Label htmlFor="address_line1">Street Address</Label>
                    <Input
                      id="address_line1"
                      name="address_line1"
                      placeholder="123 Main Street"
                      required
                    />
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="address_line2">
                      Address Line 2 <span className="text-xs text-muted-foreground">(Optional)</span>
                    </Label>
                    <Input
                      id="address_line2"
                      name="address_line2"
                      placeholder="Suite 101"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="suburb">Suburb</Label>
                      <Input
                        id="suburb"
                        name="suburb"
                        placeholder="Sydney"
                        required
                      />
                    </div>
                    
                    <div className="grid gap-2">
                      <Label htmlFor="state">State</Label>
                      <Select name="state" required>
                        <SelectTrigger>
                          <SelectValue placeholder="Select state" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="NSW">NSW</SelectItem>
                          <SelectItem value="VIC">VIC</SelectItem>
                          <SelectItem value="QLD">QLD</SelectItem>
                          <SelectItem value="SA">SA</SelectItem>
                          <SelectItem value="WA">WA</SelectItem>
                          <SelectItem value="TAS">TAS</SelectItem>
                          <SelectItem value="NT">NT</SelectItem>
                          <SelectItem value="ACT">ACT</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="postcode">Postcode</Label>
                    <Input
                      id="postcode"
                      name="postcode"
                      placeholder="2000"
                      maxLength={4}
                      pattern="^\d{4}$"
                      title="Australian postcodes are 4 digits"
                      required
                    />
                  </div>
                </div>
                
                {/* Step 3: Contact Details */}
                <div className="space-y-4">
                  <h3 className="text-sm font-medium leading-none">Contact Information</h3>
                  <Separator />
                  
                  <div className="grid gap-2">
                    <Label htmlFor="phone">Business Phone</Label>
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      placeholder="0412 345 678"
                    />
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="email">Business Email</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="info@yourcompany.com.au"
                      required
                    />
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="website">
                      Website <span className="text-xs text-muted-foreground">(Optional)</span>
                    </Label>
                    <Input
                      id="website"
                      name="website"
                      type="url"
                      placeholder="https://yourcompany.com.au"
                    />
                  </div>
                </div>
                
                {/* Step 4: Admin User Details */}
                <div className="space-y-4">
                  <h3 className="text-sm font-medium leading-none">Admin User Account</h3>
                  <Separator />
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="first_name">First Name</Label>
                      <Input
                        id="first_name"
                        name="first_name"
                        required
                      />
                    </div>
                    
                    <div className="grid gap-2">
                      <Label htmlFor="last_name">Last Name</Label>
                      <Input
                        id="last_name"
                        name="last_name"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="user_email">Email Address</Label>
                    <Input
                      id="user_email"
                      name="user_email"
                      type="email"
                      placeholder="you@example.com"
                      required
                    />
                    <p className="text-xs text-muted-foreground">This will be your login email</p>
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      minLength={8}
                      required
                    />
                    <p className="text-xs text-muted-foreground">Minimum 8 characters</p>
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="confirm_password">Confirm Password</Label>
                    <Input
                      id="confirm_password"
                      name="confirm_password"
                      type="password"
                      minLength={8}
                      required
                    />
                  </div>
                </div>
                
                {/* Terms and Conditions */}
                <div className="space-y-4">
                  <div className="flex items-start space-x-2">
                    <Checkbox id="terms" name="terms" required />
                    <div className="grid gap-1.5 leading-none">
                      <label
                        htmlFor="terms"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        Accept terms and conditions
                      </label>
                      <p className="text-xs text-muted-foreground">
                        By creating an account, you agree to our{" "}
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
                      </p>
                    </div>
                  </div>
                </div>
                
                <Button type="submit" className="w-full">
                  Create Account
                </Button>
              </form>
            </CardContent>
            <CardFooter className="flex justify-center">
              <div className="text-sm text-muted-foreground">
                Already have an account?{" "}
                <Link
                  href="/login"
                  className="text-primary underline-offset-4 hover:underline"
                >
                  Sign in
                </Link>
              </div>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
