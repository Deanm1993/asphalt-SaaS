import { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";

import { createClient } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { InfoIcon, CalculatorIcon, MapPinIcon, TruckIcon, AlertTriangleIcon, HardHatIcon } from "lucide-react";

import { JobBasicInfoForm } from "@/features/job-scoping/job-basic-info-form";
import { JobSiteForm } from "@/features/job-scoping/job-site-form";
import { JobAreaForm } from "@/features/job-scoping/job-area-form";
import { JobMaterialsForm } from "@/features/job-scoping/job-materials-form";
import { JobHazardsForm } from "@/features/job-scoping/job-hazards-form";
import { JobEquipmentForm } from "@/features/job-scoping/job-equipment-form";
import { JobSummary } from "@/features/job-scoping/job-summary";

export const metadata: Metadata = {
  title: "New Job | Viable",
  description: "Create a new asphalt job with detailed scoping",
};

export default async function NewJobPage() {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);
  
  // Check authentication and get user info
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    redirect("/login");
  }
  
  // Get user's tenant information
  const { data: userData } = await supabase
    .from("users")
    .select("tenant_id, first_name, last_name")
    .eq("id", user.id)
    .single();
  
  if (!userData) {
    return <div>User profile not found</div>;
  }
  
  const tenantId = userData.tenant_id;
  
  // Fetch customers for dropdown
  const { data: customers } = await supabase
    .from("customers")
    .select("id, business_name, trading_name, abn")
    .eq("tenant_id", tenantId)
    .eq("is_active", true)
    .order("business_name");
  
  // Fetch sites for dropdown
  const { data: sites } = await supabase
    .from("job_sites")
    .select("id, name, address_line1, suburb, state, postcode")
    .eq("tenant_id", tenantId)
    .order("name");
  
  // Generate next job number (format: J-YYYYMMDD-XXX)
  const today = new Date();
  const dateStr = today.toISOString().slice(0, 10).replace(/-/g, "");
  
  const { data: lastJob } = await supabase
    .from("jobs")
    .select("job_number")
    .eq("tenant_id", tenantId)
    .like("job_number", `J-${dateStr}-%`)
    .order("job_number", { ascending: false })
    .limit(1)
    .single();
  
  let nextJobNumber = `J-${dateStr}-001`;
  
  if (lastJob) {
    const lastSequence = parseInt(lastJob.job_number.split("-")[2]);
    const nextSequence = lastSequence + 1;
    nextJobNumber = `J-${dateStr}-${nextSequence.toString().padStart(3, "0")}`;
  }

  return (
    <div className="container py-6">
      <div className="mb-6">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href="/dashboard/jobs">Jobs</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink>New Job</BreadcrumbLink>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        
        <div className="flex flex-col gap-1 mt-4">
          <h1 className="text-3xl font-bold tracking-tight">New Job</h1>
          <p className="text-muted-foreground">
            Create a new asphalt job with detailed scoping
          </p>
        </div>
      </div>
      
      <Alert className="mb-6">
        <InfoIcon className="h-4 w-4" />
        <AlertTitle>Quick Tip</AlertTitle>
        <AlertDescription>
          Complete all sections for accurate tonnage calculations and resource planning. You can save as draft at any time.
        </AlertDescription>
      </Alert>
      
      <Tabs defaultValue="basic-info" className="w-full">
        <div className="mb-6 overflow-auto">
          <TabsList className="w-full justify-start">
            <TabsTrigger value="basic-info" className="flex items-center gap-2">
              <InfoIcon className="h-4 w-4" />
              <span>Basic Info</span>
            </TabsTrigger>
            <TabsTrigger value="site" className="flex items-center gap-2">
              <MapPinIcon className="h-4 w-4" />
              <span>Site Details</span>
            </TabsTrigger>
            <TabsTrigger value="area" className="flex items-center gap-2">
              <CalculatorIcon className="h-4 w-4" />
              <span>Area & Tonnage</span>
            </TabsTrigger>
            <TabsTrigger value="materials" className="flex items-center gap-2">
              <TruckIcon className="h-4 w-4" />
              <span>Materials</span>
            </TabsTrigger>
            <TabsTrigger value="hazards" className="flex items-center gap-2">
              <AlertTriangleIcon className="h-4 w-4" />
              <span>Hazards</span>
            </TabsTrigger>
            <TabsTrigger value="equipment" className="flex items-center gap-2">
              <HardHatIcon className="h-4 w-4" />
              <span>Equipment</span>
            </TabsTrigger>
            <TabsTrigger value="summary" className="flex items-center gap-2">
              <InfoIcon className="h-4 w-4" />
              <span>Summary</span>
            </TabsTrigger>
          </TabsList>
        </div>
        
        <Card>
          <CardContent className="pt-6">
            <TabsContent value="basic-info">
              <JobBasicInfoForm 
                nextJobNumber={nextJobNumber}
                customers={customers || []}
                userId={user.id}
                tenantId={tenantId}
                userName={`${userData.first_name} ${userData.last_name}`}
              />
            </TabsContent>
            
            <TabsContent value="site">
              <JobSiteForm 
                sites={sites || []}
                tenantId={tenantId}
              />
            </TabsContent>
            
            <TabsContent value="area">
              <JobAreaForm />
            </TabsContent>
            
            <TabsContent value="materials">
              <JobMaterialsForm />
            </TabsContent>
            
            <TabsContent value="hazards">
              <JobHazardsForm />
            </TabsContent>
            
            <TabsContent value="equipment">
              <JobEquipmentForm />
            </TabsContent>
            
            <TabsContent value="summary">
              <JobSummary />
            </TabsContent>
          </CardContent>
        </Card>
      </Tabs>
      
      <div className="mt-6 flex justify-between">
        <Button variant="outline" asChild>
          <Link href="/dashboard/jobs">Cancel</Link>
        </Button>
        
        <div className="flex gap-2">
          <Button variant="outline" type="button" form="current-job-form" name="action" value="save_draft">
            Save as Draft
          </Button>
          <Button type="submit" form="current-job-form">
            Continue
          </Button>
        </div>
      </div>
    </div>
  );
}
