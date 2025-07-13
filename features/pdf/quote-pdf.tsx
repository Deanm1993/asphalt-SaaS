import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
  Font,
  PDFViewer,
} from "@react-pdf/renderer";
import { format } from "date-fns";
import { Tables } from "@/lib/database.types";

// Register fonts
Font.register({
  family: "Inter",
  fonts: [
    { src: "/fonts/Inter-Regular.ttf" },
    { src: "/fonts/Inter-Medium.ttf", fontWeight: 500 },
    { src: "/fonts/Inter-Bold.ttf", fontWeight: 700 },
  ],
});

// Define styles
const styles = StyleSheet.create({
  page: {
    flexDirection: "column",
    backgroundColor: "#FFFFFF",
    padding: 40,
    fontFamily: "Inter",
    fontSize: 10,
    color: "#333333",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  companyInfo: {
    flexDirection: "column",
    maxWidth: "60%",
  },
  companyName: {
    fontSize: 18,
    fontWeight: 700,
    marginBottom: 4,
    color: "#2D3142", // Asphalt dark color
  },
  companyDetails: {
    fontSize: 9,
    color: "#4F5D75", // Asphalt light color
  },
  logo: {
    width: 120,
    height: 50,
    objectFit: "contain",
    objectPosition: "right top",
  },
  quoteTitle: {
    fontSize: 24,
    fontWeight: 700,
    marginBottom: 10,
    color: "#2D3142",
    textAlign: "center",
    padding: 10,
    backgroundColor: "#F8F9FA",
    borderRadius: 4,
  },
  quoteInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
    borderBottom: 1,
    borderBottomColor: "#E9ECEF",
    paddingBottom: 10,
  },
  quoteInfoLeft: {
    flexDirection: "column",
    width: "50%",
  },
  quoteInfoRight: {
    flexDirection: "column",
    width: "50%",
    alignItems: "flex-end",
  },
  infoLabel: {
    fontWeight: 700,
    marginBottom: 2,
  },
  infoValue: {
    marginBottom: 6,
  },
  section: {
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 700,
    marginBottom: 5,
    color: "#2D3142",
    backgroundColor: "#F8F9FA",
    padding: 5,
    borderRadius: 2,
  },
  customerInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 15,
  },
  customerDetails: {
    width: "50%",
  },
  jobDetails: {
    width: "50%",
    alignItems: "flex-end",
  },
  table: {
    flexDirection: "column",
    marginBottom: 20,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#4F5D75",
    color: "#FFFFFF",
    paddingVertical: 6,
    paddingHorizontal: 5,
    fontWeight: 700,
    fontSize: 9,
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#E9ECEF",
    paddingVertical: 6,
    paddingHorizontal: 5,
    fontSize: 9,
  },
  tableRowEven: {
    backgroundColor: "#F8F9FA",
  },
  col1: { width: "35%" },
  col2: { width: "15%" },
  col3: { width: "15%" },
  col4: { width: "15%" },
  col5: { width: "20%", textAlign: "right" },
  totalSection: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginBottom: 20,
  },
  totalTable: {
    width: "40%",
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 3,
  },
  totalLabel: {
    fontWeight: 500,
  },
  totalValue: {
    textAlign: "right",
  },
  grandTotal: {
    fontWeight: 700,
    fontSize: 12,
    color: "#2D3142",
  },
  notes: {
    marginBottom: 20,
    padding: 10,
    backgroundColor: "#F8F9FA",
    borderRadius: 4,
  },
  termsTitle: {
    fontWeight: 700,
    marginBottom: 5,
  },
  termsText: {
    fontSize: 9,
    color: "#4F5D75",
    lineHeight: 1.4,
  },
  footer: {
    position: "absolute",
    bottom: 30,
    left: 40,
    right: 40,
    textAlign: "center",
    fontSize: 8,
    color: "#6C757D",
    borderTopWidth: 1,
    borderTopColor: "#E9ECEF",
    paddingTop: 10,
  },
  signatureSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 40,
    marginBottom: 20,
  },
  signatureBox: {
    width: "45%",
  },
  signatureLine: {
    borderBottomWidth: 1,
    borderBottomColor: "#000000",
    marginTop: 40,
    marginBottom: 5,
  },
  watermark: {
    position: "absolute",
    bottom: 250,
    left: 0,
    right: 0,
    textAlign: "center",
    fontSize: 60,
    color: "rgba(200, 200, 200, 0.3)",
    transform: "rotate(-45deg)",
  },
});

// Types for the PDF component
interface JobItem {
  id: string;
  name: string;
  area_sqm: number;
  depth_mm: number;
  asphalt_mix_type: string;
  specification?: string;
  tonnage: number;
  unit_price_per_tonne?: number;
  total_price_ex_gst?: number;
  notes?: string;
}

interface QuotePDFProps {
  job: Tables<"jobs"> & {
    customers?: Tables<"customers"> | null;
    job_sites?: Tables<"job_sites"> | null;
    job_items?: JobItem[];
    job_hazards?: Tables<"job_hazards"> | null;
    job_equipment?: Tables<"job_equipment"> | null;
    job_materials?: Tables<"job_materials"> | null;
    quoted_by_user?: {
      first_name: string;
      last_name: string;
      email: string;
      phone?: string;
    } | null;
  };
  companyDetails: {
    name: string;
    abn: string;
    address: string;
    phone: string;
    email: string;
    website?: string;
    logoUrl?: string;
  };
  status?: "draft" | "final";
}

// Format currency helper
const formatCurrency = (amount: number | null | undefined): string => {
  if (amount === null || amount === undefined) return "$0.00";
  return new Intl.NumberFormat("en-AU", {
    style: "currency",
    currency: "AUD",
    minimumFractionDigits: 2,
  }).format(amount);
};

// Format asphalt mix type
const formatMixType = (mixType: string): string => {
  switch (mixType) {
    case "ac10":
      return "AC10 (10mm)";
    case "ac14":
      return "AC14 (14mm)";
    case "ac20":
      return "AC20 (20mm)";
    case "sma":
      return "SMA";
    case "open_graded":
      return "Open Graded";
    case "warm_mix":
      return "Warm Mix";
    case "cold_mix":
      return "Cold Mix";
    case "recycled":
      return "Recycled";
    case "custom":
      return "Custom Mix";
    default:
      return mixType.toUpperCase();
  }
};

// Format job type
const formatJobType = (jobType: string): string => {
  switch (jobType) {
    case "mill_and_fill":
      return "Mill & Fill";
    case "resheet":
      return "Resheet";
    case "overlay":
      return "Overlay";
    case "patching":
      return "Patching";
    case "full_reconstruction":
      return "Full Reconstruction";
    default:
      return jobType.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  }
};

// Main PDF component
export const QuotePDF: React.FC<QuotePDFProps> = ({
  job,
  companyDetails,
  status = "final",
}) => {
  // Calculate totals
  const subtotal = job.quote_total_ex_gst || 0;
  const gst = job.quote_gst_amount || subtotal * 0.1; // 10% GST
  const total = job.quote_total_inc_gst || subtotal + gst;

  // Format dates
  const quoteDate = job.quote_date
    ? format(new Date(job.quote_date), "d MMMM yyyy")
    : format(new Date(), "d MMMM yyyy");
  
  const expiryDate = job.quote_expiry_date
    ? format(new Date(job.quote_expiry_date), "d MMMM yyyy")
    : format(new Date(new Date().setDate(new Date().getDate() + 30)), "d MMMM yyyy");

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Watermark for draft quotes */}
        {status === "draft" && (
          <View style={styles.watermark}>
            <Text>DRAFT</Text>
          </View>
        )}

        {/* Header with company info and logo */}
        <View style={styles.header}>
          <View style={styles.companyInfo}>
            <Text style={styles.companyName}>{companyDetails.name}</Text>
            <Text style={styles.companyDetails}>ABN: {companyDetails.abn}</Text>
            <Text style={styles.companyDetails}>{companyDetails.address}</Text>
            <Text style={styles.companyDetails}>
              Phone: {companyDetails.phone} | Email: {companyDetails.email}
            </Text>
            {companyDetails.website && (
              <Text style={styles.companyDetails}>
                Website: {companyDetails.website}
              </Text>
            )}
          </View>
          {companyDetails.logoUrl && (
            <Image src={companyDetails.logoUrl} style={styles.logo} />
          )}
        </View>

        {/* Quote Title */}
        <View style={styles.quoteTitle}>
          <Text>QUOTATION</Text>
        </View>

        {/* Quote Info */}
        <View style={styles.quoteInfo}>
          <View style={styles.quoteInfoLeft}>
            <Text style={styles.infoLabel}>Quote Number:</Text>
            <Text style={styles.infoValue}>{job.quote_number || job.job_number}</Text>
            
            <Text style={styles.infoLabel}>Quote Date:</Text>
            <Text style={styles.infoValue}>{quoteDate}</Text>
            
            <Text style={styles.infoLabel}>Valid Until:</Text>
            <Text style={styles.infoValue}>{expiryDate}</Text>
          </View>
          <View style={styles.quoteInfoRight}>
            <Text style={styles.infoLabel}>Job Reference:</Text>
            <Text style={styles.infoValue}>{job.job_number}</Text>
            
            <Text style={styles.infoLabel}>Prepared By:</Text>
            <Text style={styles.infoValue}>
              {job.quoted_by_user 
                ? `${job.quoted_by_user.first_name} ${job.quoted_by_user.last_name}` 
                : "Viable Staff"}
            </Text>
            
            {job.purchase_order_number && (
              <>
                <Text style={styles.infoLabel}>PO Number:</Text>
                <Text style={styles.infoValue}>{job.purchase_order_number}</Text>
              </>
            )}
          </View>
        </View>

        {/* Customer and Job Details */}
        <View style={styles.customerInfo}>
          <View style={styles.customerDetails}>
            <Text style={styles.sectionTitle}>Customer Details</Text>
            <Text style={styles.infoLabel}>{job.customers?.business_name || "Customer"}</Text>
            {job.customers?.abn && <Text>ABN: {job.customers.abn}</Text>}
            {job.customers?.address_line1 && (
              <Text>
                {job.customers.address_line1}
                {job.customers.address_line2 ? `, ${job.customers.address_line2}` : ""}
              </Text>
            )}
            {job.customers?.suburb && (
              <Text>
                {job.customers.suburb}, {job.customers.state} {job.customers.postcode}
              </Text>
            )}
          </View>
          
          <View style={styles.jobDetails}>
            <Text style={styles.sectionTitle}>Job Details</Text>
            <Text style={styles.infoLabel}>{job.title}</Text>
            <Text>{formatJobType(job.job_type)}</Text>
            {job.job_sites && (
              <>
                <Text>{job.job_sites.name}</Text>
                <Text>
                  {job.job_sites.address_line1}
                  {job.job_sites.address_line2 ? `, ${job.job_sites.address_line2}` : ""}
                </Text>
                <Text>
                  {job.job_sites.suburb}, {job.job_sites.state} {job.job_sites.postcode}
                </Text>
              </>
            )}
          </View>
        </View>

        {/* Job Description */}
        {job.description && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text>{job.description}</Text>
          </View>
        )}

        {/* Line Items Table */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Scope of Work</Text>
          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={styles.col1}>Description</Text>
              <Text style={styles.col2}>Area (m²)</Text>
              <Text style={styles.col3}>Depth (mm)</Text>
              <Text style={styles.col4}>Tonnage</Text>
              <Text style={styles.col5}>Amount (ex GST)</Text>
            </View>
            
            {job.job_items && job.job_items.length > 0 ? (
              job.job_items.map((item, index) => (
                <View 
                  key={item.id} 
                  style={[
                    styles.tableRow, 
                    index % 2 === 1 ? styles.tableRowEven : {}
                  ]}
                >
                  <Text style={styles.col1}>
                    {item.name} - {formatMixType(item.asphalt_mix_type)}
                    {item.notes ? `\n${item.notes}` : ""}
                  </Text>
                  <Text style={styles.col2}>{item.area_sqm.toFixed(2)}</Text>
                  <Text style={styles.col3}>{item.depth_mm}</Text>
                  <Text style={styles.col4}>{item.tonnage.toFixed(2)}</Text>
                  <Text style={styles.col5}>
                    {formatCurrency(item.total_price_ex_gst)}
                  </Text>
                </View>
              ))
            ) : (
              <View style={styles.tableRow}>
                <Text style={{ width: "100%", textAlign: "center" }}>
                  No items specified
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Totals */}
        <View style={styles.totalSection}>
          <View style={styles.totalTable}>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Subtotal (ex GST):</Text>
              <Text style={styles.totalValue}>{formatCurrency(subtotal)}</Text>
            </View>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>GST (10%):</Text>
              <Text style={styles.totalValue}>{formatCurrency(gst)}</Text>
            </View>
            <View style={[styles.totalRow, { marginTop: 5, paddingTop: 5, borderTopWidth: 1, borderTopColor: "#000000" }]}>
              <Text style={styles.grandTotal}>TOTAL (inc GST):</Text>
              <Text style={styles.grandTotal}>{formatCurrency(total)}</Text>
            </View>
          </View>
        </View>

        {/* Special Notes */}
        {job.job_hazards && (
          <View style={styles.notes}>
            <Text style={styles.termsTitle}>Site Hazards & Special Requirements:</Text>
            {job.job_hazards.has_overhead_powerlines && (
              <Text style={styles.termsText}>• Overhead powerlines present on site</Text>
            )}
            {job.job_hazards.has_underground_services && (
              <Text style={styles.termsText}>• Underground services present</Text>
            )}
            {job.job_hazards.has_confined_spaces && (
              <Text style={styles.termsText}>• Confined spaces work required</Text>
            )}
            {job.job_hazards.has_traffic_management && (
              <Text style={styles.termsText}>• Traffic management required</Text>
            )}
            {job.job_hazards.has_tight_access && (
              <Text style={styles.termsText}>• Site has tight access restrictions</Text>
            )}
            {job.job_hazards.other_hazards && (
              <Text style={styles.termsText}>• {job.job_hazards.other_hazards}</Text>
            )}
          </View>
        )}

        {/* Terms and Conditions */}
        <View style={styles.section}>
          <Text style={styles.termsTitle}>Terms and Conditions:</Text>
          <Text style={styles.termsText}>
            1. This quote is valid for 30 days from the date of issue unless otherwise specified.
          </Text>
          <Text style={styles.termsText}>
            2. All prices are in Australian Dollars (AUD) and include GST where specified.
          </Text>
          <Text style={styles.termsText}>
            3. Payment terms: 50% deposit required before work commencement, balance due within 14 days of completion.
          </Text>
          <Text style={styles.termsText}>
            4. Work will be scheduled upon receipt of written acceptance of this quotation.
          </Text>
          <Text style={styles.termsText}>
            5. This quote is based on the information provided and may be subject to change if site conditions differ.
          </Text>
          <Text style={styles.termsText}>
            6. Weather conditions may affect scheduling. We reserve the right to reschedule in case of unsuitable weather.
          </Text>
          <Text style={styles.termsText}>
            7. All work will be carried out in accordance with Australian Standards and local regulations.
          </Text>
          <Text style={styles.termsText}>
            8. Any variations to the scope of work will require a written change order and may affect pricing.
          </Text>
        </View>

        {/* Signature Section */}
        <View style={styles.signatureSection}>
          <View style={styles.signatureBox}>
            <Text style={styles.termsText}>Accepted by (Customer):</Text>
            <View style={styles.signatureLine} />
            <Text style={styles.termsText}>Name: _________________________</Text>
            <Text style={styles.termsText}>Date: __________________________</Text>
          </View>
          
          <View style={styles.signatureBox}>
            <Text style={styles.termsText}>For {companyDetails.name}:</Text>
            <View style={styles.signatureLine} />
            <Text style={styles.termsText}>
              Name: {job.quoted_by_user 
                ? `${job.quoted_by_user.first_name} ${job.quoted_by_user.last_name}` 
                : "____________________"}
            </Text>
            <Text style={styles.termsText}>Date: {quoteDate}</Text>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text>
            {companyDetails.name} | ABN: {companyDetails.abn} | {companyDetails.address} | {companyDetails.phone}
          </Text>
          <Text>Quote #{job.quote_number || job.job_number} | Generated on {format(new Date(), "d MMMM yyyy 'at' h:mm a")}</Text>
        </View>
      </Page>
    </Document>
  );
};

// PDF Viewer component for browser rendering
export const QuotePDFViewer: React.FC<QuotePDFProps> = (props) => {
  return (
    <PDFViewer style={{ width: "100%", height: "80vh" }}>
      <QuotePDF {...props} />
    </PDFViewer>
  );
};

export default QuotePDF;
