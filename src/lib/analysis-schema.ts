import { z } from "zod";
import { Schema, SchemaType } from '@google/generative-ai';

// Comprehensive contract type detection
export const zDetectedType = z.enum([
  // Employment & HR
  "Employment", "Independent Contractor", "Consulting Agreement", "Non-Compete Agreement",
  
  // Confidentiality & IP
  "NDA", "Confidentiality Agreement", "IP Assignment", "Trade Secret Agreement",
  
  // Service & Consulting
  "MSA", "Statement of Work", "Consulting Agreement", "Professional Services",
  
  // Technology & Software
  "SaaS", "Software License", "API Agreement", "Cloud Services", "Data Processing Agreement",
  
  // Real Estate
  "Lease Agreement", "Purchase Agreement", "Real Estate Contract", "Property Management",
  
  // Financial & Banking
  "Loan Agreement", "Credit Agreement", "Investment Agreement", "Financial Services",
  
  // Manufacturing & Supply
  "Supply Agreement", "Manufacturing Contract", "Distribution Agreement", "Procurement Contract",
  
  // Healthcare & Medical
  "Medical Services", "Healthcare Agreement", "Clinical Trial Agreement", "Medical Device Contract",
  
  // Education & Training
  "Training Agreement", "Educational Services", "Research Agreement", "Academic Contract",
  
  // Entertainment & Media
  "Content License", "Media Production", "Performance Agreement", "Publishing Contract",
  
  // Transportation & Logistics
  "Transportation Agreement", "Logistics Contract", "Shipping Agreement", "Fleet Management",
  
  // Energy & Utilities
  "Energy Contract", "Utility Agreement", "Renewable Energy", "Power Purchase Agreement",
  
  // Insurance & Risk
  "Insurance Policy", "Reinsurance Agreement", "Risk Management", "Claims Agreement",
  
  // Legal & Compliance
  "Legal Services", "Compliance Agreement", "Regulatory Contract", "Government Contract",
  
  // Partnership & Joint Venture
  "Partnership Agreement", "Joint Venture", "Collaboration Agreement", "Strategic Alliance",
  
  // Other
  "Other"
]);

export const zSeverity = z.enum(["high","medium","low"]);
export const zRisk = z.object({
  type: z.string(),
  severity: zSeverity,
  excerpt: z.string(),
  note: z.string()
});

export const zOpportunity = z.object({
  type: z.string(),
  excerpt: z.string(),
  note: z.string()
});

export const zAnalysis = z.object({
  detected_type: zDetectedType.nullable().optional(), // Allow null/undefined
  clauses: z.object({
    payment: z.object({ amount: z.string().nullable().optional(), schedule: z.string().nullable().optional(), late_fees: z.string().nullable().optional() }),
    liability: z.object({ cap: z.string().nullable().optional(), exclusions: z.string().nullable().optional(), indemnity: z.string().nullable().optional() }),
    termination: z.object({ notice: z.string().nullable().optional(), for_cause: z.string().nullable().optional(), without_cause: z.string().nullable().optional(), auto_renewal: z.boolean().nullable().optional() }),
    confidentiality: z.object({ scope: z.string().nullable().optional(), duration: z.string().nullable().optional(), carve_outs: z.string().nullable().optional() }),
    ip: z.object({ ownership: z.string().nullable().optional(), license: z.string().nullable().optional(), derivatives: z.string().nullable().optional() }),
    law: z.object({ governing_law: z.string().nullable().optional(), jurisdiction: z.string().nullable().optional(), dispute_resolution: z.string().nullable().optional() }),
    renewal: z.object({ term_length: z.string().nullable().optional(), renewal_window: z.string().nullable().optional(), conditions: z.string().nullable().optional() })
  }),
  risks: z.array(zRisk),
  opportunities: z.array(zOpportunity),
  score: z.number().min(0).max(100),
  summary: z.string().nullable().optional(), // Allow null/undefined
  recommendations: z.string().nullable().optional(), // Allow null/undefined
  negotiation_points: z.array(z.string())
});
export type Analysis = z.infer<typeof zAnalysis>;

// Google Generative AI Schema for Gemini
export const analysisJsonSchema: Schema = {
  type: SchemaType.OBJECT,
  properties: {
    detected_type: { 
      type: SchemaType.STRING, 
      description: "Contract type from the comprehensive list. Analyze content carefully to determine the most accurate type. If unsure, use 'Other'." 
    },
    clauses: {
      type: SchemaType.OBJECT,
      properties: {
        payment: { 
          type: SchemaType.OBJECT, 
          properties: { 
            amount: { type: SchemaType.STRING, description: "Payment amount or null if not specified" }, 
            schedule: { type: SchemaType.STRING, description: "Payment schedule or null if not specified" }, 
            late_fees: { type: SchemaType.STRING, description: "Late fee terms or null if not specified" } 
          } 
        },
        liability: { 
          type: SchemaType.OBJECT, 
          properties: { 
            cap: { type: SchemaType.STRING, description: "Liability cap or null if not specified" }, 
            exclusions: { type: SchemaType.STRING, description: "Liability exclusions or null if not specified" }, 
            indemnity: { type: SchemaType.STRING, description: "Indemnity terms or null if not specified" } 
          } 
        },
        termination: { 
          type: SchemaType.OBJECT, 
          properties: { 
            notice: { type: SchemaType.STRING, description: "Termination notice period or null if not specified" }, 
            for_cause: { type: SchemaType.STRING, description: "Termination for cause terms or null if not specified" }, 
            without_cause: { type: SchemaType.STRING, description: "Termination without cause terms or null if not specified" }, 
            auto_renewal: { type: SchemaType.BOOLEAN, description: "Auto-renewal clause or null if not specified" } 
          } 
        },
        confidentiality: { 
          type: SchemaType.OBJECT, 
          properties: { 
            scope: { type: SchemaType.STRING, description: "Confidentiality scope or null if not specified" }, 
            duration: { type: SchemaType.STRING, description: "Confidentiality duration or null if not specified" }, 
            carve_outs: { type: SchemaType.STRING, description: "Confidentiality carve-outs or null if not specified" } 
          } 
        },
        ip: { 
          type: SchemaType.OBJECT, 
          properties: { 
            ownership: { type: SchemaType.STRING, description: "IP ownership terms or null if not specified" }, 
            license: { type: SchemaType.STRING, description: "IP license terms or null if not specified" }, 
            derivatives: { type: SchemaType.STRING, description: "IP derivatives terms or null if not specified" } 
          } 
        },
        law: { 
          type: SchemaType.OBJECT, 
          properties: { 
            governing_law: { type: SchemaType.STRING, description: "Governing law or null if not specified" }, 
            jurisdiction: { type: SchemaType.STRING, description: "Jurisdiction or null if not specified" }, 
            dispute_resolution: { type: SchemaType.STRING, description: "Dispute resolution method or null if not specified" } 
          } 
        },
        renewal: { 
          type: SchemaType.OBJECT, 
          properties: { 
            term_length: { type: SchemaType.STRING, description: "Term length or null if not specified" }, 
            renewal_window: { type: SchemaType.STRING, description: "Renewal window or null if not specified" }, 
            conditions: { type: SchemaType.STRING, description: "Renewal conditions or null if not specified" } 
          } 
        }
      },
      required: ["payment","liability","termination","confidentiality","ip","law","renewal"]
    },
    risks: { 
      type: SchemaType.ARRAY, 
      items: { 
        type: SchemaType.OBJECT, 
        properties: {
          type: { type: SchemaType.STRING, description: "Risk type" }, 
          severity: { type: SchemaType.STRING, description: "Risk severity: high, medium, or low" }, 
          excerpt: { type: SchemaType.STRING, description: "Relevant contract excerpt" }, 
          note: { type: SchemaType.STRING, description: "Risk analysis note" }
        }, 
        required: ["type","severity","excerpt","note"] 
      } 
    },
    opportunities: { 
      type: SchemaType.ARRAY, 
      items: { 
        type: SchemaType.OBJECT, 
        properties: {
          type: { type: SchemaType.STRING, description: "Opportunity type" }, 
          excerpt: { type: SchemaType.STRING, description: "Relevant contract excerpt" }, 
          note: { type: SchemaType.STRING, description: "Opportunity analysis note" }
        }, 
        required: ["type","excerpt","note"] 
      } 
    },
    score: { 
      type: SchemaType.NUMBER, 
      description: "Contract risk score from 0 to 100 (higher is better)" 
    },
    summary: { 
      type: SchemaType.STRING, description: "Brief summary of the contract analysis. If unsure, provide a basic description." 
    },
    recommendations: { 
      type: SchemaType.STRING, description: "Actionable recommendations based on analysis. If unsure, provide general advice." 
    },
    negotiation_points: { 
      type: SchemaType.ARRAY, 
      items: { 
        type: SchemaType.STRING, description: "Key points for negotiation" 
      } 
    }
  },
  required: ["clauses","risks","opportunities","score","negotiation_points"]
}; 