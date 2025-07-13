import { Metadata } from "next";
import Link from "next/link";
import { cookies } from "next/headers";
import { format, addDays, isSameDay } from "date-fns";

import { createClient } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CalendarDays, Clock, DollarSign, FileCheck, FilePlus, MapPin, Sun, Truck, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";

export const metadata: Metadata = {
  title: "Dashboard | Viable",
  description: "Asphalt contractor job management dashboard",
};

// Helper function to get status badge color
const getStatusBadge = (status: string) => {
  switch (status) {
    case "draft":
      return <Badge variant="outline">Draft</Badge>;
    case "quoted":
      return <Badge variant="secondary">Quoted</Badge>;
    case "approved":
      return <Badge variant="default">Approved</Badge>;
    case "scheduled":
      return <Badge variant="info">Scheduled</Badge>;
    case "in_progress":
      return <Badge variant="warning">In Progress</Badge>;
    case "completed":
      return <Badge variant="success">Completed</Badge>;
    case "invoiced":
      return <Badge variant="primary">Invoiced</Badge>;
    case "cancelled":
      return <Badge variant="destructive">Cancelled</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
};

export default async function DashboardPage() {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);
  
  // Get current user and tenant
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return <div>Please log in to access the dashboard</div>;
  }
  
  // Get user's tenant information
  const { data: userData } = await supabase
    .from("users")
    .select("tenant_id")
    .eq("id", user.id)
    .single();
  
  if (!userData) {
    return <div>User profile not found</div>;
  }
  
  const tenantId = userData.tenant_id;
  
  // Fetch dashboard data
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];
  
  // Get job statistics
  const { data: jobStats } = await supabase.rpc('get_job_stats', { tenant_id_param: tenantId });
  
  const totalJobs = jobStats?.total_jobs || 0;
  const quotedJobs = jobStats?.quoted_jobs || 0;
  const scheduledJobs = jobStats?.scheduled_jobs || 0;
  const completedJobs = jobStats?.completed_jobs || 0;
  const totalRevenue = jobStats?.total_revenue || 0;
  
  // Get recent jobs
  const { data: recentJobs } = await supabase
    .from("jobs")
    .select(`
      id,
      job_number,
      title,
      job_type,
      job_status,
      total_tonnage,
      quote_total_inc_gst,
      updated_at,
      customers:customer_id (business_name),
      job_sites:site_id (name, suburb, state)
    `)
    .eq("tenant_id", tenantId)
    .order("updated_at", { ascending: false })
    .limit(5);
  
  // Get upcoming schedule
  const { data: upcomingSchedule } = await supabase
    .from("schedules")
    .select(`
      id,
      title,
      start_time,
      end_time,
      status,
      jobs:job_id (
        id,
        job_number,
        title,
        job_type,
        total_tonnage
      ),
      crews:crew_id (
        id,
        name,
        color
      )
    `)
    .eq("tenant_id", tenantId)
    .gte("start_time", today.toISOString())
    .order("start_time", { ascending: true })
    .limit(5);
  
  // Get weather forecast for next 5 days
  const { data: weatherForecast } = await supabase
    .from("weather_forecasts")
    .select("*")
    .eq("tenant_id", tenantId)
    .gte("forecast_date", todayStr)
    .order("forecast_date", { ascending: true })
    .limit(5);
  
  // Generate next 5 days for weather display if no data
  const next5Days = Array.from({ length: 5 }, (_, i) => {
    const date = addDays(today, i);
    return {
      forecast_date: format(date, "yyyy-MM-dd"),
      display_date: format(date, "EEE d MMM"),
      min_temp_c: null,
      max_temp_c: null,
      chance_of_rain: null,
      is_suitable_for_paving: null,
      weather_condition: null
    };
  });
  
  // Merge actual weather data with placeholder
  const weatherData = next5Days.map(day => {
    const forecast = weatherForecast?.find(f => 
      f.forecast_date === day.forecast_date
    );
    
    return forecast || day;
  });

  return (
    <div className="flex flex-col space-y-6 p-6">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Overview of your asphalt operations and upcoming work
        </p>
      </div>
      
      {/* Quick Actions */}
      <div className="flex flex-wrap gap-2">
        <Button asChild>
          <Link href="/dashboard/jobs/new">
            <FilePlus className="mr-2 h-4 w-4" />
            New Job
          </Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/dashboard/customers/new">
            <Users className="mr-2 h-4 w-4" />
            Add Customer
          </Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/dashboard/sites/new">
            <MapPin className="mr-2 h-4 w-4" />
            Add Site
          </Link>
        </Button>
      </div>
      
      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Jobs</CardTitle>
            <FileCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalJobs}</div>
            <p className="text-xs text-muted-foreground">
              {quotedJobs} quoted, {scheduledJobs} scheduled
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming Jobs</CardTitle>
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{scheduledJobs}</div>
            <p className="text-xs text-muted-foreground">
              Next 7 days
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed Jobs</CardTitle>
            <FileCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedJobs}</div>
            <p className="text-xs text-muted-foreground">
              {Math.round((completedJobs / totalJobs) * 100) || 0}% completion rate
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${totalRevenue.toLocaleString('en-AU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-muted-foreground">
              Including GST
            </p>
          </CardContent>
        </Card>
      </div>
      
      {/* Main Dashboard Content */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="jobs">Recent Jobs</TabsTrigger>
          <TabsTrigger value="schedule">Schedule</TabsTrigger>
          <TabsTrigger value="weather">Weather</TabsTrigger>
        </TabsList>
        
        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {/* Recent Jobs Card */}
            <Card className="col-span-2">
              <CardHeader>
                <CardTitle>Recent Jobs</CardTitle>
                <CardDescription>
                  Your latest job updates
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentJobs && recentJobs.length > 0 ? (
                    recentJobs.map((job) => (
                      <div key={job.id} className="flex items-center">
                        <div className="space-y-1 flex-1">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium leading-none">
                              {job.job_number}: {job.title}
                            </p>
                            {getStatusBadge(job.job_status)}
                          </div>
                          <div className="flex items-center text-sm text-muted-foreground">
                            <MapPin className="mr-1 h-3 w-3" />
                            {job.job_sites?.name || 'No site'}, {job.job_sites?.suburb || ''} {job.job_sites?.state || ''}
                          </div>
                          <div className="flex items-center gap-4 text-sm">
                            <div className="flex items-center">
                              <Truck className="mr-1 h-3 w-3" />
                              <span>{job.total_tonnage?.toFixed(2) || 0} tonnes</span>
                            </div>
                            {job.quote_total_inc_gst && (
                              <div className="flex items-center">
                                <DollarSign className="mr-1 h-3 w-3" />
                                <span>${job.quote_total_inc_gst.toLocaleString('en-AU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                              </div>
                            )}
                          </div>
                        </div>
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/dashboard/jobs/${job.id}`}>View</Link>
                        </Button>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">No recent jobs found</p>
                  )}
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" size="sm" className="w-full" asChild>
                  <Link href="/dashboard/jobs">View All Jobs</Link>
                </Button>
              </CardFooter>
            </Card>
            
            {/* Weather Forecast Card */}
            <Card>
              <CardHeader>
                <CardTitle>Weather Forecast</CardTitle>
                <CardDescription>
                  Suitable paving conditions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {weatherData.map((day, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {day.is_suitable_for_paving === true ? (
                          <Sun className="h-5 w-5 text-success" />
                        ) : day.is_suitable_for_paving === false ? (
                          <Sun className="h-5 w-5 text-destructive" />
                        ) : (
                          <Sun className="h-5 w-5 text-muted-foreground" />
                        )}
                        <div>
                          <p className="text-sm font-medium">
                            {day.display_date}
                          </p>
                          {day.min_temp_c !== null && day.max_temp_c !== null ? (
                            <p className="text-xs text-muted-foreground">
                              {day.min_temp_c}°C - {day.max_temp_c}°C
                              {day.chance_of_rain !== null && `, ${day.chance_of_rain}% rain`}
                            </p>
                          ) : (
                            <p className="text-xs text-muted-foreground">
                              Forecast unavailable
                            </p>
                          )}
                        </div>
                      </div>
                      <Badge 
                        variant={
                          day.is_suitable_for_paving === true 
                            ? "success" 
                            : day.is_suitable_for_paving === false 
                              ? "destructive" 
                              : "outline"
                        }
                      >
                        {day.is_suitable_for_paving === true 
                          ? "Suitable" 
                          : day.is_suitable_for_paving === false 
                            ? "Unsuitable" 
                            : "Unknown"}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" size="sm" className="w-full" asChild>
                  <Link href="/dashboard/weather">Full Forecast</Link>
                </Button>
              </CardFooter>
            </Card>
          </div>
          
          {/* Upcoming Schedule */}
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Schedule</CardTitle>
              <CardDescription>
                Your next 5 scheduled jobs
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {upcomingSchedule && upcomingSchedule.length > 0 ? (
                  upcomingSchedule.map((schedule) => (
                    <div key={schedule.id} className="flex items-center">
                      <div 
                        className="w-1 h-16 rounded-full mr-4" 
                        style={{ backgroundColor: schedule.crews?.color || '#3498DB' }}
                      />
                      <div className="space-y-1 flex-1">
                        <p className="text-sm font-medium leading-none">
                          {schedule.jobs?.job_number}: {schedule.title}
                        </p>
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Clock className="mr-1 h-3 w-3" />
                          {format(new Date(schedule.start_time), "EEE, d MMM yyyy")} •{" "}
                          {format(new Date(schedule.start_time), "h:mm a")} - {format(new Date(schedule.end_time), "h:mm a")}
                        </div>
                        <div className="flex items-center gap-4 text-sm">
                          <div className="flex items-center">
                            <Users className="mr-1 h-3 w-3" />
                            <span>{schedule.crews?.name || 'Unassigned'}</span>
                          </div>
                          {schedule.jobs?.total_tonnage && (
                            <div className="flex items-center">
                              <Truck className="mr-1 h-3 w-3" />
                              <span>{schedule.jobs.total_tonnage.toFixed(2)} tonnes</span>
                            </div>
                          )}
                        </div>
                      </div>
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/dashboard/schedule?date=${format(new Date(schedule.start_time), "yyyy-MM-dd")}`}>
                          View
                        </Link>
                      </Button>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">No upcoming scheduled jobs</p>
                )}
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" size="sm" className="w-full" asChild>
                <Link href="/dashboard/schedule">View Full Schedule</Link>
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        {/* Jobs Tab */}
        <TabsContent value="jobs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Job Status Overview</CardTitle>
              <CardDescription>
                Current status of all jobs
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Draft</span>
                    <span className="text-muted-foreground">{jobStats?.draft_jobs || 0} jobs</span>
                  </div>
                  <Progress value={jobStats?.draft_jobs ? (jobStats.draft_jobs / totalJobs) * 100 : 0} />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Quoted</span>
                    <span className="text-muted-foreground">{jobStats?.quoted_jobs || 0} jobs</span>
                  </div>
                  <Progress value={jobStats?.quoted_jobs ? (jobStats.quoted_jobs / totalJobs) * 100 : 0} />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Approved</span>
                    <span className="text-muted-foreground">{jobStats?.approved_jobs || 0} jobs</span>
                  </div>
                  <Progress value={jobStats?.approved_jobs ? (jobStats.approved_jobs / totalJobs) * 100 : 0} />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Scheduled</span>
                    <span className="text-muted-foreground">{jobStats?.scheduled_jobs || 0} jobs</span>
                  </div>
                  <Progress value={jobStats?.scheduled_jobs ? (jobStats.scheduled_jobs / totalJobs) * 100 : 0} />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>In Progress</span>
                    <span className="text-muted-foreground">{jobStats?.in_progress_jobs || 0} jobs</span>
                  </div>
                  <Progress value={jobStats?.in_progress_jobs ? (jobStats.in_progress_jobs / totalJobs) * 100 : 0} />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Completed</span>
                    <span className="text-muted-foreground">{jobStats?.completed_jobs || 0} jobs</span>
                  </div>
                  <Progress value={jobStats?.completed_jobs ? (jobStats.completed_jobs / totalJobs) * 100 : 0} />
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" size="sm" className="w-full" asChild>
                <Link href="/dashboard/jobs">View All Jobs</Link>
              </Button>
            </CardFooter>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Recent Jobs</CardTitle>
              <CardDescription>
                Your latest job updates
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {recentJobs && recentJobs.length > 0 ? (
                  recentJobs.map((job) => (
                    <div key={job.id}>
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <Link 
                              href={`/dashboard/jobs/${job.id}`}
                              className="text-base font-medium hover:underline"
                            >
                              {job.job_number}: {job.title}
                            </Link>
                            {getStatusBadge(job.job_status)}
                          </div>
                          <div className="flex items-center text-sm text-muted-foreground">
                            <MapPin className="mr-1 h-3 w-3" />
                            {job.job_sites?.name || 'No site'}, {job.job_sites?.suburb || ''} {job.job_sites?.state || ''}
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium">
                            {job.customers?.business_name || 'No customer'}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Updated {format(new Date(job.updated_at), "d MMM yyyy")}
                          </p>
                        </div>
                      </div>
                      <div className="mt-2 flex items-center justify-between">
                        <div className="flex items-center gap-4 text-sm">
                          <div className="flex items-center">
                            <Truck className="mr-1 h-3 w-3" />
                            <span>{job.total_tonnage?.toFixed(2) || 0} tonnes</span>
                          </div>
                          {job.quote_total_inc_gst && (
                            <div className="flex items-center">
                              <DollarSign className="mr-1 h-3 w-3" />
                              <span>${job.quote_total_inc_gst.toLocaleString('en-AU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                            </div>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" asChild>
                            <Link href={`/dashboard/jobs/${job.id}/edit`}>Edit</Link>
                          </Button>
                          <Button size="sm" asChild>
                            <Link href={`/dashboard/jobs/${job.id}`}>View</Link>
                          </Button>
                        </div>
                      </div>
                      {job !== recentJobs[recentJobs.length - 1] && <Separator className="mt-4" />}
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">No recent jobs found</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Schedule Tab */}
        <TabsContent value="schedule" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Schedule</CardTitle>
              <CardDescription>
                Your next scheduled jobs
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {upcomingSchedule && upcomingSchedule.length > 0 ? (
                  upcomingSchedule.map((schedule) => (
                    <div key={schedule.id}>
                      <div className="flex items-center">
                        <div 
                          className="w-2 h-full min-h-[60px] rounded-full mr-4" 
                          style={{ backgroundColor: schedule.crews?.color || '#3498DB' }}
                        />
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <div>
                              <Link 
                                href={`/dashboard/jobs/${schedule.jobs?.id}`}
                                className="text-base font-medium hover:underline"
                              >
                                {schedule.jobs?.job_number}: {schedule.title}
                              </Link>
                              <div className="text-sm text-muted-foreground mt-1">
                                {format(new Date(schedule.start_time), "EEEE, d MMMM yyyy")}
                              </div>
                            </div>
                            <Badge variant={schedule.status === "completed" ? "success" : "outline"}>
                              {schedule.status || "Scheduled"}
                            </Badge>
                          </div>
                          
                          <div className="mt-2 grid grid-cols-2 gap-4">
                            <div className="flex items-center text-sm">
                              <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                              <div>
                                <div className="font-medium">Time</div>
                                <div className="text-muted-foreground">
                                  {format(new Date(schedule.start_time), "h:mm a")} - {format(new Date(schedule.end_time), "h:mm a")}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center text-sm">
                              <Users className="mr-2 h-4 w-4 text-muted-foreground" />
                              <div>
                                <div className="font-medium">Crew</div>
                                <div className="text-muted-foreground">
                                  {schedule.crews?.name || "Unassigned"}
                                </div>
                              </div>
                            </div>
                            {schedule.jobs?.total_tonnage && (
                              <div className="flex items-center text-sm">
                                <Truck className="mr-2 h-4 w-4 text-muted-foreground" />
                                <div>
                                  <div className="font-medium">Tonnage</div>
                                  <div className="text-muted-foreground">
                                    {schedule.jobs.total_tonnage.toFixed(2)} tonnes
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      {schedule !== upcomingSchedule[upcomingSchedule.length - 1] && <Separator className="my-4" />}
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">No upcoming scheduled jobs</p>
                )}
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" size="sm" className="w-full" asChild>
                <Link href="/dashboard/schedule">View Full Schedule</Link>
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        {/* Weather Tab */}
        <TabsContent value="weather" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Weather Forecast</CardTitle>
              <CardDescription>
                5-day forecast for paving conditions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
                {weatherData.map((day, index) => (
                  <Card key={index} className={cn(
                    "overflow-hidden",
                    day.is_suitable_for_paving === true && "border-success",
                    day.is_suitable_for_paving === false && "border-destructive"
                  )}>
                    <CardHeader className={cn(
                      "p-4",
                      day.is_suitable_for_paving === true && "bg-success/10",
                      day.is_suitable_for_paving === false && "bg-destructive/10"
                    )}>
                      <CardTitle className="text-center text-base">
                        {day.display_date}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 text-center">
                      {day.weather_condition ? (
                        <div className="mb-2 text-4xl">
                          {day.weather_condition.includes("rain") ? "🌧️" : 
                           day.weather_condition.includes("cloud") ? "☁️" : 
                           day.weather_condition.includes("sun") || day.weather_condition.includes("clear") ? "☀️" : "🌤️"}
                        </div>
                      ) : (
                        <div className="mb-2 text-4xl">🌤️</div>
                      )}
                      
                      {day.min_temp_c !== null && day.max_temp_c !== null ? (
                        <>
                          <div className="text-2xl font-bold">{day.max_temp_c}°C</div>
                          <div className="text-sm text-muted-foreground">Min: {day.min_temp_c}°C</div>
                        </>
                      ) : (
                        <div className="text-sm text-muted-foreground">Forecast unavailable</div>
                      )}
                      
                      {day.chance_of_rain !== null && (
                        <div className="mt-2 text-sm">
                          {day.chance_of_rain}% chance of rain
                        </div>
                      )}
                      
                      {day.is_suitable_for_paving !== null && (
                        <Badge 
                          className="mt-4"
                          variant={day.is_suitable_for_paving ? "success" : "destructive"}
                        >
                          {day.is_suitable_for_paving ? "Suitable for paving" : "Unsuitable for paving"}
                        </Badge>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
              
              <div className="mt-6">
                <h3 className="text-lg font-medium mb-2">Paving Conditions Guide</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  For optimal asphalt laying, the following conditions are recommended:
                </p>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="flex items-start gap-2">
                    <div className="rounded-full bg-success/20 p-1">
                      <Sun className="h-4 w-4 text-success" />
                    </div>
                    <div className="text-sm">
                      <span className="font-medium">Temperature:</span> Above 10°C for proper compaction
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="rounded-full bg-destructive/20 p-1">
                      <Sun className="h-4 w-4 text-destructive" />
                    </div>
                    <div className="text-sm">
                      <span className="font-medium">Precipitation:</span> No rain during or immediately after laying
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="rounded-full bg-success/20 p-1">
                      <Sun className="h-4 w-4 text-success" />
                    </div>
                    <div className="text-sm">
                      <span className="font-medium">Surface:</span> Dry base for proper bonding
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="rounded-full bg-destructive/20 p-1">
                      <Sun className="h-4 w-4 text-destructive" />
                    </div>
                    <div className="text-sm">
                      <span className="font-medium">Wind:</span> Low wind speeds to maintain asphalt temperature
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" size="sm" className="w-full" asChild>
                <Link href="/dashboard/weather">Detailed Weather Analysis</Link>
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
