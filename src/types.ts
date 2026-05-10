export interface Project {
  id: string;
  name: string;
  ownerId: string;
  members: string[];
  createdAt: any;
}

export interface Document {
  id: string;
  projectId: string;
  name: string;
  content: string;
  type: string;
  uploadedBy: string;
  createdAt: any;
}

export interface Agent {
  id: string;
  projectId: string;
  name: string;
  role: string;
  systemInstruction: string;
  isActive: boolean;
  createdAt: any;
}

export interface AuditLog {
  id: string;
  projectId: string;
  agentId?: string;
  userId: string;
  prompt: string;
  response: string;
  riskScore: number;
  complianceStatus: 'COMPLIANT' | 'VIOLATION' | 'WARNING';
  hallucinationDetected?: boolean;
  validationDetails?: string;
  createdAt: any;
}

export interface Policy {
  id: string;
  projectId: string;
  name: string;
  description: string;
  rules: string[];
  severity: 'LOW' | 'MEDIUM' | 'HIGH';
  isActive: boolean;
  createdAt: any;
}

export interface Alert {
  id: string;
  projectId: string;
  logId: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  message: string;
  isRead: boolean;
  createdAt: any;
}
