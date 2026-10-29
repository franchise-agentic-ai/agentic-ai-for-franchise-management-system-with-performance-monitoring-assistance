export interface SolutionFeature {
  title: string;
  description: string;
  badge?: string;
  iconName: string;
}

export interface SolutionBenefit {
  metric: string;
  label: string;
  description: string;
}

export interface SolutionWorkflowStep {
  step: string;
  title: string;
  description: string;
}

export interface SolutionData {
  id: string;
  slug: string;
  route: string;
  title: string;
  category: string;
  purpose: string;
  heading: string;
  description: string;
  image: string;
  imageAlt: string;
  primaryCta: {
    label: string;
    href: string;
    isExternalOrRoute?: boolean;
  };
  secondaryCta: {
    label: string;
    href: string;
  };
  contentSections: string[];
  features: SolutionFeature[];
  benefits: SolutionBenefit[];
  workflow: {
    title: string;
    subtitle: string;
    steps: SolutionWorkflowStep[];
  };
  telemetryHighlights: {
    metric: string;
    label: string;
    trend: string;
  }[];
  relatedSlugs: string[];
}

export const SOLUTIONS_DATA: Record<string, SolutionData> = {
  'franchise-growth': {
    id: 'franchise-growth',
    slug: 'franchise-growth',
    route: '/solutions/franchise-growth',
    title: 'Franchise Growth Hub',
    category: 'Expansion & Growth Intelligence',
    purpose: 'Help franchise owners expand their business, evaluate new locations, and monitor franchise growth opportunities.',
    heading: 'Scale Your Franchise Network With Data-Driven Intelligence',
    description: 'Empower franchise leadership to identify expansion opportunities, evaluate location performance, track franchisee success, and build a sustainable growth strategy using AI-powered insights.',
    image: '/solutions/franchise-growth.jpg',
    imageAlt: 'Franchise leadership team evaluating multi-unit expansion strategy and market analytics in modern corporate office',
    primaryCta: {
      label: 'Explore Growth Intelligence',
      href: '/dashboard/outlets'
    },
    secondaryCta: {
      label: 'Request a Growth Demo',
      href: '/demo?solution=franchise-growth'
    },
    contentSections: [
      'Franchise expansion planning and opportunity analysis.',
      'New outlet feasibility and location performance evaluation.',
      'Franchisee onboarding and growth tracking.',
      'Revenue trends, profitability insights, and expansion forecasting.',
      'AI-powered recommendations for improving franchise performance.'
    ],
    features: [
      {
        title: 'Franchise Expansion Planning',
        description: 'Analyze market capacity, demographic density, and regional growth readiness to prioritize high-potential territories with minimal cannibalization risk.',
        badge: 'Strategic Growth',
        iconName: 'TrendingUp'
      },
      {
        title: 'New Outlet Feasibility Modeling',
        description: 'Simulate foot traffic, commercial lease rates, local supplier proximity, and competitive pressure to forecast unit payback velocity before signing.',
        badge: 'Site Selection',
        iconName: 'MapPin'
      },
      {
        title: 'Franchisee Onboarding & Ramp Tracking',
        description: 'Streamline the journey from legal franchise disclosure document (FDD) execution to grand opening, tracking buildout milestones and operational readiness.',
        badge: 'Pipeline OS',
        iconName: 'Target'
      },
      {
        title: 'Revenue Trends & Profitability Forecasting',
        description: 'Predict store revenue curves and multi-unit contribution margins with machine learning forecasting based on historical cohort performance.',
        badge: 'Predictive BI',
        iconName: 'LineChart'
      },
      {
        title: 'AI-Powered Unit Performance Optimization',
        description: 'Autonomous agents continuously surface cross-outlet benchmarking, pinpoint lagging margins, and recommend pricing and labor tweaks for each unit.',
        badge: 'Agentic Insights',
        iconName: 'Sparkles'
      },
      {
        title: 'Capital Allocation & Territory Clustering',
        description: 'Group new outlets into synergistic supply hubs and shared supervisor clusters to maximize operational margins and brand density.',
        badge: 'Multi-Unit Scale',
        iconName: 'Building2'
      }
    ],
    benefits: [
      {
        metric: '3.2x',
        label: 'Faster Store Launch Velocity',
        description: 'Accelerate the pipeline from territory reservation to first customer transaction with automated checklists.'
      },
      {
        metric: '+28%',
        label: 'Year-One Franchisee Profitability',
        description: 'Give new franchisees AI-backed pricing, staffing, and local marketing blueprints from day one.'
      },
      {
        metric: '94%',
        label: 'Territory Viability Accuracy',
        description: 'Predict unit profitability within 6% variance using algorithmic demographic and footfall modeling.'
      }
    ],
    workflow: {
      title: 'The Franchise Expansion Engine',
      subtitle: 'From initial territory scoping to sustainable multi-unit operations',
      steps: [
        {
          step: '01',
          title: 'Territory & Demographics Scoping',
          description: 'AI analyzes regional density, purchasing power, and competitor footprint to score top expansion zones.'
        },
        {
          step: '02',
          title: 'Feasibility & Unit Economics Simulation',
          description: 'Run automated pro-forma financial models, rent-to-sales ratios, and projected EBITDA payback curves.'
        },
        {
          step: '03',
          title: 'Franchisee Pipeline & Launch Management',
          description: 'Standardized digital milestones guide lease negotiations, store fit-out, permits, and pre-opening readiness.'
        },
        {
          step: '04',
          title: 'Post-Launch Autonomous Optimization',
          description: 'Live telemetry continuously monitors sales pacing against targets and recommends operational adjustments.'
        }
      ]
    },
    telemetryHighlights: [
      { metric: '45+', label: 'Active Franchise Outlets', trend: '+12% MoM' },
      { metric: '$3.5M', label: 'Network Monthly Gross', trend: '+18.4% YoY' },
      { metric: '14 Days', label: 'Avg Feasibility Review', trend: '-65% faster' }
    ],
    relatedSlugs: ['operations-intelligence', 'sop-playbook', 'compliance-audit', 'team-onboarding']
  },

  'sop-playbook': {
    id: 'sop-playbook',
    slug: 'sop-playbook',
    route: '/solutions/sop-playbook',
    title: 'SOP & Playbook Center',
    category: 'Operational Standardization & Playbooks',
    purpose: 'Centralize standard operating procedures, operational guidelines, training materials, and franchise playbooks.',
    heading: 'Standardize Every Operation Across Every Franchise',
    description: 'Give every outlet access to the right procedures, training resources, and operational guidance. Help teams follow consistent processes while enabling headquarters to update and distribute playbooks centrally.',
    image: '/solutions/sop-playbook.jpg',
    imageAlt: 'Franchise store operations manager reviewing digital standard operating procedures and checklists on tablet in modern restaurant kitchen',
    primaryCta: {
      label: 'Explore SOP Management',
      href: '/dashboard/audits'
    },
    secondaryCta: {
      label: 'View Playbook Features',
      href: '/demo?solution=sop-playbook'
    },
    contentSections: [
      'Centralized SOP and playbook management.',
      'Role-based access for franchise owners, managers, and employees.',
      'Step-by-step operational workflows and checklists.',
      'Training documentation and onboarding resources.',
      'SOP acknowledgment, completion tracking, and version history.',
      'AI-powered assistance for finding relevant operational instructions.'
    ],
    features: [
      {
        title: 'Centralized Playbook Publishing',
        description: 'Publish recipes, kitchen prep standards, customer service guidelines, and equipment manuals with instant zero-delay distribution to every location.',
        badge: 'Single Source of Truth',
        iconName: 'BookOpen'
      },
      {
        title: 'Role-Based Access Governance',
        description: 'Provide personalized views tailored for franchise owners, store general managers, shift leads, and line crew with strict permission boundaries.',
        badge: 'Granular Roles',
        iconName: 'ShieldCheck'
      },
      {
        title: 'Step-by-Step Interactive Checklists',
        description: 'Turn static PDF binders into dynamic shift opening, midday prep, and closing checklists with photo proof and timestamp verification.',
        badge: 'Digital Execution',
        iconName: 'CheckSquare'
      },
      {
        title: 'Multimedia Training & Guides',
        description: 'Embed step-by-step micro-videos, visual dish assembly standards, and interactive troubleshooting guides directly in frontline workflows.',
        badge: 'Rich Media',
        iconName: 'FileText'
      },
      {
        title: 'Mandatory Sign-off & Version Tracking',
        description: 'Track policy acknowledgments across thousands of staff members when critical health, safety, or menu protocols are updated.',
        badge: 'Audit Trail',
        iconName: 'Layers'
      },
      {
        title: 'AI Operational Copilot for Frontline Teams',
        description: 'Staff can ask conversational questions like "How do I recalibrate the commercial fryer?" and receive instant, exact playbook answers.',
        badge: 'Instant AI Search',
        iconName: 'Sparkles'
      }
    ],
    benefits: [
      {
        metric: '99.4%',
        label: 'Recipe & Standard Compliance',
        description: 'Eliminate brand drift and maintain consistent customer satisfaction across all regional franchise stores.'
      },
      {
        metric: '-45%',
        label: 'Frontline Operational Errors',
        description: 'Interactive checklists prevent forgotten cleaning cycles, incorrect storage temps, and missed station prep.'
      },
      {
        metric: '100%',
        label: 'Centrally Synced Policy Rollouts',
        description: 'Deploy new legal guidelines or seasonal recipes to 50+ stores in under 60 seconds with read receipts.'
      }
    ],
    workflow: {
      title: 'How Centralized Playbooks Drive Uniform Quality',
      subtitle: 'From HQ policy revision to store-level shift execution',
      steps: [
        {
          step: '01',
          title: 'HQ Authoring & Version Control',
          description: 'Operations leaders create or edit digital playbooks with video embeds, checklists, and pass/fail criteria.'
        },
        {
          step: '02',
          title: 'Instant Network-Wide Synchronization',
          description: 'Updates publish simultaneously to tablet and POS terminals across all franchise branches with role tags.'
        },
        {
          step: '03',
          title: 'Frontline Shift Execution & Photo Verification',
          description: 'Staff execute required checklist steps, upload visual confirmation, and record critical equipment readings.'
        },
        {
          step: '04',
          title: 'Real-Time HQ Compliance Visibility',
          description: 'Headquarters monitors checklist completion rates, outstanding items, and recurring operational bottlenecks.'
        }
      ]
    },
    telemetryHighlights: [
      { metric: '1,240', label: 'Active Playbook Workflows', trend: 'Network-wide' },
      { metric: '99.4%', label: 'Daily SOP Completion', trend: '+4.2% this quarter' },
      { metric: '< 3s', label: 'AI SOP Search Latency', trend: 'Instant lookup' }
    ],
    relatedSlugs: ['compliance-audit', 'team-onboarding', 'operations-intelligence', 'franchise-growth']
  },

  'operations-intelligence': {
    id: 'operations-intelligence',
    slug: 'operations-intelligence',
    route: '/solutions/operations-intelligence',
    title: 'Operations Intelligence Hub',
    category: 'Real-Time Telemetry & Performance BI',
    purpose: 'Provide real-time operational visibility and AI-powered performance insights across franchise locations.',
    heading: 'Turn Franchise Operations Data Into Actionable Intelligence',
    description: 'Monitor outlet performance, sales trends, inventory movements, workforce productivity, and operational exceptions from one centralized intelligence platform.',
    image: '/solutions/operations-intelligence.jpg',
    imageAlt: 'Franchise Operations Intelligence Hub business intelligence dashboard with live telemetry, outlet comparisons, and inventory analytics',
    primaryCta: {
      label: 'Explore Operations Intelligence',
      href: '/dashboard'
    },
    secondaryCta: {
      label: 'View Dashboard Capabilities',
      href: '/dashboard/intelligence'
    },
    contentSections: [
      'Multi-outlet performance monitoring.',
      'Sales, revenue, cost, and profitability analytics.',
      'Inventory movement and stockout risk detection.',
      'Workforce productivity and staffing insights.',
      'AI-generated performance summaries and recommendations.',
      'Cross-location benchmarking and anomaly detection.',
      'Interactive dashboards with outlet-level drill-downs.'
    ],
    features: [
      {
        title: 'Multi-Outlet Performance Telemetry',
        description: 'Track real-time revenue pacing, hourly sales velocity, average check sizes, and table turns across all franchise units simultaneously.',
        badge: 'Live Telemetry',
        iconName: 'Activity'
      },
      {
        title: 'Unit-Level Profitability & P&L Analytics',
        description: 'Automated revenue, cost-of-goods-sold (COGS), labor cost, and royalty calculations delivered down to individual outlet margins.',
        badge: 'Financial Intelligence',
        iconName: 'BarChart3'
      },
      {
        title: 'Inventory Movement & Stockout Prevention',
        description: 'AI monitors ingredient burn rates, forecasts stockouts 48 hours in advance, and flags supply chain delivery delays before outages occur.',
        badge: 'Supply Chain AI',
        iconName: 'Gauge'
      },
      {
        title: 'Workforce Productivity & Labor Curves',
        description: 'Correlate sales volume with hourly staffing levels to eliminate overstaffing during slow hours and understaffing during peak rushes.',
        badge: 'Labor Optimization',
        iconName: 'Users'
      },
      {
        title: 'Automated AI Performance Digests',
        description: 'Receive morning AI executive summaries highlighting top-performing units, lagging locations, and actionable operational interventions.',
        badge: 'Agentic Summaries',
        iconName: 'Sparkles'
      },
      {
        title: 'Cross-Location Benchmarking & Outlier Detection',
        description: 'Automatically isolate anomalies such as sudden food cost spikes, unexplained discount spikes, or mystery shopper dips.',
        badge: 'Anomaly Radar',
        iconName: 'AlertTriangle'
      }
    ],
    benefits: [
      {
        metric: '18.5%',
        label: 'Reduction in Waste & Stockouts',
        description: 'Predictive inventory replenishment and portion telemetry save thousands in avoidable shrinkage.'
      },
      {
        metric: '12%',
        label: 'Labor Cost Efficiency Gain',
        description: 'Align hourly schedules to predicted sales demand curves to control frontline overtime.'
      },
      {
        metric: 'Real-Time',
        label: 'Multi-Unit Operations Transparency',
        description: 'Replace fragmented end-of-month spreadsheets with continuous live operations dashboards.'
      }
    ],
    workflow: {
      title: 'Continuous Intelligence Loop',
      subtitle: 'How FranchiseOps AI turns raw operational signals into proactive management',
      steps: [
        {
          step: '01',
          title: 'Automated POS, Inventory & Labor Ingestion',
          description: 'Data streams continuously from kitchen displays, point of sale, clock-in terminals, and supplier deliveries.'
        },
        {
          step: '02',
          title: 'Autonomous Multi-Agent Processing',
          description: 'Specialized AI agents calculate unit burn rates, compare cross-store cohorts, and flag statistical variances.'
        },
        {
          step: '03',
          title: 'Contextual Recommendations & Alerts',
          description: 'Area supervisors receive prioritized action prompts with clear revenue and margin impact projections.'
        },
        {
          step: '04',
          title: 'One-Click Action Execution & Outcome Tracking',
          description: 'Managers approve schedule adjustments or order supplies with immediate before-and-after tracking.'
        }
      ]
    },
    telemetryHighlights: [
      { metric: '45 Outlets', label: 'Live Data Feeds', trend: '100% connected' },
      { metric: '98.8%', label: 'Telemetry Uptime', trend: 'Enterprise SLA' },
      { metric: '34 Alerts', label: 'Proactive Fixes Triggered', trend: 'This week' }
    ],
    relatedSlugs: ['franchise-growth', 'compliance-audit', 'sop-playbook', 'team-onboarding']
  },

  'compliance-audit': {
    id: 'compliance-audit',
    slug: 'compliance-audit',
    route: '/solutions/compliance-audit',
    title: 'Compliance & Audit Center',
    category: 'Governance, Food Safety & QA',
    purpose: 'Help franchise organizations maintain operational standards, audit readiness, food safety practices where applicable, and compliance tracking.',
    heading: 'Maintain Compliance and Audit Readiness Across Every Outlet',
    description: 'Simplify operational audits, identify compliance gaps, assign corrective actions, and track resolution progress across your entire franchise network.',
    image: '/solutions/compliance-audit.jpg',
    imageAlt: 'Franchise compliance auditor inspecting restaurant kitchen with digital tablet checklist and compliance score dashboard',
    primaryCta: {
      label: 'Explore Audit Management',
      href: '/dashboard/audits'
    },
    secondaryCta: {
      label: 'Discover Compliance Tools',
      href: '/dashboard/risk-center'
    },
    contentSections: [
      'Digital audit checklists and inspection workflows.',
      'Outlet compliance scores and audit history.',
      'Photo and document evidence collection.',
      'Issue identification, assignment, and resolution tracking.',
      'Corrective and preventive action management.',
      'Compliance deadlines, alerts, and escalation workflows.',
      'AI-assisted identification of recurring audit issues.'
    ],
    features: [
      {
        title: 'Digital Audit Checklists & Inspections',
        description: 'Standardize health inspections, food safety protocols, fire code standards, and brand audit templates into mobile-friendly inspection workflows.',
        badge: 'Mobile Inspections',
        iconName: 'CheckSquare'
      },
      {
        title: 'Outlet Compliance Scoring & Leaderboards',
        description: 'Calculate real-time audit grades (A/B/C/F) with weighted risk scoring and historical trend charts for every franchise location.',
        badge: 'Scoring Engine',
        iconName: 'Award'
      },
      {
        title: 'Photo & Document Evidence Collection',
        description: 'Require geo-verified and timestamped photographic proof for clean stations, temperature log calibration, and critical compliance items.',
        badge: 'Tamper-Proof Proof',
        iconName: 'ShieldCheck'
      },
      {
        title: 'CAPA Corrective Action Workflows',
        description: 'Automatically generate corrective and preventive action tickets when audits fail, assigning accountable managers and remediation deadlines.',
        badge: 'Issue Remediation',
        iconName: 'Workflow'
      },
      {
        title: 'License & Regulatory Escalations',
        description: 'Track municipal food permits, health licenses, and insurance renewals with automated escalation notifications before expiration.',
        badge: 'Automated Escalations',
        iconName: 'AlertTriangle'
      },
      {
        title: 'AI Pattern Recognition for Systemic Defects',
        description: 'Identify if multiple outlets share recurring failures—such as a specific refrigeration vendor or training gap—to fix root causes.',
        badge: 'Root-Cause AI',
        iconName: 'Sparkles'
      }
    ],
    benefits: [
      {
        metric: '100%',
        label: 'Audit Readiness Across Network',
        description: 'Eliminate surprise inspection penalties with continuous digitized self-audits and automated compliance logs.'
      },
      {
        metric: '64%',
        label: 'Faster Resolution of Violations',
        description: 'Corrective action tasks ping managers instantly and require re-inspection photo proof to close.'
      },
      {
        metric: 'Zero',
        label: 'Expired Permits & Licenses',
        description: 'Automated notification pipelines alert regional leadership 60, 30, and 7 days prior to expiry.'
      }
    ],
    workflow: {
      title: 'End-to-End Compliance Governance',
      subtitle: 'From field auditor inspection to closed corrective action',
      steps: [
        {
          step: '01',
          title: 'Scheduled Audit Dispatch & Template Assignment',
          description: 'Audits dispatch automatically on monthly, quarterly, or unannounced cycles with customized scoring weights.'
        },
        {
          step: '02',
          title: 'Field Tablet Inspection with Photo Evidence',
          description: 'Auditors walk the outlet, input temperature checks, and capture timestamped photo documentation.'
        },
        {
          step: '03',
          title: 'Instant Scoring & Auto-CAPA Generation',
          description: 'Audit score calculates immediately. Any non-compliant item creates a high-priority remediation ticket.'
        },
        {
          step: '04',
          title: 'Remediation Sign-off & Executive Dossier',
          description: 'Store manager completes fix, uploads proof, and field director verifies resolution for executive audit records.'
        }
      ]
    },
    telemetryHighlights: [
      { metric: '98.4%', label: 'Average Network Compliance', trend: '+3.1% YoY' },
      { metric: '0', label: 'Critical Open Violations', trend: '100% Resolved' },
      { metric: '48h', label: 'Avg CAPA Closure Time', trend: '-52% vs industry' }
    ],
    relatedSlugs: ['sop-playbook', 'operations-intelligence', 'team-onboarding', 'franchise-growth']
  },

  'team-onboarding': {
    id: 'team-onboarding',
    slug: 'team-onboarding',
    route: '/solutions/team-onboarding',
    title: 'Team Onboarding Hub',
    category: 'Workforce Enablement & Talent Readiness',
    purpose: 'Make employee and franchise team onboarding consistent, organized, and measurable.',
    heading: 'Onboard Every Franchise Team With Confidence',
    description: 'Accelerate employee readiness with structured onboarding workflows, role-specific training, task assignments, and completion tracking across franchise locations.',
    image: '/solutions/team-onboarding.jpg',
    imageAlt: 'Franchise store general manager mentoring a new employee with interactive onboarding tablet checklist and milestone progress tracker',
    primaryCta: {
      label: 'Explore Team Onboarding',
      href: '/dashboard/staff'
    },
    secondaryCta: {
      label: 'View Onboarding Workflow',
      href: '/dashboard/team'
    },
    contentSections: [
      'Employee onboarding checklists and task assignments.',
      'Role-specific learning paths for managers and staff.',
      'Training materials, videos, and operational documentation.',
      'Onboarding progress and completion dashboards.',
      'Manager approvals and outstanding-task reminders.',
      'Team readiness metrics and training compliance.',
      'AI-assisted guidance for frequently asked onboarding questions.'
    ],
    features: [
      {
        title: 'Interactive Onboarding Checklists',
        description: 'Structured day-1 through day-30 milestones covering orientation, food safety certifications, POS training, and store walkthroughs.',
        badge: 'Structured Milestones',
        iconName: 'CheckSquare'
      },
      {
        title: 'Role-Specific Learning Pathways',
        description: 'Tailored pathways for frontline cashiers, kitchen line cooks, shift supervisors, and store general managers with progression gates.',
        badge: 'Targeted Curricula',
        iconName: 'GraduationCap'
      },
      {
        title: 'Multimedia Training & Interactive Quizzes',
        description: 'Bite-sized micro-lessons and video modules with comprehension checks that verify skill retention before station sign-off.',
        badge: 'Micro-Learning',
        iconName: 'FileText'
      },
      {
        title: 'Outlet-Wide Training Dashboards',
        description: 'Live visibility for franchise owners and general managers showing who is certified, who has pending tasks, and store readiness grades.',
        badge: 'Readiness Metrics',
        iconName: 'BarChart3'
      },
      {
        title: 'Manager Verification & Escalation Reminders',
        description: 'Automated reminders ensure store managers conduct 14-day check-ins and final 30-day practical skill evaluations on time.',
        badge: 'Accountability OS',
        iconName: 'UserCheck'
      },
      {
        title: 'AI Frontline Onboarding Assistant',
        description: 'New hires can ask the AI copilot questions about shift dress codes, PTO guidelines, or recipe steps without disrupting busy managers.',
        badge: '24/7 AI Mentor',
        iconName: 'Sparkles'
      }
    ],
    benefits: [
      {
        metric: '60%',
        label: 'Faster Ramp-to-Productivity',
        description: 'New frontline employees reach full operating independence in 8 days instead of 3 weeks.'
      },
      {
        metric: '-35%',
        label: '90-Day Frontline Turnover',
        description: 'Clear expectations, structured mentorship, and positive reinforcement boost early team retention.'
      },
      {
        metric: '100%',
        label: 'Mandatory Training Verification',
        description: 'Zero compliance gaps for critical food handler licenses, OSHA guidelines, and brand standards.'
      }
    ],
    workflow: {
      title: 'Accelerated Franchise Talent Lifecycle',
      subtitle: 'From new hire acceptance to certified frontline contributor',
      steps: [
        {
          step: '01',
          title: 'Digital Welcome & Paperwork',
          description: 'New hire receives mobile-friendly welcome pack, handbook review, and account credentials.'
        },
        {
          step: '02',
          title: 'Role Pathway & Micro-Learning Activation',
          description: 'Employee completes bite-sized modules on POS procedures, customer service standards, and safety.'
        },
        {
          step: '03',
          title: 'In-Store Practical Station Mentorship',
          description: 'Shift lead conducts shadowing sessions and signs off on station checklists directly in the mobile app.'
        },
        {
          step: '04',
          title: 'Certification & Ongoing Continuous Upskilling',
          description: 'Store manager validates full certification; employee unlocks shift scheduling eligibility and advanced badges.'
        }
      ]
    },
    telemetryHighlights: [
      { metric: '85%', label: 'Avg 14-Day Completion', trend: '+18% vs benchmark' },
      { metric: '8 Days', label: 'Avg Ramp to Solo Shift', trend: '-5.5 days saved' },
      { metric: '98.2%', label: 'Food Safety Pass Rate', trend: 'First attempt' }
    ],
    relatedSlugs: ['sop-playbook', 'compliance-audit', 'operations-intelligence', 'franchise-growth']
  }
};
