import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format } from "date-fns";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon, InfoIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Tables } from "@/lib/database.types";
import { getBrowserClient } from "@/lib/supabase";

// Define the form schema with Zod
const jobBasicInfoSchema = z.object({
  job_number: z.string().min(1, "Job number is required"),
  title: z.string().min(3, "Job title must be at least 3 characters"),
  job_type: z.enum(["mill_and_fill", "resheet", "overlay", "patching", "full_reconstruction"], {
    required_error: "Please select a job type",
  }),
  customer_id: z.string().uuid().optional(),
  description: z.string().optional(),
  purchase_order_number: z.string().optional(),
  quote_number: z.string().optional(),
  quote_date: z.date().optional(),
  quote_expiry_date: z.date().optional(),
  is_night_shift: z.boolean().default(false),
  truck_access: z.enum(["truck_and_dog", "semi_trailer", "rigid_truck", "body_truck", "any"], {
    required_error: "Please select truck access type",
  }).default("any"),
  waste_factor: z.number().min(0).max(20).default(5),
});

type JobBasicInfoFormValues = z.infer<typeof jobBasicInfoSchema>;

interface JobBasicInfoFormProps {
  nextJobNumber: string;
  customers: Tables<"customers">[];
  userId: string;
  tenantId: string;
  userName: string;
}

export function JobBasicInfoForm({ 
  nextJobNumber, 
  customers, 
  userId, 
  tenantId, 
  userName 
}: JobBasicInfoFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Initialize form with default values
  const form = useForm<JobBasicInfoFormValues>({
    resolver: zodResolver(jobBasicInfoSchema),
    defaultValues: {
      job_number: nextJobNumber,
      title: "",
      job_type: "mill_and_fill",
      customer_id: undefined,
      description: "",
      purchase_order_number: "",
      quote_number: "",
      quote_date: undefined,
      quote_expiry_date: undefined,
      is_night_shift: false,
      truck_access: "any",
      waste_factor: 5,
    },
  });

  // Handle form submission
  async function onSubmit(data: JobBasicInfoFormValues, event: React.BaseSyntheticEvent | undefined) {
    try {
      setIsSubmitting(true);
      setError(null);
      
      // Get the action value (save_draft or continue)
      const action = event?.nativeEvent?.submitter?.getAttribute("value") || "continue";
      
      // Initialize Supabase client
      const supabase = getBrowserClient();
      
      // Create new job record
      const { data: newJob, error: jobError } = await supabase
        .from("jobs")
        .insert({
          tenant_id: tenantId,
          job_number: data.job_number,
          title: data.title,
          job_type: data.job_type,
          customer_id: data.customer_id || null,
          description: data.description || null,
          purchase_order_number: data.purchase_order_number || null,
          quote_number: data.quote_number || null,
          quote_date: data.quote_date ? format(data.quote_date, "yyyy-MM-dd") : null,
          quote_expiry_date: data.quote_expiry_date ? format(data.quote_expiry_date, "yyyy-MM-dd") : null,
          is_night_shift: data.is_night_shift,
          truck_access: data.truck_access,
          waste_factor: data.waste_factor,
          job_status: action === "save_draft" ? "draft" : "quoted",
          created_by: userId,
          quoted_by: userId,
        })
        .select("id")
        .single();
      
      if (jobError) {
        throw new Error(jobError.message);
      }
      
      // Store job ID in session storage for multi-step form
      if (typeof window !== "undefined") {
        sessionStorage.setItem("current_job_id", newJob.id);
      }
      
      // Redirect based on action
      if (action === "save_draft") {
        router.push("/dashboard/jobs");
      } else {
        router.push(`/dashboard/jobs/new?step=site&job_id=${newJob.id}`);
      }
      
    } catch (err) {
      console.error("Error creating job:", err);
      setError(err instanceof Error ? err.message : "An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold tracking-tight">Basic Job Information</h2>
        <p className="text-sm text-muted-foreground">
          Enter the core details about this asphalt job
        </p>
      </div>
      
      {error && (
        <Alert variant="destructive">
          <InfoIcon className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      <Form {...form}>
        <form id="current-job-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="job_number"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Job Number</FormLabel>
                  <FormControl>
                    <Input {...field} readOnly />
                  </FormControl>
                  <FormDescription>
                    Auto-generated job reference
                  </FormDescription>
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="job_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Job Type</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select job type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="mill_and_fill">Mill & Fill</SelectItem>
                      <SelectItem value="resheet">Resheet</SelectItem>
                      <SelectItem value="overlay">Overlay</SelectItem>
                      <SelectItem value="patching">Patching</SelectItem>
                      <SelectItem value="full_reconstruction">Full Reconstruction</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Type of asphalt work to be performed
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Job Title</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="e.g., Smith Street Resurfacing" />
                </FormControl>
                <FormDescription>
                  Clear descriptive title for this job
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="customer_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Customer</FormLabel>
                <Select 
                  onValueChange={field.onChange} 
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a customer" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="">-- No Customer Selected --</SelectItem>
                    {customers.map((customer) => (
                      <SelectItem key={customer.id} value={customer.id}>
                        {customer.business_name}
                        {customer.abn && ` (ABN: ${customer.abn})`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormDescription>
                  <Button 
                    variant="link" 
                    className="h-auto p-0 text-xs"
                    type="button"
                    onClick={() => window.open("/dashboard/customers/new", "_blank")}
                  >
                    + Add New Customer
                  </Button>
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea 
                    {...field} 
                    placeholder="Enter job description and any special requirements" 
                    rows={3}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="purchase_order_number"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Purchase Order Number</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="e.g., PO-12345" />
                  </FormControl>
                  <FormDescription>
                    Customer's PO number if available
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="quote_number"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Quote Number</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="e.g., Q-12345" />
                  </FormControl>
                  <FormDescription>
                    Your quote reference number
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="quote_date"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Quote Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) =>
                          date > new Date() || date < new Date("1900-01-01")
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormDescription>
                    Date the quote was prepared
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="quote_expiry_date"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Quote Expiry Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) =>
                          date < new Date() || date < new Date("1900-01-01")
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormDescription>
                    Date the quote expires
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="waste_factor"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Waste Factor (%)</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      min={0} 
                      max={20} 
                      step={0.5}
                      {...field}
                      onChange={(e) => field.onChange(parseFloat(e.target.value))}
                    />
                  </FormControl>
                  <FormDescription>
                    Percentage added to material calculations (default: 5%)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="truck_access"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Truck Access</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select truck access type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="any">Any Truck Type</SelectItem>
                      <SelectItem value="truck_and_dog">Truck & Dog Only</SelectItem>
                      <SelectItem value="semi_trailer">Semi Trailer Only</SelectItem>
                      <SelectItem value="rigid_truck">Rigid Truck Only</SelectItem>
                      <SelectItem value="body_truck">Body Truck Only (Tight Access)</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Truck type restrictions for site access
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <FormField
            control={form.control}
            name="is_night_shift"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">Night Shift</FormLabel>
                  <FormDescription>
                    Job will be performed during night hours
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />
          
          <div className="text-sm text-muted-foreground">
            Created by: {userName}
          </div>
          
          {/* Form buttons are in the parent component */}
        </form>
      </Form>
    </div>
  );
}
