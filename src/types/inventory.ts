export type StockHealthStatus = 
  | 'HEALTHY' 
  | 'LOW STOCK' 
  | 'CRITICAL' 
  | 'OUT OF STOCK' 
  | 'OVERSTOCK';

export type StockoutRiskLevel = 
  | 'LOW' 
  | 'MEDIUM' 
  | 'HIGH' 
  | 'CRITICAL';

export type InventoryMovementType = 
  | 'PURCHASE_RECEIPT'
  | 'SALE'
  | 'TRANSFER_IN'
  | 'TRANSFER_OUT'
  | 'RETURN'
  | 'WASTAGE'
  | 'DAMAGE'
  | 'MANUAL_ADJUSTMENT'
  | 'STOCK_COUNT'
  | 'EXPIRY'
  | 'OTHER';

export type PurchaseOrderStatus = 
  | 'DRAFT'
  | 'PENDING_APPROVAL'
  | 'APPROVED'
  | 'ORDERED'
  | 'PARTIALLY_RECEIVED'
  | 'RECEIVED'
  | 'CANCELLED';

export type StockTransferStatus = 
  | 'TRANSFER_REQUEST'
  | 'TRANSFER_APPROVAL'
  | 'TRANSFER_DISPATCH'
  | 'TRANSFER_RECEIPT'
  | 'REJECTED';

export type VarianceReason = 
  | 'Wastage' 
  | 'Damage' 
  | 'Theft' 
  | 'Counting Error' 
  | 'Data Entry Error' 
  | 'Unknown';

export type WastageReason = 
  | 'Kitchen Spoilage'
  | 'Preparation Error'
  | 'Expired Batch'
  | 'Cold Chain Failure'
  | 'Handling Damage'
  | 'Over-portioning'
  | 'Other';

export type SmartReplenishmentAction = 
  | 'NO_ACTION' 
  | 'MONITOR' 
  | 'REORDER' 
  | 'URGENT_REORDER' 
  | 'TRANSFER_FROM_OUTLET';

export interface SupplierItem {
  id: string;
  business_id: string;
  name: string;
  contact_name?: string;
  contact_email?: string;
  contact_phone?: string;
  lead_time_days: number;
  rating: number;
  on_time_delivery_pct?: number;
  average_purchase_cost?: number;
  last_purchase_price?: number;
  status: 'Active' | 'Inactive' | 'Preferred';
  created_at: string;
}

export interface ProductItem {
  id: string;
  business_id: string;
  name: string;
  sku: string;
  category: string;
  unit: string;
  cost_price: number;
  selling_price: number;
  supplier_id?: string;
  supplier_name?: string;
  lead_time_days: number;
  min_safety_stock: number;
  max_stock: number;
  created_at: string;
}

export interface InventoryMovement {
  id: string;
  business_id: string;
  outlet_id: string;
  outlet_name: string;
  product_id: string;
  product_name: string;
  sku?: string;
  movement_type: InventoryMovementType;
  quantity: number; // Positive for additions, negative for deductions
  previous_stock: number;
  new_stock: number;
  unit_cost: number;
  reference_id?: string;
  created_by?: string;
  notes?: string;
  date: string;
  created_at: string;
}

export interface StockLedgerEntry {
  id: string;
  date: string;
  movement_type: InventoryMovementType;
  reference_id?: string;
  notes?: string;
  in_quantity: number;
  out_quantity: number;
  balance_stock: number;
  unit_cost: number;
  total_value: number;
  created_by?: string;
}

export interface ProductStockLedger {
  product_id: string;
  product_name: string;
  sku: string;
  outlet_id: string;
  outlet_name: string;
  opening_stock: number;
  total_purchases: number;
  total_sales: number;
  total_wastage: number;
  total_transfers_in: number;
  total_transfers_out: number;
  total_adjustments: number;
  closing_stock: number;
  derived_stock: number;
  is_reconciled: boolean;
  entries: StockLedgerEntry[];
}

export interface InventoryItemEnhanced {
  id: string;
  business_id: string;
  outlet_id: string;
  outlet_name: string;
  product_id: string;
  product_name: string;
  sku: string;
  category: string;
  current_stock: number;
  min_stock: number;
  max_stock: number;
  reorder_point: number;
  unit_cost: number;
  unit: string;
  supplier: string;
  lead_time_days: number;
  daily_consumption: number;
  waste_qty: number;
  last_restocked: string;
  status: StockHealthStatus;
  days_remaining?: number;
  risk_level?: StockoutRiskLevel;
  risk_score?: number; // 0-100
  open_po_count?: number;
  open_po_quantity?: number;
  incoming_transfer_qty?: number;
}

export interface PurchaseOrderItem {
  id: string;
  product_id: string;
  product_name: string;
  sku: string;
  unit: string;
  quantity_ordered: number;
  quantity_received: number;
  quantity_damaged: number;
  unit_cost: number;
  total_cost: number;
}

export interface PurchaseOrder {
  id: string;
  business_id: string;
  po_number: string;
  supplier_id?: string;
  supplier_name: string;
  outlet_id: string;
  outlet_name: string;
  items: PurchaseOrderItem[];
  total_amount: number;
  status: PurchaseOrderStatus;
  expected_delivery: string;
  created_by: string;
  approved_by?: string;
  received_by?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface GoodsReceiptPayload {
  po_id: string;
  received_by: string;
  invoice_reference?: string;
  notes?: string;
  items: Array<{
    product_id: string;
    quantity_received: number;
    quantity_damaged: number;
  }>;
}

export interface StockTransfer {
  id: string;
  business_id: string;
  transfer_number: string;
  source_outlet_id: string;
  source_outlet_name: string;
  destination_outlet_id: string;
  destination_outlet_name: string;
  product_id: string;
  product_name: string;
  sku: string;
  unit: string;
  quantity: number;
  unit_cost: number;
  status: StockTransferStatus;
  requested_by: string;
  approved_by?: string;
  dispatched_at?: string;
  received_at?: string;
  reason: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface StockCountItem {
  id: string;
  product_id: string;
  product_name: string;
  sku: string;
  unit: string;
  unit_cost: number;
  system_stock: number;
  physical_count: number;
  variance_quantity: number;
  variance_cost: number;
  variance_reason: VarianceReason;
  notes?: string;
}

export interface StockCountSession {
  id: string;
  business_id: string;
  outlet_id: string;
  outlet_name: string;
  session_name: string;
  status: 'IN_PROGRESS' | 'PENDING_APPROVAL' | 'COMPLETED' | 'CANCELLED';
  items: StockCountItem[];
  conducted_by: string;
  approved_by?: string;
  total_variance_cost: number;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface WastageRecord {
  id: string;
  business_id: string;
  outlet_id: string;
  outlet_name: string;
  product_id: string;
  product_name: string;
  sku: string;
  unit: string;
  quantity: number;
  unit_cost: number;
  cost_impact: number;
  reason: WastageReason;
  date: string;
  reported_by: string;
  notes?: string;
  created_at: string;
}

export interface WastageSummary {
  totalWastageUnits: number;
  totalCostImpact: number;
  wastagePercentage: number;
  topLossProducts: Array<{ product_name: string; cost_impact: number; quantity: number; unit: string }>;
  byReasonBreakdown: Array<{ reason: string; cost: number; percentage: number }>;
  trendDirection: 'Increasing' | 'Stable' | 'Decreasing';
  trendChangePct: number;
}

export interface DemandForecastResult {
  product_id: string;
  product_name: string;
  sku: string;
  category: string;
  outlet_id: string;
  outlet_name: string;
  current_stock: number;
  unit: string;
  avg_daily_demand: number;
  demand_7d: number;
  demand_14d: number;
  demand_30d: number;
  recent_velocity: number;
  velocity_change_pct: number;
  demand_trend: 'Increasing' | 'Stable' | 'Decreasing';
  forecasted_demand_7d: number;
  forecasted_demand_30d: number;
  days_remaining: number;
  data_sufficiency: 'Sufficient' | 'Insufficient';
  historical_data_points: number;
  event_uplift_factor: number; // e.g. 1.35 for weekend surge or promo
  methodology_label: string; // e.g. "Statistical Moving Avg + Weekend Surge Factor"
  confidence_score: number;
}

export interface InventoryRiskScoreBreakdown {
  totalScore: number; // 0-100
  riskCategory: StockoutRiskLevel;
  components: {
    depletionUrgency: { score: number; max: number; label: string };
    leadTimeBufferGap: { score: number; max: number; label: string };
    velocitySurge: { score: number; max: number; label: string };
    wastageDrag: { score: number; max: number; label: string };
  };
  explanation: string;
}

export interface StockoutRiskAssessment {
  product_id: string;
  product_name: string;
  sku: string;
  outlet_id: string;
  outlet_name: string;
  current_stock: number;
  unit: string;
  avg_daily_demand: number;
  days_remaining: number;
  supplier_lead_time: number;
  risk_level: StockoutRiskLevel;
  risk_score: number;
  expected_stockout_date: string;
  open_po_cover: boolean;
  incoming_po_qty?: number;
  incoming_po_date?: string;
  transfer_candidate_outlet?: string;
  transfer_available_qty?: number;
  explanation: string;
  suggested_action: SmartReplenishmentAction;
}

export interface ReplenishmentRecommendation {
  id: string;
  business_id: string;
  outlet_id: string;
  outlet_name: string;
  product_id: string;
  product_name: string;
  sku: string;
  unit: string;
  action_type: SmartReplenishmentAction;
  current_stock: number;
  avg_daily_demand: number;
  forecast_demand: number;
  days_remaining: number;
  supplier_lead_time: number;
  supplier: string;
  unit_cost: number;
  safety_stock: number;
  reorder_point: number;
  recommended_quantity: number;
  estimated_cost: number;
  source_outlet_id?: string;
  source_outlet_name?: string;
  open_po_reference?: string;
  open_po_arrival_date?: string;
  risk_level: StockoutRiskLevel;
  priority: 'Critical' | 'High' | 'Medium' | 'Low';
  reason: string;
  status: 'New' | 'Under Review' | 'Approved' | 'Dismissed' | 'Completed';
  created_at: string;
  updated_at: string;
}

export interface InventoryKPIs {
  totalProducts: number;
  totalInventoryValue: number;
  healthyCount: number;
  lowStockCount: number;
  criticalCount: number;
  outOfStockCount: number;
  overstockedCount: number;
  totalReorderCost: number;
  openPOCount: number;
  openPOValue: number;
  pendingTransfersCount: number;
  totalWastageMonthCost: number;
  activeOutletsCount: number;
}

export interface ControlTowerSummary {
  criticalStockoutsCount: number;
  urgentReplenishmentsCount: number;
  transferOpportunitiesCount: number;
  overstockedCount: number;
  incomingDeliveriesToday: number;
  totalTiedCapital: number;
  totalMonthlyLoss: number;
  actionQueue: Array<{
    id: string;
    type: 'STOCKOUT' | 'REPLENISHMENT' | 'TRANSFER' | 'OVERSTOCK' | 'WASTAGE' | 'RECEIPT';
    priority: 'Critical' | 'High' | 'Medium' | 'Low';
    title: string;
    outlet: string;
    details: string;
    actionLabel: string;
    actionType: string;
    payload?: any;
  }>;
}

export interface OutletInventoryComparison {
  outlet_id: string;
  outlet_name: string;
  city: string;
  total_skus: number;
  total_inventory_value: number;
  healthy_count: number;
  low_stock_count: number;
  critical_count: number;
  out_of_stock_count: number;
  overstocked_count: number;
  critical_shortages: Array<{ product_name: string; current_stock: number; days_remaining: number }>;
  excess_items: Array<{ product_name: string; current_stock: number; days_remaining: number; excess_qty: number }>;
}

export interface FastSlowMovingProduct {
  product_id: string;
  product_name: string;
  sku: string;
  category: string;
  outlet_name: string;
  current_stock: number;
  unit: string;
  daily_velocity: number;
  turnover_type: 'Fast Moving' | 'Moderate' | 'Slow Moving' | 'Dead Stock';
  days_remaining: number;
  inventory_value: number;
  recommendation_note: string;
}

export interface InventoryAgentInsight {
  id: string;
  title: string;
  summary: string;
  severity: 'Critical' | 'Warning' | 'Positive' | 'Info';
  category: 'Stockout Risk' | 'Overstock / Waste' | 'Supplier Lead Time' | 'Velocity Surge' | 'Cross-Outlet Transfer' | 'Incoming PO';
  affected_outlets: string[];
  affected_products: string[];
  actionable_step: string;
  timestamp: string;
}

export interface InventoryAuditLogEntry {
  id: string;
  business_id: string;
  outlet_id?: string;
  outlet_name?: string;
  entity_type: 'PURCHASE_ORDER' | 'STOCK_TRANSFER' | 'STOCK_COUNT' | 'WASTAGE' | 'MANUAL_ADJUSTMENT' | 'GOODS_RECEIPT';
  entity_id: string;
  action: string;
  actor_name: string;
  previous_state?: any;
  new_state?: any;
  reason?: string;
  timestamp: string;
}
