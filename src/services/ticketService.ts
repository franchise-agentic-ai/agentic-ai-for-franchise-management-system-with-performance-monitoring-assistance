/**
 * FranchiseOps AI - Support & Ticket Dispatch Service
 * Handles support tickets, operational complaints, and automated email dispatches
 * to vijaykonakalla2@gmail.com with tenant activity logging.
 */

import { logTenantActivity, getActiveBusiness } from './tenantService';

export interface SupportTicket {
  id: string;
  category: 'Support Ticket' | 'Operational Complaint' | 'Franchise Inquiry' | 'System Bug' | 'Urgent Escalation';
  name: string;
  email: string;
  subject: string;
  priority: 'Low' | 'Medium' | 'High' | 'Urgent';
  description: string;
  businessId: string;
  businessName: string;
  currentPage: string;
  createdAt: string;
  status: 'Submitted' | 'In Review' | 'Dispatched';
}

const TICKETS_KEY = 'franchiseops_support_tickets';
export const TARGET_SUPPORT_EMAIL = 'vijaykonakalla2@gmail.com';

/**
 * Get all stored tickets from local storage
 */
export function getSavedTickets(): SupportTicket[] {
  try {
    const raw = localStorage.getItem(TICKETS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error('Failed to parse support tickets:', e);
    return [];
  }
}

/**
 * Generate formatted professional email content
 */
export function generateTicketEmailContent(ticket: SupportTicket): {
  subject: string;
  body: string;
  mailtoUrl: string;
} {
  const subject = `[FranchiseOps AI - ${ticket.category} #${ticket.id}] [${ticket.priority.toUpperCase()}] ${ticket.subject}`;
  
  const body = 
`=============================================================
FRANCHISEOPS AI - OFFICIAL SUPPORT & COMPLAINT TICKET
=============================================================
Ticket ID:      ${ticket.id}
Category:       ${ticket.category}
Priority Level: ${ticket.priority}
Status:         ${ticket.status}
Timestamp:      ${new Date(ticket.createdAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })} IST

-------------------------------------------------------------
SUBMITTER INFORMATION:
-------------------------------------------------------------
Name:           ${ticket.name}
Email:          ${ticket.email}
Business Entity:${ticket.businessName} (ID: ${ticket.businessId})
Origin Page:    ${ticket.currentPage}

-------------------------------------------------------------
SUBJECT & ISSUE SUMMARY:
-------------------------------------------------------------
${ticket.subject}

-------------------------------------------------------------
DETAILED COMPLAINT / SUPPORT DESCRIPTION:
-------------------------------------------------------------
${ticket.description}

=============================================================
This ticket was created via FranchiseOps AI Autonomous Assistant.
Automated notification routed to: ${TARGET_SUPPORT_EMAIL}
=============================================================`;

  const mailtoUrl = `mailto:${TARGET_SUPPORT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

  return { subject, body, mailtoUrl };
}

/**
 * Submit and dispatch ticket to vijaykonakalla2@gmail.com
 */
export async function submitSupportTicket(data: {
  category: 'Support Ticket' | 'Operational Complaint' | 'Franchise Inquiry' | 'System Bug' | 'Urgent Escalation';
  name: string;
  email: string;
  subject: string;
  priority: 'Low' | 'Medium' | 'High' | 'Urgent';
  description: string;
  currentPage?: string;
}): Promise<{
  ticket: SupportTicket;
  emailContent: { subject: string; body: string; mailtoUrl: string };
}> {
  const business = getActiveBusiness();
  const ticketId = `FO-TKT-${Math.floor(1000 + Math.random() * 9000)}`;

  const newTicket: SupportTicket = {
    id: ticketId,
    category: data.category,
    name: data.name.trim(),
    email: data.email.trim(),
    subject: data.subject.trim(),
    priority: data.priority,
    description: data.description.trim(),
    businessId: business.id,
    businessName: business.name,
    currentPage: data.currentPage || window.location.pathname,
    createdAt: new Date().toISOString(),
    status: 'Submitted',
  };

  // 1. Save to local storage
  const existing = getSavedTickets();
  localStorage.setItem(TICKETS_KEY, JSON.stringify([newTicket, ...existing]));

  // 2. Generate email format
  const emailContent = generateTicketEmailContent(newTicket);

  // 3. Log tenant activity
  logTenantActivity(
    business.id,
    'Franchise Intelligence Engine',
    `New ${newTicket.category} (#${newTicket.id}) created by ${newTicket.name} [${newTicket.priority} Priority]. Routed to ${TARGET_SUPPORT_EMAIL}.`
  );

  // 4. Trigger mailto client in background or popup without interrupting UI
  try {
    const link = document.createElement('a');
    link.href = emailContent.mailtoUrl;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.click();
  } catch (err) {
    console.log('Automated mailto dispatch handled:', err);
  }

  return { ticket: newTicket, emailContent };
}
