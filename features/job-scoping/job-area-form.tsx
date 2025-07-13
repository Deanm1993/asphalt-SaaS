import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { PlusCircle, Trash2, Calculator, AlertTriangle, Info } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getBrowserClient } from "@/lib/supabase";
import { cn } from "@/lib/utils";

// Define the form schema with Zod
const jobItemSchema = z.object({
  name: z.string().min(1, "Section name is required"),
  area_sqm: z.number().min(0.1, "Area must be greater than 0"),
  depth_mm: z.number().min(1, "Depth must be at least 1mm"),
  asphalt_mix_type: z.enum(["ac10", "ac14", "ac20", "sma", "open_graded", "warm_mix", "cold_mix", "recycled", "custom"], {
    required_error: "Please select an asphalt mix type",
  }),
  specification: z.enum(["rms_r116", "rms_r117", "rms_r118", "vicroads_section_407", "vicroads_section_408", "mrwa_specification_504", "tmr_mrts30", "dpti_part_228", "local_council", "custom"], {
    required_error: "Please select a specification",
  }).default("local_council"),
  custom_specification: z.string().optional(),
  unit_price_per_tonne: z.number().min(0, "Unit price cannot be negative").optional(),
  notes: z.string().optional(),
});

const jobAreaSchema = z.object({
  items: z.array(jobItemSchema).min(1, "At least one area section is required"),
});

type JobItemFormValues = z.infer<typeof jobItemSchema>;
type JobAreaFormValues = z.infer<typeof jobAreaSchema>;

// Constants
const DENSITY_FACTOR = 2.4; // Standard asphalt density

export function JobAreaForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const jobId = searchParams.get("job_id") || sessionStorage.getItem("current_job_id");
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [jobDetails, setJobDetails] = useState<{
    waste_factor: number;
    tenant_id: string;
  } | null>(null);
  const [totalTonnage, setTotalTonnage] = useState(0);
  const [totalPriceExGST, setTotalPriceExGST] = useState(0);
  
  // Initialize form with default values
  const form = useForm<JobAreaFormValues>({
    resolver: zodResolver(jobAreaSchema),
    defaultValues: {
      items: [
        {
          name: "Main Area",
          area_sqm: 0,
          depth_mm: 40,
          asphalt_mix_type: "ac14",
          specification: "local_council",
          custom_specification: "",
          unit_price_per_tonne: 0,
          notes: "",
        },
      ],
    },
  });
  
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  });
  
  // Calculate tonnage for a single item
  const calculateTonnage = (area: number, depth: number, wasteFactor: number = 5) => {
    // Formula: area (m²) × depth (mm) × density ÷ 1000 × (1 + waste_factor/100)
    return (area * depth * DENSITY_FACTOR / 1000) * (1 + wasteFactor / 100);
  };
  
  // Calculate price for a single item
  const calculatePrice = (tonnage: number, unitPrice: number = 0) => {
    return tonnage * unitPrice;
  };
  
  // Load job details and existing items
  useEffect(() => {
    const loadJobData = async () => {
      if (!jobId) {
        router.push("/dashboard/jobs/new");
        return;
      }
      
      const supabase = getBrowserClient();
      
      // Get job details
      const { data: job, error: jobError } = await supabase
        .from("jobs")
        .select("waste_factor, tenant_id")
        .eq("id", jobId)
        .single();
      
      if (jobError) {
        console.error("Error loading job:", jobError);
        setError("Failed to load job details");
        return;
      }
      
      setJobDetails(job);
      
      // Get existing job items
      const { data: items, error: itemsError } = await supabase
        .from("job_items")
        .select("*")
        .eq("job_id", jobId)
        .order("created_at");
      
      if (itemsError) {
        console.error("Error loading job items:", itemsError);
        setError("Failed to load job sections");
        return;
      }
      
      // If items exist, populate the form
      if (items && items.length > 0) {
        form.reset({
          items: items.map(item => ({
            name: item.name,
            area_sqm: item.area_sqm,
            depth_mm: item.depth_mm,
            asphalt_mix_type: item.asphalt_mix_type,
            specification: item.specification || "local_council",
            custom_specification: item.custom_specification || "",
            unit_price_per_tonne: item.unit_price_per_tonne || 0,
            notes: item.notes || "",
          })),
        });
        
        // Calculate totals
        updateTotals(items);
      }
    };
    
    loadJobData();
  }, [jobId, router, form]);
  
  // Update totals when form values change
  useEffect(() => {
    const subscription = form.watch((value, { name, type }) => {
      if (value.items) {
        const items = value.items;
        let totalTonnage = 0;
        let totalPrice = 0;
        
        items.forEach(item => {
          if (item.area_sqm && item.depth_mm) {
            const tonnage = calculateTonnage(
              item.area_sqm, 
              item.depth_mm, 
              jobDetails?.waste_factor || 5
            );
            totalTonnage += tonnage;
            
            if (item.unit_price_per_tonne) {
              totalPrice += calculatePrice(tonnage, item.unit_price_per_tonne);
            }
          }
        });
        
        setTotalTonnage(totalTonnage);
        setTotalPriceExGST(totalPrice);
      }
    });
    
    return () => subscription.unsubscribe();
  }, [form, jobDetails]);
  
  // Update totals from loaded items
  const updateTotals = (items: any[]) => {
    let totalTonnage = 0;
    let totalPrice = 0;
    
    items.forEach(item => {
      if (item.tonnage) {
        totalTonnage += item.tonnage;
        
        if (item.total_price_ex_gst) {
          totalPrice += item.total_price_ex_gst;
        }
      }
    });
    
    setTotalTonnage(totalTonnage);
    setTotalPriceExGST(totalPrice);
  };
  
  // Add new item
  const addNewSection = () => {
    append({
      name: `Area ${fields.length + 1}`,
      area_sqm: 0,
      depth_mm: 40,
      asphalt_mix_type: "ac14",
      specification: "local_council",
      custom_specification: "",
      unit_price_per_tonne: form.getValues("items")[0]?.unit_price_per_tonne || 0,
      notes: "",
    });
  };
  
  // Handle form submission
  async function onSubmit(data: JobAreaFormValues, event: React.BaseSyntheticEvent | undefined) {
    try {
      if (!jobId || !jobDetails) {
        setError("Job ID is missing. Please start from the beginning.");
        return;
      }
      
      setIsSubmitting(true);
      setError(null);
      
      // Get the action value (save_draft or continue)
      const action = event?.nativeEvent?.submitter?.getAttribute("value") || "continue";
      
      // Initialize Supabase client
      const supabase = getBrowserClient();
      
      // Delete existing items first (to handle removals)
      const { error: deleteError } = await supabase
        .from("job_items")
        .delete()
        .eq("job_id", jobId);
      
      if (deleteError) {
        throw new Error(`Failed to update job sections: ${deleteError.message}`);
      }
      
      // Insert new items
      const jobItems = data.items.map(item => ({
        job_id: jobId,
        tenant_id: jobDetails.tenant_id,
        name: item.name,
        area_sqm: item.area_sqm,
        depth_mm: item.depth_mm,
        asphalt_mix_type: item.asphalt_mix_type,
        specification: item.specification,
        custom_specification: item.custom_specification || null,
        unit_price_per_tonne: item.unit_price_per_tonne || null,
        notes: item.notes || null,
      }));
      
      const { error: insertError } = await supabase
        .from("job_items")
        .insert(jobItems);
      
      if (insertError) {
        throw new Error(`Failed to add job sections: ${insertError.message}`);
      }
      
      // Update job with total price
      const { error: updateJobError } = await supabase
        .from("jobs")
        .update({
          quote_total_ex_gst: totalPriceExGST,
          site_area_sqm: data.items.reduce((sum, item) => sum + item.area_sqm, 0),
          updated_at: new Date().toISOString(),
        })
        .eq("id", jobId);
      
      if (updateJobError) {
        throw new Error(`Failed to update job totals: ${updateJobError.message}`);
      }
      
      // Redirect based on action
      if (action === "save_draft") {
        router.push("/dashboard/jobs");
      } else {
        router.push(`/dashboard/jobs/new?step=materials&job_id=${jobId}`);
      }
      
    } catch (err) {
      console.error("Error saving job areas:", err);
      setError(err instanceof Error ? err.message : "An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold tracking-tight">Area & Tonnage Calculation</h2>
        <p className="text-sm text-muted-foreground">
          Define the areas to be paved and calculate required tonnage
        </p>
      </div>
      
      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      <Alert>
        <Calculator className="h-4 w-4" />
        <AlertTitle>Tonnage Calculation</AlertTitle>
        <AlertDescription>
          Tonnage is calculated using: Area (m²) × Depth (mm) × Density (2.4) ÷ 1000 × (1 + Waste Factor/100)
          {jobDetails?.waste_factor && jobDetails.waste_factor !== 5 && (
            <span className="font-medium"> Using {jobDetails.waste_factor}% waste factor.</span>
          )}
        </AlertDescription>
      </Alert>
      
      <Form {...form}>
        <form id="current-job-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {fields.map((field, index) => (
            <Card key={field.id} className={index > 0 ? "border-dashed" : ""}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-lg">
                  Section {index + 1}
                </CardTitle>
                {index > 0 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => remove(index)}
                    className="text-destructive"
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Remove
                  </Button>
                )}
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name={`items.${index}.name`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Section Name</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="e.g., Main Driveway" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name={`items.${index}.area_sqm`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Area (m²)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min={0}
                            step={0.01}
                            {...field}
                            onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                          />
                        </FormControl>
                        <FormDescription>
                          Surface area in square meters
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name={`items.${index}.depth_mm`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Depth (mm)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min={1}
                            step={1}
                            {...field}
                            onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                          />
                        </FormControl>
                        <FormDescription>
                          Asphalt thickness in millimeters
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name={`items.${index}.asphalt_mix_type`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Asphalt Mix Type</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select mix type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="ac10">AC10 (10mm wearing course)</SelectItem>
                            <SelectItem value="ac14">AC14 (14mm intermediate course)</SelectItem>
                            <SelectItem value="ac20">AC20 (20mm base course)</SelectItem>
                            <SelectItem value="sma">SMA (Stone Mastic Asphalt)</SelectItem>
                            <SelectItem value="open_graded">Open Graded (Porous)</SelectItem>
                            <SelectItem value="warm_mix">Warm Mix Asphalt</SelectItem>
                            <SelectItem value="cold_mix">Cold Mix (Temporary repairs)</SelectItem>
                            <SelectItem value="recycled">Recycled Asphalt (RAP)</SelectItem>
                            <SelectItem value="custom">Custom Mix</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name={`items.${index}.specification`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Specification</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select specification" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="local_council">Local Council</SelectItem>
                            <SelectItem value="rms_r116">RMS R116 (NSW)</SelectItem>
                            <SelectItem value="rms_r117">RMS R117 (NSW)</SelectItem>
                            <SelectItem value="rms_r118">RMS R118 (NSW)</SelectItem>
                            <SelectItem value="vicroads_section_407">VicRoads 407</SelectItem>
                            <SelectItem value="vicroads_section_408">VicRoads 408</SelectItem>
                            <SelectItem value="mrwa_specification_504">MRWA 504 (WA)</SelectItem>
                            <SelectItem value="tmr_mrts30">TMR MRTS30 (QLD)</SelectItem>
                            <SelectItem value="dpti_part_228">DPTI 228 (SA)</SelectItem>
                            <SelectItem value="custom">Custom Specification</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                {form.watch(`items.${index}.specification`) === "custom" && (
                  <FormField
                    control={form.control}
                    name={`items.${index}.custom_specification`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Custom Specification Details</FormLabel>
                        <FormControl>
                          <Textarea 
                            {...field} 
                            placeholder="Enter custom specification details" 
                            rows={2}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
                
                <FormField
                  control={form.control}
                  name={`items.${index}.unit_price_per_tonne`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Unit Price ($ per tonne)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={0}
                          step={0.01}
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormDescription>
                        Price per tonne excluding GST
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name={`items.${index}.notes`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notes</FormLabel>
                      <FormControl>
                        <Textarea 
                          {...field} 
                          placeholder="Any special requirements or notes for this section" 
                          rows={2}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {/* Calculated values */}
                <div className="mt-4 p-4 bg-muted rounded-md">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <Label>Calculated Tonnage</Label>
                      <div className="text-xl font-bold mt-1">
                        {form.watch(`items.${index}.area_sqm`) && form.watch(`items.${index}.depth_mm`)
                          ? calculateTonnage(
                              form.watch(`items.${index}.area_sqm`), 
                              form.watch(`items.${index}.depth_mm`),
                              jobDetails?.waste_factor || 5
                            ).toFixed(2)
                          : "0.00"} tonnes
                      </div>
                    </div>
                    
                    <div>
                      <Label>Estimated Price (ex GST)</Label>
                      <div className="text-xl font-bold mt-1">
                        ${form.watch(`items.${index}.area_sqm`) && 
                           form.watch(`items.${index}.depth_mm`) && 
                           form.watch(`items.${index}.unit_price_per_tonne`)
                          ? calculatePrice(
                              calculateTonnage(
                                form.watch(`items.${index}.area_sqm`), 
                                form.watch(`items.${index}.depth_mm`),
                                jobDetails?.waste_factor || 5
                              ), 
                              form.watch(`items.${index}.unit_price_per_tonne`)
                            ).toFixed(2)
                          : "0.00"}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addNewSection}
            className="flex items-center"
          >
            <PlusCircle className="h-4 w-4 mr-1" />
            Add Another Section
          </Button>
          
          {/* Summary Table */}
          <Card>
            <CardHeader>
              <CardTitle>Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Section</TableHead>
                    <TableHead>Area (m²)</TableHead>
                    <TableHead>Depth (mm)</TableHead>
                    <TableHead>Mix Type</TableHead>
                    <TableHead className="text-right">Tonnage</TableHead>
                    <TableHead className="text-right">Price (ex GST)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {fields.map((field, index) => (
                    <TableRow key={field.id}>
                      <TableCell className="font-medium">{form.watch(`items.${index}.name`)}</TableCell>
                      <TableCell>{form.watch(`items.${index}.area_sqm`).toFixed(2)}</TableCell>
                      <TableCell>{form.watch(`items.${index}.depth_mm`)}</TableCell>
                      <TableCell>{form.watch(`items.${index}.asphalt_mix_type`).toUpperCase()}</TableCell>
                      <TableCell className="text-right">
                        {calculateTonnage(
                          form.watch(`items.${index}.area_sqm`), 
                          form.watch(`items.${index}.depth_mm`),
                          jobDetails?.waste_factor || 5
                        ).toFixed(2)}
                      </TableCell>
                      <TableCell className="text-right">
                        ${calculatePrice(
                          calculateTonnage(
                            form.watch(`items.${index}.area_sqm`), 
                            form.watch(`items.${index}.depth_mm`),
                            jobDetails?.waste_factor || 5
                          ), 
                          form.watch(`items.${index}.unit_price_per_tonne`) || 0
                        ).toFixed(2)}
                      </TableCell>
                    </TableRow>
                  ))}
                  <TableRow className="bg-muted/50">
                    <TableCell colSpan={4} className="font-bold">Total</TableCell>
                    <TableCell className="text-right font-bold">{totalTonnage.toFixed(2)} tonnes</TableCell>
                    <TableCell className="text-right font-bold">${totalPriceExGST.toFixed(2)}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
              
              <div className="mt-4 text-sm text-muted-foreground">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex items-center">
                        <Info className="h-4 w-4 mr-1" />
                        <span>Includes {jobDetails?.waste_factor || 5}% waste factor</span>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Waste factor accounts for material loss during transport and installation</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </CardContent>
          </Card>
          
          {/* Form buttons are in the parent component */}
        </form>
      </Form>
    </div>
  );
}
