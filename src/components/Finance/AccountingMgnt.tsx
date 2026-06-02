import React, { useState, useMemo, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Plus, 
  Search, 
  Filter, 
  FileText, 
  ArrowUpRight, 
  ArrowDownRight,
  MoreHorizontal,
  Calendar,
  X,
  CheckCircle2,
  AlertCircle,
  Clock,
  PieChart,
  User,
  Zap,
  History,
  Wallet,
  ArrowRightLeft,
  Download,
  Lock,
  Unlock,
  Edit2,
  ShieldAlert,
  BadgeCheck,
  FileSpreadsheet,
  FileArchive
} from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { Invoice, Expense, PayrollRecord, OTRecord, Employee, EmployeeAttendanceRecord } from '@/src/types';
import { payrollSyncService } from '@/src/services/payrollSyncService';
import { jsPDF } from 'jspdf';
import JSZip from 'jszip';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Cell,
  LineChart,
  Line,
  AreaChart,
  Area
} from 'recharts';

const mockInvoices: Invoice[] = [
  { id: 'INV-001', studentId: 'ST001', totalAmount: 1200, paidAmount: 1200, status: 'paid', date: '2026-05-01' },
  { id: 'INV-002', studentId: 'ST002', totalAmount: 800, paidAmount: 400, status: 'partial', date: '2026-05-03' },
  { id: 'INV-003', studentId: 'ST003', totalAmount: 1500, paidAmount: 0, status: 'unpaid', date: '2026-05-05' },
  { id: 'INV-004', studentId: 'ST004', totalAmount: 2000, paidAmount: 2000, status: 'paid', date: '2026-05-07' },
];

const mockExpenses: Expense[] = [
  { id: 'EXP-001', category: 'Supplies', amount: 450, date: '2026-05-02', description: 'Office stationery and printer ink', status: 'paid' },
  { id: 'EXP-002', category: 'Utilities', amount: 800, date: '2026-05-04', description: 'Electric and Water bill for April', status: 'paid' },
  { id: 'EXP-003', category: 'Maintenance', amount: 1200, date: '2026-05-06', description: 'AC unit repairs in Block B', status: 'pending' },
  { id: 'EXP-004', category: 'Salaries', amount: 5000, date: '2026-04-30', description: 'Total staff payroll for April', status: 'paid' },
];

const mockEmployees: Employee[] = [
  { id: 'EMP-001', employeeCode: 'ST001', name: 'James Wilson', gender: 'Male', dob: '1985-06-15', positionId: 'Principal', departmentId: 'Admin', status: 'active', contact: '012345678' },
  { id: 'EMP-002', employeeCode: 'ST002', name: 'Sarah Parker', gender: 'Female', dob: '1990-03-22', positionId: 'Senior Teacher', departmentId: 'Faculty', status: 'active', contact: '012998877' },
  { id: 'EMP-003', employeeCode: 'ST003', name: 'Robert Chen', gender: 'Male', dob: '1988-11-05', positionId: 'Librarian', departmentId: 'Auxiliary', status: 'active', contact: '012776655' },
];

const mockOTRecords: OTRecord[] = [
  { id: 'OT-001', employeeId: 'EMP-001', date: '2026-05-05', hours: 4, ratePerByHour: 15, description: 'Final Exam Preparation', status: 'approved' },
  { id: 'OT-002', employeeId: 'EMP-002', date: '2026-05-06', hours: 2, ratePerByHour: 10, description: 'Evening Class Cover', status: 'pending' },
];

const mockPayroll: PayrollRecord[] = [
  { id: 'PAY-001', employeeId: 'EMP-001', month: '2026-05', baseSalary: 2500, otPay: 60, bonus: 200, allowance: 100, deductions: 50, netSalary: 2810, status: 'draft' },
  { id: 'PAY-002', employeeId: 'EMP-002', month: '2026-05', baseSalary: 1800, otPay: 20, bonus: 0, allowance: 50, deductions: 20, netSalary: 1850, status: 'draft' },
];

const mockAttendance: EmployeeAttendanceRecord[] = [
  { id: 'ATT-001', employeeId: 'EMP-001', date: '2026-05-08', status: 'present', checkIn: '08:00', checkOut: '17:00' },
  { id: 'ATT-002', employeeId: 'EMP-002', date: '2026-05-08', status: 'absent', note: 'Medical Leave' },
  { id: 'ATT-003', employeeId: 'EMP-003', date: '2026-05-08', status: 'late', checkIn: '08:45', checkOut: '17:15' },
];

const chartData = [
  { name: 'Jan', income: 12000, expense: 8000 },
  { name: 'Feb', income: 15000, expense: 9500 },
  { name: 'Mar', income: 11000, expense: 10000 },
  { name: 'Apr', income: 18000, expense: 12000 },
  { name: 'May', income: 5500, expense: 7450 },
];

const generateEmployeePaySlipPDF = (rec: PayrollRecord, emp: Employee) => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });
  
  // Outer Border for professional touch
  doc.setDrawColor(203, 213, 225); // slate-300
  doc.setLineWidth(0.5);
  doc.rect(10, 10, 190, 277);

  // Top header banner - Elegant Slate-900 Gradient style
  doc.setFillColor(15, 23, 42); // slate-900
  doc.rect(10, 10, 190, 45, 'F');

  // School name & title
  doc.setTextColor(255, 255, 255);
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(18);
  doc.text("EDUPULSE ACADEMY", 20, 25);
  
  doc.setFontSize(10);
  doc.setFont('Helvetica', 'bold');
  doc.setTextColor(147, 51, 234); // purple-400
  doc.text("CONFIDENTIAL INDIVIDUAL SALARY REPORT", 20, 32);

  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(203, 213, 225); // slate-300
  doc.text("Address: 100 Knowledge Blvd, Education District", 20, 38);
  doc.text("Tel: (555) 019-9883  |  Email: hr@edupulse.edu", 20, 43);

  // Status and Period badge in the header block
  doc.setFillColor(30, 41, 59); // slate-800
  doc.rect(140, 18, 50, 24, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(8);
  doc.text("PAYROLL PERIOD", 145, 24);
  doc.setFontSize(11);
  doc.setTextColor(234, 179, 8); // amber-500
  doc.text("MAY 2026", 145, 30);
  doc.setFontSize(8);
  doc.setTextColor(255, 255, 255);
  doc.text(`STATUS: ${String(rec.status).toUpperCase()}`, 145, 36);

  // Employee Information Segment
  doc.setFillColor(248, 250, 252); // slate-50
  doc.rect(15, 65, 180, 40, 'F');
  doc.setDrawColor(226, 232, 240); // slate-200
  doc.setLineWidth(0.3);
  doc.rect(15, 65, 180, 40, 'D');

  doc.setTextColor(71, 85, 105); // slate-600
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(9);
  doc.text("RECIPIENT & DESIGNATION DETAIL", 20, 72);
  
  // Left side info
  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(15, 23, 42); // slate-900
  doc.text(`Name:`, 20, 80);
  doc.setFont('Helvetica', 'bold');
  doc.text(`${emp.name}`, 45, 80);

  doc.setFont('Helvetica', 'normal');
  doc.text(`Employee ID:`, 20, 87);
  doc.setFont('Helvetica', 'bold');
  doc.text(`${emp.employeeCode || emp.id}`, 45, 87);

  doc.setFont('Helvetica', 'normal');
  doc.text(`Department:`, 20, 94);
  doc.setFont('Helvetica', 'bold');
  doc.text(`${emp.departmentId || 'Staff'}`, 45, 94);

  // Right side info
  doc.setFont('Helvetica', 'normal');
  doc.text(`Position:`, 110, 80);
  doc.setFont('Helvetica', 'bold');
  doc.text(`${emp.positionId}`, 135, 80);

  doc.setFont('Helvetica', 'normal');
  doc.text(`Contact:`, 110, 87);
  doc.setFont('Helvetica', 'bold');
  doc.text(`${emp.contact || 'N/A'}`, 135, 87);

  doc.setFont('Helvetica', 'normal');
  doc.text(`Release Method:`, 110, 94);
  doc.setFont('Helvetica', 'bold');
  doc.text("Direct Bank Transfer", 135, 94);

  // Table header for Payslip Components
  doc.setFillColor(15, 23, 42); // slate-900
  doc.rect(15, 115, 180, 8, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.text("COMPENSATION & EARNING COMPONENT", 20, 120.5);
  doc.text("EARNINGS", 100, 120.5);
  doc.text("DEDUCTIONS / PENALTIES", 145, 120.5);

  // Table items rows
  let y = 132;
  const drawRow = (label: string, earning: string, deduction: string, isAccent: boolean = false) => {
    if (isAccent) {
      doc.setFillColor(241, 245, 249); // slate-100
      doc.rect(15, y - 5, 180, 7.5, 'F');
    }
    doc.setTextColor(15, 23, 42);
    doc.setFont('Helvetica', isAccent ? 'bold' : 'normal');
    doc.setFontSize(8.5);
    doc.text(label, 20, y);
    
    if (earning) {
      doc.setTextColor(16, 185, 129); // emerald-500
      doc.text(earning, 100, y);
    }
    
    if (deduction) {
      doc.setTextColor(239, 68, 68); // rose-500
      doc.text(deduction, 145, y);
    }
    
    // separator line
    doc.setDrawColor(241, 245, 249);
    doc.line(15, y + 2.5, 195, y + 2.5);
    y += 9.5;
  };

  // Base Pay
  drawRow("Basic Approved Salary", `$${rec.baseSalary.toLocaleString()}`, "");
  
  // Overtime Pay
  drawRow("Overtime Hours Compensation", rec.otPay > 0 ? `$${rec.otPay.toLocaleString()}` : "$0", "");

  // Bonuses
  drawRow("Extra Incentive & Bonuses", rec.bonus > 0 ? `$${rec.bonus.toLocaleString()}` : "$0", "");

  // Allowances
  drawRow("Assigned Resource Allowances", rec.allowance > 0 ? `$${rec.allowance.toLocaleString()}` : "$0", "");

  // Absences Deductions
  drawRow("Tardiness & Lateness Deductions", "", rec.deductions > 0 ? `-$${rec.deductions.toLocaleString()}` : "$0");

  y += 5;

  // Totals calculations block
  doc.setFillColor(248, 250, 252); // slate-50
  doc.rect(15, y, 180, 30, 'F');
  doc.setDrawColor(226, 232, 240); // slate-200
  doc.rect(15, y, 180, 30, 'D');

  doc.setTextColor(71, 85, 105);
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(8);
  doc.text("TOTAL ACCUMULATED GROSS EARNINGS", 20, y + 8);
  doc.setTextColor(16, 185, 129);
  doc.setFontSize(10);
  const gross = rec.baseSalary + rec.otPay + rec.bonus + rec.allowance;
  doc.text(`$${gross.toLocaleString()}`, 20, y + 16);

  doc.setTextColor(71, 85, 105);
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(8);
  doc.text("TOTAL ACCUMULATED DEDUCTIONS", 90, y + 8);
  doc.setTextColor(239, 68, 68);
  doc.setFontSize(10);
  doc.text(`-$${rec.deductions.toLocaleString()}`, 90, y + 16);

  doc.setTextColor(15, 23, 42);
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(9);
  doc.text("NET SALARY DISBURSED", 145, y + 8);
  doc.setTextColor(37, 99, 235); // blue-600
  doc.setFontSize(13);
  doc.text(`$${rec.netSalary.toLocaleString()}`, 145, y + 17);

  // Security Note & Notice
  y += 42;
  doc.setFillColor(254, 252, 232); // amber-50
  doc.rect(15, y, 180, 16, 'F');
  doc.setDrawColor(254, 240, 138); // amber-200
  doc.rect(15, y, 180, 16, 'D');
  
  doc.setTextColor(133, 77, 14); // amber-800
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.text("CONFIDENTIALITY & TAX AUDIT DISCLOSURE NOTICE", 18, y + 5);
  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(7);
  doc.text("This document constitutes a confidential private record of monthly work value compensation.", 18, y + 9);
  doc.text("Keep this statement privately for your personal annual tax reports and legal declarations.", 18, y + 12);

  // Signatures Panel
  y += 28;
  doc.setDrawColor(203, 213, 225);
  doc.line(18, y + 10, 75, y + 10);
  doc.line(135, y + 10, 192, y + 10);

  doc.setTextColor(115, 115, 115);
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.text("Prepared by school HR Manager", 18, y + 14);
  doc.text("Authorized by board of directors", 135, y + 14);

  // Date and stamp space
  doc.setFont('Helvetica', 'italic');
  doc.setFontSize(6.5);
  doc.text(`Processed securely via EduPulse Financial System (C.No: EP-9981-M) at ${new Date().toLocaleString()}`, 15, 280);

  return doc;
};

function AnimatedValue({ value, isCurrency = true }: { value: number; isCurrency?: boolean }) {
  const [highlight, setHighlight] = useState(false);
  const prevValue = useRef(value);

  useEffect(() => {
    if (prevValue?.current !== undefined && prevValue.current !== value) {
      setHighlight(true);
      const timer = setTimeout(() => setHighlight(false), 800);
      return () => clearTimeout(timer);
    }
  }, [value]);

  useEffect(() => {
    prevValue.current = value;
  }, [value]);

  return (
    <span className={cn(
      "transition-all duration-500 ease-out inline-block font-bold",
      highlight ? "text-blue-600 scale-110 bg-blue-100/80 px-1 py-0.5 rounded shadow-sm animate-pulse" : ""
    )}>
      {isCurrency ? `$${value.toLocaleString()}` : value}
    </span>
  );
}

const historicalPayrollData: Record<string, number> = {
  'EMP-001': 2400, // James Wilson previous month net salary
  'EMP-002': 1850, // Sarah Parker previous month
  'EMP-003': 1500, // Robert Chen
};

export function AccountingMgnt() {
  const [activeTab, setActiveTab] = useState<'overview' | 'income' | 'expenses' | 'payroll' | 'attendance'>('overview');
  const [payrollSubTab, setPayrollSubTab] = useState<'register' | 'audit' | 'deduction-audit'>('register');
  const [editingPayrollRecord, setEditingPayrollRecord] = useState<PayrollRecord | null>(null);
  const [editForm, setEditForm] = useState<{ baseSalary: number; bonus: number; allowance: number; deductions: number; netSalary: number } | null>(null);
  const [invoices, setInvoices] = useState<Invoice[]>(mockInvoices);
  const [expenses, setExpenses] = useState<Expense[]>(mockExpenses);
  const [payroll, setPayroll] = useState<PayrollRecord[]>(mockPayroll);
  const [attendance, setAttendance] = useState<EmployeeAttendanceRecord[]>(mockAttendance);
  const [otRecords, setOtRecords] = useState<OTRecord[]>(mockOTRecords);
  const [employees, setEmployees] = useState<Employee[]>(mockEmployees);
  const [isAddingExpense, setIsAddingExpense] = useState(false);
  const [isAddingPayroll, setIsAddingPayroll] = useState(false);
  const [auditSearchQuery, setAuditSearchQuery] = useState('');
  const [auditStartDate, setAuditStartDate] = useState('');
  const [auditEndDate, setAuditEndDate] = useState('');

  const filteredAttendance = useMemo(() => {
    return attendance.filter(record => {
      if (auditStartDate && record.date < auditStartDate) return false;
      if (auditEndDate && record.date > auditEndDate) return false;
      return true;
    });
  }, [attendance, auditStartDate, auditEndDate]);

  const [payrollNotification, setPayrollNotification] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);

  const triggerToast = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(prev => prev && prev.message === message ? null : prev);
    }, 5000);
  };

  const [selectedPayrollIds, setSelectedPayrollIds] = useState<string[]>([]);
  const [isConfirmingPublish, setIsConfirmingPublish] = useState(false);
  const [isExplicitlyChecked, setIsExplicitlyChecked] = useState(false);
  
  const [newExpense, setNewExpense] = useState<Partial<Expense>>({
    category: 'Operational',
    amount: 0,
    date: new Date().toISOString().split('T')[0],
    description: '',
    status: 'pending'
  });

  const totalIncome = useMemo(() => invoices.reduce((sum, inv) => sum + inv.paidAmount, 0), [invoices]);
  const totalExpenditure = useMemo(() => expenses.reduce((sum, exp) => sum + exp.amount, 0), [expenses]);
  const totalSalaries = useMemo(() => payroll.reduce((sum, pay) => sum + pay.netSalary, 0), [payroll]);
  
  const totalCombinedExpense = totalExpenditure + totalSalaries;
  const netProfit = totalIncome - totalCombinedExpense;

  const otStats = useMemo(() => {
    const totalHours = otRecords.reduce((sum, ot) => sum + ot.hours, 0);
    const totalCost = otRecords.reduce((sum, ot) => sum + (ot.hours * (ot.ratePerByHour || 15)), 0);
    const pendingCount = otRecords.filter(ot => ot.status === 'pending').length;
    return { totalHours, totalCost, pendingCount };
  }, [otRecords]);

  const attendanceStats = useMemo(() => {
    const total = attendance.length;
    if (total === 0) return { onTimeRate: 0, lates: 0, absences: 0 };
    const lates = attendance.filter(a => a.status === 'late').length;
    const absences = attendance.filter(a => a.status === 'absent').length;
    const presents = attendance.filter(a => a.status === 'present').length;
    const onTimeRate = ((presents / total) * 100).toFixed(1);
    return { onTimeRate, lates, absences };
  }, [attendance]);

  // --- Payroll Summary, Sync Service, and Exports ---
  const projectedSummary = useMemo(() => {
    let totalPendingOTHours = 0;
    let totalPendingOTPay = 0;
    let totalDraftNetSalary = 0;
    let totalProjectedNetSalary = 0;
    
    const projections = payroll.map(pay => {
      const emp = employees.find(e => e.id === pay.employeeId || e.employeeCode === pay.employeeId);
      
      // Find matching pending OT records
      const pendingOTs = otRecords.filter(ot => ot.employeeId === pay.employeeId && ot.status === 'pending');
      const pendingOTPayForEmp = pendingOTs.reduce((sum, ot) => sum + ot.hours * (ot.ratePerByHour || 15), 0);
      const pendingOTHoursForEmp = pendingOTs.reduce((sum, ot) => sum + ot.hours, 0);
      
      totalPendingOTHours += pendingOTHoursForEmp;
      totalPendingOTPay += pendingOTPayForEmp;
      totalDraftNetSalary += pay.netSalary;
      totalProjectedNetSalary += pay.netSalary + pendingOTPayForEmp;
      
      return {
        id: pay.id,
        employeeId: pay.employeeId,
        name: emp?.name || 'Unknown Staff',
        position: emp?.positionId || 'Staff',
        department: emp?.departmentId || 'Unassigned',
        baseSalary: pay.baseSalary,
        otPay: pay.otPay,
        draftNetSalary: pay.netSalary,
        pendingOTHours: pendingOTHoursForEmp,
        pendingOTPay: pendingOTPayForEmp,
        projectedNetSalary: pay.netSalary + pendingOTPayForEmp,
        status: pay.status
      };
    });
    
    return {
      projections,
      totalPendingOTHours,
      totalPendingOTPay,
      totalDraftNetSalary,
      totalProjectedNetSalary
    };
  }, [payroll, otRecords, employees]);

  const handleSyncAttendance = () => {
    const updatedPayroll = payrollSyncService.syncAttendanceToPayroll(payroll, attendance, employees);
    setPayroll(updatedPayroll);
    setPayrollNotification("Staff attendance synced successfully! Overnight hour calculations and lateness deductions have been automatically computed onto May draft records.");
    triggerToast("Payroll sync service has finished recalculating all staff salary records.");
    setTimeout(() => setPayrollNotification(null), 6000);
  };

  const handleApprovePendingOTAndPublish = () => {
    // Approve all pending OT records
    const updatedOTRecords = otRecords.map(ot => {
      if (ot.status === 'pending') {
        return { ...ot, status: 'approved' as const };
      }
      return ot;
    });
    setOtRecords(updatedOTRecords);

    // Apply pending OT to payroll and set status to published
    const updatedPayroll = payroll.map(pay => {
      const pendingOTs = otRecords.filter(ot => ot.employeeId === pay.employeeId && ot.status === 'pending');
      const pendingOTPayForEmp = pendingOTs.reduce((sum, ot) => sum + ot.hours * (ot.ratePerByHour || 15), 0);

      const baseSalary = pay.baseSalary;
      const otPay = pay.otPay + pendingOTPayForEmp;
      const deductions = pay.deductions;
      const allowance = pay.allowance;
      const bonus = pay.bonus;
      const netSalary = baseSalary + otPay + bonus + allowance - deductions;

      return {
        ...pay,
        otPay,
        netSalary,
        status: 'published' as const
      };
    });

    setPayroll(updatedPayroll);
    setPayrollNotification("All active pending Overtime demands have been Approved, and the draft Payroll has been successfully finalized & Published!");
    setTimeout(() => setPayrollNotification(null), 6000);
  };

  const handleBatchExportPDF = () => {
    // Get unique departments from employees
    const uniqueDepts = Array.from(new Set(employees.map(e => e.departmentId || 'Unassigned')));
    
    uniqueDepts.forEach(dept => {
      const deptStr = String(dept);
      // Find employees of this department
      const deptEmps = employees.filter(e => e.departmentId === dept);
      const deptEmpIds = deptEmps.map(e => e.id);
      
      // Filter payroll records
      const deptPayroll = payroll.filter(p => deptEmpIds.includes(p.employeeId));
      
      if (deptPayroll.length === 0) return;

      const doc = new jsPDF();
      
      // Header Style - Elegant Dark Slate
      doc.setFillColor(15, 23, 42); // slate-900
      doc.rect(0, 0, 210, 42, 'F');
      
      doc.setTextColor(255, 255, 255);
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(15);
      doc.text("EDUPULSE ACADEMY PAYROLL LEDGER", 15, 18);
      
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(147, 51, 234); // purple-600
      doc.text(`CONFIDENTIAL HUMAN RESOURCE DESIGNATION`, 15, 26);

      doc.setFont('Helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(203, 213, 225); // slate-300
      doc.text(`DEPARTMENT: ${deptStr.toUpperCase()} • PERIOD: MAY 2026`, 15, 33);
      
      doc.setFont('Courier', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(255, 255, 255);
      doc.text(`GENERATED: ${new Date().toLocaleDateString()}`, 155, 18);
      doc.text(`STATUS: ACTIVE`, 155, 24);

      // Metrics block
      doc.setFillColor(248, 250, 252); // slate-50
      doc.rect(15, 50, 180, 24, 'F');
      doc.setDrawColor(226, 232, 240); // slate-200
      doc.rect(15, 50, 180, 24, 'D');

      doc.setTextColor(15, 23, 42);
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(9);
      doc.text(`DEPARTMENT HR BREAKDOWN`, 20, 56);

      const totalBase = deptPayroll.reduce((sum, r) => sum + r.baseSalary, 0);
      const totalOT = deptPayroll.reduce((sum, r) => sum + r.otPay, 0);
      const totalDed = deptPayroll.reduce((sum, r) => sum + r.deductions, 0);
      const totalNet = deptPayroll.reduce((sum, r) => sum + r.netSalary, 0);

      doc.setFont('Helvetica', 'normal');
      doc.setFontSize(8);
      doc.text(`Staff Count: ${deptPayroll.length}`, 20, 62);
      doc.text(`Base Total: $${totalBase.toLocaleString()}`, 20, 68);
      
      doc.text(`Calculated OT Pay: $${totalOT.toLocaleString()}`, 100, 62);
      doc.text(`Total Deductions: -$${totalDed.toLocaleString()}`, 100, 68);
      
      doc.setFont('Helvetica', 'bold');
      doc.setTextColor(37, 99, 235); // blue-600
      doc.text(`Dept Outlay: $${totalNet.toLocaleString()}`, 150, 65);

      // Header row
      doc.setFillColor(241, 245, 249); // slate-100
      doc.rect(15, 82, 180, 8, 'F');
      
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(7.5);
      doc.setTextColor(71, 85, 105); // slate-600
      doc.text("STAFF MEMBER / ROLE", 18, 87);
      doc.text("BASE", 75, 87);
      doc.text("OT PAY", 95, 87);
      doc.text("BONUS/ALLOW", 115, 87);
      doc.text("DEDUCTIONS", 145, 87);
      doc.text("NET SALARY", 175, 87);

      let currentY = 96;
      doc.setFont('Helvetica', 'normal');
      
      deptPayroll.forEach(rec => {
        const emp = deptEmps.find(e => e.id === rec.employeeId);
        const nameLabel = `${emp?.name || 'Unknown'}`;
        const posLabel = `${emp?.positionId || 'Staff'}`;

        doc.setFont('Helvetica', 'bold');
        doc.setFontSize(8);
        doc.setTextColor(15, 23, 42);
        doc.text(nameLabel, 18, currentY);
        doc.setFont('Helvetica', 'normal');
        doc.setFontSize(7);
        doc.setTextColor(115, 115, 115);
        doc.text(posLabel, 18, currentY + 4);

        doc.setFont('Courier', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(30, 41, 59);
        doc.text(`$${rec.baseSalary}`, 75, currentY + 2);
        doc.text(`$${rec.otPay}`, 95, currentY + 2);
        doc.text(`$${rec.bonus + rec.allowance}`, 115, currentY + 2);
        
        doc.setTextColor(239, 68, 68); // rose-500
        doc.text(`-$${rec.deductions}`, 145, currentY + 2);
        
        doc.setTextColor(37, 99, 235); // blue-600
        doc.setFont('Helvetica', 'bold');
        doc.text(`$${rec.netSalary}`, 175, currentY + 2);

        // separator line
        doc.setDrawColor(241, 245, 249);
        doc.line(15, currentY + 6.5, 195, currentY + 6.5);
        currentY += 10;
      });

      // Footer
      doc.setFont('Helvetica', 'italic');
      doc.setFontSize(7);
      doc.setTextColor(156, 163, 175);
      doc.text("Confidential human resource auditing system. Generates separate department journals dynamically.", 15, 285);
      
      doc.save(`Payroll_${deptStr.replace(/\s+/g, '_')}_May2026.pdf`);
    });

    setPayrollNotification(`Batch PDF Export Successful: Transmitted separate PDF files for each department.`);
    setTimeout(() => setPayrollNotification(null), 6000);
  };

  const handleBatchExportCSV = () => {
    const uniqueDepts = Array.from(new Set(employees.map(e => e.departmentId || 'Unassigned')));
    
    uniqueDepts.forEach(dept => {
      const deptStr = String(dept);
      const deptEmps = employees.filter(e => e.departmentId === dept);
      const deptEmpIds = deptEmps.map(e => e.id);
      const deptPayroll = payroll.filter(p => deptEmpIds.includes(p.employeeId));
      
      if (deptPayroll.length === 0) return;

      const headers = ['Record ID', 'Employee Name', 'Role', 'Department', 'Base Salary', 'OT Pay', 'Allowance', 'Bonus', 'Deductions', 'Net Salary', 'Month', 'Status'];
      const rows = deptPayroll.map(rec => {
        const emp = deptEmps.find(e => e.id === rec.employeeId);
        return [
          rec.id,
          `"${emp?.name || 'Unknown'}"`,
          `"${emp?.positionId || 'Staff'}"`,
          `"${deptStr}"`,
          rec.baseSalary,
          rec.otPay,
          rec.allowance,
          rec.bonus,
          rec.deductions,
          rec.netSalary,
          rec.month,
          rec.status
        ];
      });

      const csvContent = "data:text/csv;charset=utf-8," 
        + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
      
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `Payroll_CSV_${deptStr.replace(/\s+/g, '_')}_May2026.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    });

    setPayrollNotification(`Batch CSV Export Successful: Discharged separate CSV documents for each department.`);
    setTimeout(() => setPayrollNotification(null), 6000);
  };

  const handleBatchExportZIP = (deptId: string) => {
    const zip = new JSZip();
    
    // Find employees of this department
    const deptEmps = employees.filter(e => e.departmentId === deptId);
    if (deptEmps.length === 0) {
      setPayrollNotification(`No employees found in ${deptId} department to package.`);
      setTimeout(() => setPayrollNotification(null), 4000);
      return;
    }

    let fileCount = 0;
    deptEmps.forEach(emp => {
      const rec = payroll.find(p => p.employeeId === emp.id || p.employeeId === emp.employeeCode);
      if (rec) {
        // Generate beautiful single slip PDF
        const doc = generateEmployeePaySlipPDF(rec, emp);
        const arrayBuffer = doc.output('arraybuffer');
        const fileName = `${deptId}_${emp.name.replace(/\s+/g, '_')}_Payslip_May2026.pdf`;
        zip.file(fileName, arrayBuffer);
        fileCount++;
      }
    });

    if (fileCount === 0) {
      setPayrollNotification(`No payroll records matched for ${deptId} department.`);
      setTimeout(() => setPayrollNotification(null), 4000);
      return;
    }

    setPayrollNotification(`Compiling ${fileCount} slips into ZIP for ${deptId}...`);

    zip.generateAsync({ type: 'blob' }).then(blob => {
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Payroll_ZIP_${deptId.replace(/\s+/g, '_')}_May2026.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      setPayrollNotification(`Batch ZIP Successful: Downloaded separate individual PDF statements for ${deptId} (${fileCount} files)`);
      setTimeout(() => setPayrollNotification(null), 6000);
    }).catch(err => {
      console.error(err);
      setPayrollNotification(`ZIP generation failed: ${err.message}`);
    });
  };

  const handleDownloadSingleSlip = (rec: PayrollRecord, emp: Employee) => {
    const doc = generateEmployeePaySlipPDF(rec, emp);
    doc.save(`${emp.name.replace(/\s+/g, '_')}_Payslip_May2026.pdf`);
    setPayrollNotification(`Downloaded individual payslip PDF for ${emp.name} successfully.`);
    setTimeout(() => setPayrollNotification(null), 4000);
  };

  const handleSimulateAttendancePenalty = (empId: string, status: 'late' | 'absent') => {
    const dateNum = Math.floor(Math.random() * 28) + 1;
    const dateStr = `2026-05-${String(dateNum).padStart(2, '0')}`;
    const newRec: EmployeeAttendanceRecord = {
      id: `SIM-ATT-${Math.floor(Math.random() * 100000)}`,
      employeeId: empId,
      date: dateStr,
      status,
      checkIn: status === 'late' ? '08:45' : undefined,
      checkOut: status === 'late' ? '17:00' : undefined,
      note: 'Admin Simulated Audit Increment'
    };
    
    const updatedAttendance = [newRec, ...attendance];
    setAttendance(updatedAttendance);
    
    const synced = payrollSyncService.syncAttendanceToPayroll(payroll, updatedAttendance, employees);
    setPayroll(synced);
    setPayrollNotification(`Simulated additional ${status === 'late' ? 'Late Arrival (-$10)' : 'Unplanned Absence (-$50)'} for May 2026. Payroll net salary re-calculated instantly!`);
    triggerToast("Payroll sync service has finished recalculating all staff salary records.");
    setTimeout(() => setPayrollNotification(null), 4000);
  };

  const handleSimulateOTIncrease = (empId: string) => {
    const dateNum = Math.floor(Math.random() * 28) + 1;
    const dateStr = `2026-05-${String(dateNum).padStart(2, '0')}`;
    const newOT: OTRecord = {
      id: `SIM-OT-${Math.floor(Math.random() * 100000)}`,
      employeeId: empId,
      date: dateStr,
      hours: 2,
      ratePerByHour: 20,
      description: 'Simulated Extra Work Shift',
      status: 'approved'
    };
    
    const updatedOTRecords = [newOT, ...otRecords];
    setOtRecords(updatedOTRecords);

    const synced = payroll.map(p => {
      if (p.employeeId === empId) {
        const addedOTPay = 2 * 20; 
        const newOTPay = p.otPay + addedOTPay;
        const newNet = p.baseSalary + newOTPay + p.bonus + p.allowance - p.deductions;
        return {
          ...p,
          otPay: newOTPay,
          netSalary: newNet
        };
      }
      return p;
    });
    setPayroll(synced);
    setPayrollNotification(`Simulated +2 Overtime Hours at Premium $20/hr rate for employee. Paycheck calculated live!`);
    triggerToast("Payroll sync service has finished recalculating all staff salary records.");
    setTimeout(() => setPayrollNotification(null), 4000);
  };

  const handleResetAttendanceSimulations = (empId: string) => {
    const filteredAttendance = attendance.filter(a => !(a.employeeId === empId && a.id.startsWith('SIM-')));
    setAttendance(filteredAttendance);
    
    const filteredOT = otRecords.filter(ot => !(ot.employeeId === empId && ot.id.startsWith('SIM-')));
    setOtRecords(filteredOT);

    const synced = payrollSyncService.syncAttendanceToPayroll(mockPayroll, filteredAttendance, employees);
    setPayroll(synced);

    setPayrollNotification(`Restored employee's attendance logs back to authentic work statistics.`);
    triggerToast("Payroll sync service has finished recalculating all staff salary records.");
    setTimeout(() => setPayrollNotification(null), 4000);
  };

  const handleAddExpense = () => {
    if (!newExpense.amount || !newExpense.description) return;
    const expense: Expense = {
      id: `EXP-${Math.floor(Math.random() * 10000)}`,
      category: newExpense.category || 'Other',
      amount: newExpense.amount,
      date: newExpense.date || new Date().toISOString().split('T')[0],
      description: newExpense.description,
      status: newExpense.status as 'paid' | 'pending'
    };
    setExpenses([expense, ...expenses]);
    setIsAddingExpense(false);
    setNewExpense({ category: 'Operational', amount: 0, date: new Date().toISOString().split('T')[0], description: '', status: 'pending' });
  };

  return (
    <div className="space-y-8 pb-20">
      {/* Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-6 right-6 z-[999] bg-slate-900 border border-slate-800 text-white px-5 py-3.5 rounded-2xl flex items-center gap-3 shadow-2xl font-black text-xs uppercase tracking-wider font-sans max-w-sm"
          >
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
            <span className="leading-snug">{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="p-4 bg-orange-600 rounded-[2rem] text-white shadow-xl shadow-orange-200">
            <BarChart3 size={32} />
          </div>
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight italic uppercase leading-none">Accounting Center</h1>
            <p className="text-slate-500 font-bold text-sm tracking-tight italic mt-1">Smart global monitoring of school finances.</p>
          </div>
        </div>

        <div className="flex items-center bg-white border border-slate-200 rounded-2xl p-1 shadow-sm overflow-x-auto custom-scrollbar">
          {(['overview', 'income', 'expenses', 'payroll', 'attendance'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap",
                activeTab === tab ? "bg-slate-900 text-white shadow-md" : "text-slate-400 hover:text-slate-900"
              )}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {activeTab === 'overview' && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-6 text-emerald-50 opacity-20">
                 <TrendingUp size={60} />
              </div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 italic">Total Income</p>
              <h3 className="text-3xl font-black text-slate-900 tracking-tighter italic">
                ${totalIncome.toLocaleString()}
              </h3>
              <div className="mt-4 flex items-center gap-2 text-emerald-600 font-black text-[9px] uppercase italic">
                <ArrowUpRight size={12} />
                <span>+12.5% Month</span>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-6 text-rose-50 opacity-20">
                 <TrendingDown size={60} />
              </div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 italic">Operating Expense</p>
              <h3 className="text-3xl font-black text-slate-900 tracking-tighter italic">
                ${totalExpenditure.toLocaleString()}
              </h3>
              <div className="mt-4 flex items-center gap-2 text-rose-600 font-black text-[9px] uppercase italic">
                <ArrowDownRight size={12} />
                <span>+4.2% Month</span>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-6 text-blue-50 opacity-20">
                 <Wallet size={60} />
              </div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 italic">Smart Payroll</p>
              <h3 className="text-3xl font-black text-slate-900 tracking-tighter italic">
                ${totalSalaries.toLocaleString()}
              </h3>
              <div className="mt-4 flex items-center gap-2 text-blue-600 font-black text-[9px] uppercase italic">
                <Calendar size={12} />
                <span>May 2026</span>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className={cn(
                "p-6 rounded-[2.5rem] shadow-xl relative overflow-hidden",
                netProfit >= 0 ? "bg-slate-900 text-white" : "bg-rose-900 text-white"
              )}
            >
              <div className="absolute top-0 right-0 p-6 opacity-10">
                 <DollarSign size={60} />
              </div>
              <p className="text-[10px] font-black opacity-60 uppercase tracking-widest mb-2 italic">Net Profit</p>
              <h3 className="text-3xl font-black tracking-tighter italic">
                ${netProfit.toLocaleString()}
              </h3>
              <div className="mt-4 flex items-center gap-2 font-black text-[9px] uppercase italic opacity-80">
                {netProfit >= 0 ? <CheckCircle2 size={12} /> : <AlertCircle size={12} />}
                <span>{netProfit >= 0 ? 'Healthy' : 'Deficit'}</span>
              </div>
            </motion.div>
          </div>
          
          {/* Summary Snapshots Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm space-y-4"
            >
              <div className="flex items-center gap-3">
                <div className="p-3 bg-orange-50 text-orange-600 rounded-2xl">
                  <Zap size={20} />
                </div>
                <h4 className="text-sm font-black uppercase tracking-widest italic text-slate-900">Overtime Summary</h4>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest italic">Total Hours</p>
                  <p className="text-xl font-black text-slate-900 italic">{otStats.totalHours}h</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest italic">Pending Req.</p>
                  <p className="text-xl font-black text-orange-600 italic">{otStats.pendingCount}</p>
                </div>
              </div>
              <div className="pt-4 border-t border-slate-50">
                <div className="flex items-center justify-between">
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest italic">Total Cost</p>
                  <p className="text-sm font-black text-slate-900 italic">${otStats.totalCost}</p>
                </div>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm space-y-4"
            >
              <div className="flex items-center gap-3">
                <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
                  <DollarSign size={20} />
                </div>
                <h4 className="text-sm font-black uppercase tracking-widest italic text-slate-900">Salary Summary</h4>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest italic">Total Net Paid</p>
                  <p className="text-xl font-black text-slate-900 italic">${totalSalaries.toLocaleString()}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest italic">Staff Count</p>
                  <p className="text-xl font-black text-blue-600 italic">{employees.length}</p>
                </div>
              </div>
              <div className="pt-4 border-t border-slate-50">
                <div className="flex items-center justify-between">
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest italic">Avg. Salary</p>
                  <p className="text-sm font-black text-slate-900 italic">${(totalSalaries / employees.length).toFixed(0)}</p>
                </div>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm space-y-4"
            >
              <div className="flex items-center gap-3">
                <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl">
                  <Clock size={20} />
                </div>
                <h4 className="text-sm font-black uppercase tracking-widest italic text-slate-900">Attendance Stats</h4>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest italic">On-Time Rate</p>
                  <p className="text-xl font-black text-emerald-600 italic">{attendanceStats.onTimeRate}%</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest italic">Lates Today</p>
                  <p className="text-xl font-black text-orange-600 italic">{attendanceStats.lates}</p>
                </div>
              </div>
              <div className="pt-4 border-t border-slate-50">
                <div className="flex items-center justify-between">
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest italic">Absences</p>
                  <p className="text-sm font-black text-rose-600 italic">{attendanceStats.absences}</p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* PROJECTED PAYROLL SUMMARY PANEL IN ACCOUNTING SECTION */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="w-full bg-slate-900 border border-slate-800 rounded-[3rem] p-8 text-white shadow-2xl relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-8 text-slate-800 opacity-20 pointer-events-none">
              <Wallet size={160} />
            </div>

            <div className="relative z-10 flex flex-col xl:flex-row xl:items-center justify-between gap-8">
              <div className="space-y-3 max-w-2xl">
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 bg-amber-500/15 text-amber-400 border border-amber-500/10 rounded-full text-[9px] font-black uppercase tracking-widest animate-pulse">Financial Outlay Forecast</span>
                  <span className="px-3 py-1 bg-slate-800 text-slate-350 rounded-full text-[9px] font-black uppercase tracking-widest font-mono">May 2026</span>
                </div>
                <h3 className="text-xl font-black uppercase italic tracking-wide text-slate-100">Projected Payroll Summary & Treasury Check</h3>
                <p className="text-slate-400 text-xs font-semibold leading-relaxed">
                  Consolidation of standard school operations and biometric attendance, factoring in approved Overtime Hours, lateness penalization index (-$10/occurrence), and unexcused leaves (-$50/missing day) prior to executive sign-off and statements locking.
                </p>

                {/* Micro individual projection breakdown rows */}
                <div className="bg-slate-950/80 rounded-[2rem] border border-slate-800/80 p-5 mt-4 max-h-[160px] overflow-y-auto custom-scrollbar divide-y divide-slate-800/50">
                  {projectedSummary.projections.map(proj => (
                    <div key={proj.employeeId} className="flex justify-between items-center py-2.5 text-xs font-bold last:pb-0 first:pt-0">
                      <div>
                        <p className="text-slate-200 uppercase font-black">{proj.name} <span className="text-[10px] text-slate-500 font-sans">({proj.department})</span></p>
                        <p className="text-[9.5px] text-slate-400 font-mono mt-0.5">Approved Base: ${proj.baseSalary.toLocaleString()}</p>
                      </div>
                      <div className="flex items-center gap-4 shrink-0">
                        {proj.pendingOTHours > 0 && (
                          <span className="px-2 py-0.5 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded text-[9px] font-sans font-black font-mono animate-pulse">
                            +{proj.pendingOTHours}h OT (+${proj.pendingOTPay})
                          </span>
                        )}
                        <p className="font-mono text-blue-450 font-black">${proj.projectedNetSalary.toLocaleString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Aggregation Output and Publish Lock controls */}
              <div className="flex flex-col justify-between bg-slate-950/60 p-6 rounded-[2rem] border border-slate-800/80 min-w-[280px]">
                <div className="space-y-2 text-xs font-bold font-sans">
                  <div className="flex justify-between items-center text-slate-400 uppercase tracking-widest">
                    <span>Draft Base Net:</span>
                    <span className="text-slate-205 font-mono">${projectedSummary.totalDraftNetSalary.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center text-amber-400 uppercase tracking-widest">
                    <span>Forecast Pending OT:</span>
                    <span className="font-mono">+${projectedSummary.totalPendingOTPay.toLocaleString()}</span>
                  </div>
                  <div className="h-px bg-slate-800 my-2" />
                  <div className="flex justify-between items-center text-slate-100 uppercase tracking-widest py-0.5">
                    <span className="font-black text-[10px]">Projected Outlay:</span>
                    <span className="text-blue-405 text-lg font-black font-mono">${projectedSummary.totalProjectedNetSalary.toLocaleString()}</span>
                  </div>
                </div>

                {payroll.some(p => p.status === 'draft') ? (
                  <button
                    onClick={() => {
                      const draftIds = payroll.filter(p => p.status === 'draft').map(p => p.id);
                      setSelectedPayrollIds(draftIds);
                      setIsConfirmingPublish(true);
                    }}
                    className="w-full mt-4 py-3.5 bg-gradient-to-r from-blue-600 to-indigo-650 hover:from-blue-500 hover:to-indigo-550 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest cursor-pointer active:scale-95 transition-all shadow-xl shadow-blue-500/15 flex items-center justify-center gap-2 animate-pulse"
                  >
                    <BadgeCheck size={14} />
                    Confirm & Publish Ledger
                  </button>
                ) : (
                  <div className="text-center mt-4 text-[9.5px] font-black text-emerald-400 uppercase tracking-widest py-3.5 border border-emerald-500/10 rounded-2xl bg-emerald-500/5 flex items-center justify-center gap-2">
                    <Lock size={13} />
                    Ledger Frozen & Published
                  </div>
                )}
              </div>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm">
              <div className="flex items-center justify-between mb-8">
                 <h4 className="text-sm font-black uppercase tracking-widest italic text-slate-900 flex items-center gap-2">
                   <TrendingUp size={16} className="text-blue-600" />
                   Cash Flow Visualization
                 </h4>
                 <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                       <div className="w-2 h-2 rounded-full bg-blue-600" />
                       <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Income</span>
                    </div>
                    <div className="flex items-center gap-2">
                       <div className="w-2 h-2 rounded-full bg-rose-500" />
                       <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Expenditure</span>
                    </div>
                 </div>
              </div>
              <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#2563eb" stopOpacity={0.1}/>
                        <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.1}/>
                        <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis 
                      dataKey="name" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }} 
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }} 
                    />
                    <Tooltip 
                      contentStyle={{ 
                        borderRadius: '1rem', 
                        border: 'none', 
                        boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
                        fontSize: '12px',
                        fontWeight: 'bold'
                      }} 
                    />
                    <Area type="monotone" dataKey="income" stroke="#2563eb" strokeWidth={4} fillOpacity={1} fill="url(#colorIncome)" />
                    <Area type="monotone" dataKey="expense" stroke="#f43f5e" strokeWidth={4} fillOpacity={1} fill="url(#colorExpense)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm overflow-hidden flex flex-col">
               <h4 className="text-sm font-black uppercase tracking-widest italic text-slate-900 mb-8">Active OT Requests</h4>
               <div className="flex-1 space-y-4 overflow-y-auto custom-scrollbar">
                  {otRecords.map(ot => {
                    const emp = employees.find(e => e.id === ot.employeeId);
                    return (
                      <div key={ot.id} className="p-4 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-between group hover:border-orange-500/20 transition-all">
                        <div className="flex items-center gap-4">
                           <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center">
                              <Zap size={18} className="text-orange-500" />
                           </div>
                           <div>
                              <p className="text-xs font-black text-slate-900 italic uppercase">{emp?.name || ot.employeeId}</p>
                              <p className="text-[10px] font-bold text-slate-400 capitalize">{ot.description}</p>
                           </div>
                        </div>
                        <div className="text-right">
                           <p className="text-sm font-black text-slate-900 italic">{ot.hours} Hours</p>
                           <span className={cn(
                             "text-[8px] font-black uppercase tracking-widest",
                             ot.status === 'approved' ? "text-emerald-500" : "text-orange-500"
                           )}>{ot.status}</span>
                        </div>
                      </div>
                    );
                  })}
               </div>
               <button className="w-full mt-6 py-4 border-2 border-dashed border-slate-200 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 hover:border-slate-400 transition-all">
                  Process All Pending OT
               </button>
            </div>
          </div>
        </>
      )}

      {activeTab === 'income' && (
        <div className="bg-white rounded-[3rem] border border-slate-200 shadow-2xl overflow-hidden">
          <div className="p-8 border-b border-slate-100 flex items-center justify-between">
             <h4 className="text-sm font-black uppercase tracking-widest italic text-slate-900">Latest Collected Invoices</h4>
             <button className="text-[10px] font-black text-blue-600 uppercase tracking-widest flex items-center gap-2 hover:translate-x-1 transition-transform">
                View Full Report
                <ArrowUpRight size={14} />
             </button>
          </div>
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest italic border-b border-slate-100">Invoice ID</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest italic border-b border-slate-100">Student ID</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest italic border-b border-slate-100">Amount</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest italic border-b border-slate-100 text-center">Date</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest italic border-b border-slate-100 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 italic font-bold">
              {invoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-8 py-6 text-slate-900 uppercase">{inv.id}</td>
                  <td className="px-8 py-6 text-slate-500 font-mono text-xs">{inv.studentId}</td>
                  <td className="px-8 py-6 font-black text-emerald-600">${inv.paidAmount.toLocaleString()}</td>
                  <td className="px-8 py-6 text-slate-400 text-xs text-center">{inv.date}</td>
                  <td className="px-8 py-6 text-right text-xs">
                     <span className={cn(
                       "px-4 py-1.5 rounded-full font-black uppercase tracking-widest text-[9px] border",
                       inv.status === 'paid' ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-orange-50 text-orange-600 border-orange-100"
                     )}>
                        {inv.status}
                     </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'expenses' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
             <h4 className="text-sm font-black uppercase tracking-widest italic text-slate-900">Expenditure Records</h4>
             <button 
               onClick={() => setIsAddingExpense(true)}
               className="flex items-center gap-2 px-6 py-3 bg-rose-600 text-white rounded-xl font-black uppercase text-[10px] tracking-widest shadow-xl shadow-rose-600/20 hover:bg-rose-700 transition-all"
             >
                <Plus size={16} />
                New Voucher
             </button>
          </div>
          <div className="bg-white rounded-[3rem] border border-slate-200 shadow-2xl overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50">
                  <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest italic border-b border-slate-100">Voucher ID</th>
                  <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest italic border-b border-slate-100">Category</th>
                  <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest italic border-b border-slate-100">Description</th>
                  <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest italic border-b border-slate-100">Amount</th>
                  <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest italic border-b border-slate-100 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 italic font-bold">
                {expenses.map((exp) => (
                  <tr key={exp.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-8 py-6 text-slate-900 uppercase">{exp.id}</td>
                    <td className="px-8 py-6 text-blue-600 text-xs font-black uppercase">{exp.category}</td>
                    <td className="px-8 py-6">
                       <p className="text-sm text-slate-800 line-clamp-1">{exp.description}</p>
                       <span className="text-[9px] text-slate-400 uppercase tracking-tighter">{exp.date}</span>
                    </td>
                    <td className="px-8 py-6 font-black text-rose-600">${exp.amount.toLocaleString()}</td>
                    <td className="px-8 py-6 text-right text-xs">
                       <span className={cn(
                         "px-4 py-1.5 rounded-full font-black uppercase tracking-widest text-[9px] border",
                         exp.status === 'paid' ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-slate-50 text-slate-400 border-slate-100"
                       )}>
                          {exp.status}
                       </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}      {activeTab === 'payroll' && (
        <div className="space-y-6">
          {payrollNotification && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-3 text-emerald-800 text-xs font-black uppercase tracking-tight italic animate-[pulse_2s_infinite]">
              <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
              <span>{payrollNotification}</span>
            </div>
          )}

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <h4 className="text-sm font-black uppercase tracking-widest italic text-slate-900">Payroll Administration</h4>
              <span className="px-3 py-1 bg-blue-50 text-blue-600 text-[10px] font-black uppercase rounded-full">May 2026</span>
            </div>
          </div>

          {/* TWO-STEP WORKFLOW STATUS INDICATOR AND WARNING */}
          {payroll.some(p => p.status === 'draft') ? (
            <div className="p-6 bg-amber-50 border border-amber-200 rounded-[2rem] flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-sm">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-amber-100 text-amber-800 rounded-2xl shrink-0">
                  <ShieldAlert size={24} className="animate-[bounce_2s_infinite]" />
                </div>
                <div>
                  <h5 className="text-xs font-black text-amber-900 uppercase tracking-wider">Payroll Cycle Status: DRAFT PREPARATION ACTIVATED</h5>
                  <p className="text-[10.5px] text-amber-700 font-semibold mt-1 leading-relaxed">
                    Staff payroll figures are loaded in <span className="underline decoration-2">Draft Mode</span>. Managers can review attendance penalties, approve overtime shifts, manually adjust salary lines, or quick-simulate revisions. Once approved, click "Approve Pending OT & Publish" in the budget summary card below to authorize and seal the official statement ledger.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-amber-100/50 rounded-full shrink-0">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping" />
                <span className="text-[9px] font-black text-amber-800 uppercase tracking-widest">Awaiting Manager Sign-Off</span>
              </div>
            </div>
          ) : (
            <div className="p-6 bg-emerald-50 border border-emerald-200 rounded-[2rem] flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-sm">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-emerald-100 text-emerald-800 rounded-2xl shrink-0">
                  <BadgeCheck size={24} />
                </div>
                <div>
                  <h5 className="text-xs font-black text-emerald-950 uppercase tracking-wider">Payroll Cycle Status: AUTHORIZED & PUBLISHED</h5>
                  <p className="text-[10.5px] text-emerald-700 font-semibold mt-1 leading-relaxed">
                    Executive sign-off is completed. May 2026 payroll ledgers are officially finalized, authorized, and committed. All records are frozen to preserve regulatory auditing and direct deposit transfers. Historical individual pay slips and departmental ZIP archives are now fully compiled and ready.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-emerald-100/50 rounded-full shrink-0">
                <Lock size={12} className="text-emerald-700" />
                <span className="text-[9px] font-black text-emerald-800 uppercase tracking-widest">Statements Locked / Frozen</span>
              </div>
            </div>
          )}

          {/* SUB-TAB NAV BAR */}
          <div className="flex border-b border-slate-200 gap-4">
            <button 
              onClick={() => setPayrollSubTab('register')}
              className={cn(
                "pb-3 px-4 text-xs font-black uppercase tracking-widest flex items-center gap-2 border-b-2 transition-all cursor-pointer",
                payrollSubTab === 'register' 
                  ? "border-blue-600 text-blue-600" 
                  : "border-transparent text-slate-400 hover:text-slate-600"
              )}
            >
              <FileSpreadsheet size={15} />
              Payroll Ledger & Departmental Packagers
            </button>
            <button 
              onClick={() => setPayrollSubTab('audit')}
              className={cn(
                "pb-3 px-4 text-xs font-black uppercase tracking-widest flex items-center gap-2 border-b-2 transition-all cursor-pointer",
                payrollSubTab === 'audit' 
                  ? "border-blue-600 text-blue-600" 
                  : "border-transparent text-slate-400 hover:text-slate-600"
              )}
            >
              <ArrowRightLeft size={15} />
              Attendance-to-Payroll Live Audit Grid
            </button>
            <button 
              onClick={() => setPayrollSubTab('deduction-audit')}
              className={cn(
                "pb-3 px-4 text-xs font-black uppercase tracking-widest flex items-center gap-2 border-b-2 transition-all cursor-pointer",
                payrollSubTab === 'deduction-audit' 
                  ? "border-blue-600 text-blue-600" 
                  : "border-transparent text-slate-400 hover:text-slate-600"
              )}
            >
              <ShieldAlert size={15} />
              Audit Log
            </button>
          </div>

          {payrollSubTab === 'register' && (
            <div className="space-y-6">
              {/* Toolbar Actions Block */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                  Ready to batch process work registers
                </p>
                <div className="flex flex-wrap items-center gap-3">
                  {/* Sync Staff Attendance Service Button */}
                  <button 
                    onClick={handleSyncAttendance}
                    className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-black uppercase text-[9px] tracking-widest shadow-lg shadow-emerald-600/10 active:scale-95 transition-all cursor-pointer"
                    title="Sync employee check-in/out records from Attendance and compute auto-penalty & bonus"
                  >
                    <ArrowRightLeft size={13} />
                    Sync Attendance to Payroll
                  </button>

                  {/* Batch Export HR Records Buttons */}
                  <button 
                    onClick={handleBatchExportPDF}
                    className="flex items-center gap-2 px-4 py-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-black uppercase text-[9px] tracking-widest shadow-lg shadow-purple-600/10 active:scale-95 transition-all cursor-pointer"
                    title="Batch export high-fidelity payroll statements grouped by department as separate PDFs"
                  >
                    <Download size={13} />
                    Batch Export PDF
                  </button>

                  <button 
                    onClick={handleBatchExportCSV}
                    className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-black uppercase text-[9px] tracking-widest shadow-lg shadow-blue-600/10 active:scale-95 transition-all cursor-pointer"
                    title="Batch download discrete payroll CSV worksheets grouped by department"
                  >
                    <Download size={13} />
                    Batch Export CSV
                  </button>
                </div>
              </div>

              {/* Projected Net Salary with Pending OT Summary panel */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 bg-slate-900 text-white p-8 rounded-[2.5rem] border border-slate-800 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 text-slate-800 opacity-20 pointer-events-none">
                  <Wallet size={120} />
                </div>
                
                <div className="space-y-3 lg:col-span-2">
                  <div>
                    <span className="px-3 py-1 bg-amber-500/15 text-amber-400 border border-amber-500/10 rounded-full text-[9px] font-black uppercase tracking-widest">Pre-Publication Budget Forecast</span>
                    <h5 className="text-base font-black uppercase italic tracking-wide mt-2">Projected Net Salary Outlook</h5>
                    <p className="text-slate-400 text-[9.5px] font-bold mt-1 leading-relaxed">
                      Evaluating current draft ledgers combined with all unapproved employee Overtime Hours ({projectedSummary.totalPendingOTHours} Hours) to map out projected treasury outlays prior to final publication.
                    </p>
                  </div>

                  {/* Projection Breakdown row items */}
                  <div className="bg-slate-950/80 rounded-2xl border border-slate-800/80 p-4 max-h-[140px] overflow-y-auto custom-scrollbar space-y-2">
                    {projectedSummary.projections.map(proj => (
                      <div key={proj.employeeId} className="flex items-center justify-between text-[11px] font-bold border-b border-slate-900/40 pb-2 last:border-b-0 last:pb-0">
                        <div>
                          <p className="text-slate-100 uppercase tracking-tight">{proj.name} <span className="text-[9px] text-slate-500 font-sans">({proj.department})</span></p>
                          <p className="text-[8.5px] text-slate-400 font-mono">Approved Base Salary: ${proj.baseSalary.toLocaleString()}</p>
                        </div>
                        <div className="text-right flex items-center gap-4 shrink-0">
                          {proj.pendingOTHours > 0 ? (
                            <span className="text-amber-400 font-black text-[8.5px] uppercase tracking-wider bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20 font-sans animate-pulse">
                              + {proj.pendingOTHours} hrs pending (+${proj.pendingOTPay})
                            </span>
                          ) : (
                            <span className="text-slate-600 uppercase text-[8px] tracking-wider">No pending OT</span>
                          )}
                          <p className="font-extrabold text-blue-400 text-xs font-mono">${proj.projectedNetSalary.toLocaleString()}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Dynamic Cash Register Summary */}
                <div className="flex flex-col justify-between bg-slate-950/40 p-6 rounded-3xl border border-slate-800/80 font-bold">
                  <div className="space-y-2 text-[10.5px]">
                    <div className="flex justify-between items-center uppercase tracking-wider text-slate-400">
                      <span>Approved Draft Base:</span>
                      <span className="text-slate-200 font-mono">${projectedSummary.totalDraftNetSalary.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center uppercase tracking-wider text-amber-400">
                      <span>Pending Overtime:</span>
                      <span className="font-mono">+${projectedSummary.totalPendingOTPay.toLocaleString()}</span>
                    </div>
                    <div className="h-px bg-slate-800 my-2" />
                    <div className="flex justify-between items-center font-black uppercase text-slate-100">
                      <span>Projected Output:</span>
                      <span className="text-blue-400 text-base font-black font-mono">${projectedSummary.totalProjectedNetSalary.toLocaleString()}</span>
                    </div>
                  </div>

                  {payroll.some(p => p.status === 'draft') ? (
                    <button
                      onClick={() => {
                        const draftIds = payroll.filter(p => p.status === 'draft').map(p => p.id);
                        setSelectedPayrollIds(draftIds);
                        setIsConfirmingPublish(true);
                      }}
                      className="w-full mt-4 py-3.5 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 rounded-2xl font-black text-[9.5px] uppercase tracking-widest cursor-pointer active:scale-95 transition-all shadow-xl shadow-amber-500/10 flex items-center justify-center gap-2"
                    >
                      <CheckCircle2 size={13} />
                      Approve pending OT & Publish
                    </button>
                  ) : (
                    <div className="text-center mt-4 text-[9px] font-black text-emerald-400 uppercase tracking-widest py-3 border border-emerald-500/15 rounded-2xl bg-emerald-500/5 flex items-center justify-center gap-1.5">
                      <Lock size={12} />
                      Payroll Cycle Published
                    </div>
                  )}
                </div>
              </div>

              {/* LEDGER BATCH OPERATION BAR */}
              {selectedPayrollIds.length > 0 && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-5 bg-gradient-to-r from-blue-50 to-indigo-50/50 border border-blue-200/80 rounded-3xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-blue-105 text-blue-600 rounded-xl">
                      <FileSpreadsheet size={16} />
                    </div>
                    <div>
                      <span className="text-[10px] font-black text-blue-800 uppercase tracking-wider">Multi-Record Action Initiated</span>
                      <p className="text-xs font-bold text-blue-950 mt-0.5 leading-none">
                        Chosen: <span className="font-extrabold text-blue-600 underline decoration-2">{selectedPayrollIds.length} draft records</span> for May 2026 bulk finalize.
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsConfirmingPublish(true)}
                    className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-650 hover:from-blue-500 hover:to-indigo-550 text-white rounded-xl font-black uppercase text-[10px] tracking-wider transition-all shadow-lg shadow-blue-500/10 active:scale-95 cursor-pointer flex items-center justify-center gap-2"
                  >
                    <BadgeCheck size={14} />
                    Verify & Finalize Selected ({selectedPayrollIds.length})
                  </button>
                </motion.div>
              )}

              {/* LEDGER REGISTER TABLE */}
              <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-xl overflow-hidden">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50/50">
                      <th className="pl-8 pr-4 py-6 border-b border-slate-100 text-center">
                        <div className="flex items-center justify-center gap-3">
                          <input 
                            type="checkbox"
                            checked={
                              payroll.length > 0 && 
                              payroll.filter(p => p.status === 'draft').every(p => selectedPayrollIds.includes(p.id)) &&
                              payroll.some(p => p.status === 'draft')
                            }
                            onChange={(e) => {
                              if (e.target.checked) {
                                const draftIds = payroll.filter(p => p.status === 'draft').map(p => p.id);
                                setSelectedPayrollIds(draftIds);
                              } else {
                                setSelectedPayrollIds([]);
                              }
                            }}
                            className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 focus:ring-2 border-slate-205 cursor-pointer"
                            disabled={!payroll.some(p => p.status === 'draft')}
                            title="Select all intermediate draft records"
                          />
                          {selectedPayrollIds.length > 0 && (
                            <button
                              onClick={() => setIsConfirmingPublish(true)}
                              className="px-3 py-1.5 bg-gradient-to-r from-blue-600 to-indigo-650 hover:from-blue-500 hover:to-indigo-550 text-white rounded-lg font-black uppercase text-[8px] tracking-wider transition-all shadow-md active:scale-95 cursor-pointer flex items-center justify-center gap-1 shrink-0 whitespace-nowrap"
                              title="Finalize and publish selected records"
                            >
                              <BadgeCheck size={11} />
                              Finalize & Publish
                            </button>
                          )}
                        </div>
                      </th>
                      <th className="px-6 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest italic border-b border-slate-100">Employee Details</th>
                      <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest italic border-b border-slate-100 text-center">Basic / Overtime</th>
                      <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest italic border-b border-slate-100 text-center">Allow. / Bonus</th>
                      <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest italic border-b border-slate-100 text-center">Penalties / Deducts</th>
                      <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest italic border-b border-slate-100 text-center text-blue-600">Net Pay Outlay</th>
                      <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest italic border-b border-slate-100 text-center">Cycle Status</th>
                      <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest italic border-b border-slate-100 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 italic font-bold">
                    {payroll.map(rec => {
                      const emp = employees.find(e => e.id === rec.employeeId);
                      const prevNetSalary = historicalPayrollData[rec.employeeId] || rec.baseSalary;
                      const percentChange = Math.abs((rec.netSalary - prevNetSalary) / prevNetSalary);
                      const isSignificantChange = percentChange > 0.15;
                      return (
                        <tr key={rec.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="pl-8 pr-2 py-6 w-12 text-center">
                            <input 
                              type="checkbox"
                              checked={selectedPayrollIds.includes(rec.id)}
                              disabled={rec.status === 'published'}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedPayrollIds(prev => [...prev, rec.id]);
                                } else {
                                  setSelectedPayrollIds(prev => prev.filter(id => id !== rec.id));
                                }
                              }}
                              className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 focus:ring-2 border-slate-205 cursor-pointer disabled:opacity-20"
                              title="Check row for selection"
                            />
                          </td>
                          <td className="px-6 py-6">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 font-black italic">
                                {emp?.name.charAt(0)}
                              </div>
                              <div>
                                <p className="text-xs text-slate-900 uppercase tracking-tight font-black">{emp?.name}</p>
                                <span className="text-[9.5px] text-slate-400 font-sans uppercase font-extrabold">{emp?.positionId} ({emp?.departmentId} Department)</span>
                              </div>
                            </div>
                          </td>
                          <td className="px-8 py-6 text-center">
                            <p className="text-xs text-slate-900 font-mono">${rec.baseSalary.toLocaleString()}</p>
                            <span className="text-[9px] text-orange-500 font-black tracking-normal uppercase">+ ${rec.otPay} overtime pay</span>
                          </td>
                          <td className="px-8 py-6 text-center">
                            <p className="text-xs text-slate-900 font-mono">${rec.allowance.toLocaleString()}</p>
                            <span className="text-[9px] text-emerald-500 font-black tracking-normal uppercase">+ ${rec.bonus} performance bonus</span>
                          </td>
                          <td className="px-8 py-6 text-center">
                            <p className="text-xs text-rose-500 font-mono">-${rec.deductions.toLocaleString()}</p>
                            <span className="text-[8px] text-slate-400 uppercase tracking-normal">Penalties computed</span>
                          </td>
                          <td className="px-8 py-6 text-center">
                            <div className="flex flex-col items-center gap-1">
                              <span className={cn(
                                "text-sm font-mono font-black py-0.5 px-2 rounded-lg transition-all",
                                isSignificantChange 
                                  ? "text-amber-700 bg-amber-50 border border-amber-250 animate-pulse" 
                                  : "text-blue-600"
                              )}>
                                ${rec.netSalary.toLocaleString()}
                              </span>
                              {isSignificantChange && (
                                <span className="text-[8px] bg-amber-100 text-amber-800 px-1 py-0.5 rounded font-black uppercase tracking-wider animate-pulse flex items-center gap-1" title={`${Math.round(percentChange * 100)}% shift compared to previous month's historical data ($${prevNetSalary})`}>
                                  <AlertCircle size={9} />
                                  {Math.round(percentChange * 100)}% Shift
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-8 py-6 text-center">
                            <span className={cn(
                              "px-3 py-1 rounded-full text-[8.5px] font-black uppercase tracking-wider",
                              rec.status === 'published' 
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' 
                                : 'bg-amber-50 text-amber-700 border border-amber-100'
                            )}>
                              {rec.status}
                            </span>
                          </td>
                          <td className="px-8 py-6 text-right">
                            <div className="flex items-center justify-end gap-2">
                              {/* Edit Values - Draft Access Only */}
                              {rec.status === 'draft' ? (
                                <button 
                                  onClick={() => {
                                    setEditingPayrollRecord(rec);
                                    setEditForm({
                                      baseSalary: rec.baseSalary,
                                      bonus: rec.bonus,
                                      allowance: rec.allowance,
                                      deductions: rec.deductions,
                                      netSalary: rec.netSalary
                                    });
                                  }}
                                  className="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-xl transition-all cursor-pointer"
                                  title="Manually override draft ledger details"
                                >
                                  <Edit2 size={13} />
                                </button>
                              ) : (
                                <span className="p-2 text-slate-300" title="Published rows are sealed against edits">
                                  <Lock size={12} />
                                </span>
                              )}

                              {/* Single Sheet Download */}
                              <button 
                                onClick={() => emp && handleDownloadSingleSlip(rec, emp)}
                                className="p-2 text-slate-500 hover:text-slate-950 hover:bg-slate-100 rounded-xl transition-all cursor-pointer"
                                title="Download complete high-fidelity statement payslip PDF"
                              >
                                <Download size={13} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* BATCH DEPARTMENTAL ZIP EXPORTS SECTION */}
              <div className="mt-8 bg-slate-50 border border-slate-200 rounded-[2.5rem] p-8 space-y-6">
                <div>
                  <h4 className="text-sm font-black uppercase tracking-widest italic text-slate-900 flex items-center gap-2">
                    <FileArchive className="text-blue-600 animate-pulse" size={18} />
                    Departmental Payroll ZIP Statement Packagers
                  </h4>
                  <p className="text-[10px] font-bold text-slate-400 mt-1">
                    Generate and bundle individual high-fidelity employee payslip statements into highly structured Departmental ZIP archives for HR archives or bulk distribution.
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {['Admin', 'Faculty', 'Auxiliary'].map(dept => {
                    const deptEmps = employees.filter(e => e.departmentId === dept);
                    return (
                      <div key={dept} className="bg-white border border-slate-200/80 rounded-2xl p-5 flex flex-col justify-between hover:shadow-md transition-all">
                        <div className="space-y-1">
                          <span className="text-[9px] font-black uppercase tracking-widest bg-blue-50 text-blue-600 px-3 py-1 rounded-full">{dept} Department</span>
                          <p className="text-xs font-black text-slate-900 mt-2">{deptEmps.length} Active Staff Members</p>
                          <p className="text-[10px] text-slate-400 font-medium font-mono">Folder: May2026_Payslips/</p>
                        </div>
                        <button 
                          onClick={() => handleBatchExportZIP(dept)}
                          className="mt-4 w-full flex items-center justify-center gap-2 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-black uppercase text-[9px] tracking-widest cursor-pointer active:scale-95 transition-all text-center"
                        >
                          <FileArchive size={13} />
                          Download {dept} ZIP
                        </button>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          )}

          {payrollSubTab === 'audit' && (
            /* ATTENDANCE-TO-PAYROLL LIVE AUDIT MODULE */
            <div className="space-y-6">
              {/* Formula & Rule Guideline Box */}
              <div className="p-8 bg-slate-900 text-white rounded-[2.5rem] border border-slate-800 shadow-2xl space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-blue-500/10 text-blue-400 rounded-2xl">
                    <History size={18} />
                  </div>
                  <div>
                    <span className="text-[8px] font-black uppercase tracking-widest text-blue-450">HR Policy Blueprint</span>
                    <h5 className="text-sm font-black uppercase tracking-widest italic text-slate-100">Attendance-to-Payroll Integration Algorithm</h5>
                  </div>
                </div>
                <p className="text-slate-400 text-[10px] font-bold leading-relaxed max-w-4xl">
                  Lateness and unpaid absentees are derived right from raw biometric check-ins or teacher registers. Overtime reflects authorized hours beyond the standard daily slot, compensated at premium multipliers. Let's audit the policy calculations:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t border-slate-800 text-[10.5px] font-bold">
                  <div className="space-y-1 bg-slate-950/45 p-4 rounded-xl border border-slate-800">
                    <p className="text-orange-400 uppercase font-black text-[9px] tracking-wider leading-none mb-1">Tardiness / Lateness Deduction</p>
                    <p className="text-slate-200">Penalty Rate: <span className="text-orange-400">-$10.00</span> per occurance</p>
                    <p className="text-slate-500 text-[9px]">Grace limit: Checked arrivals after 08:00 AM</p>
                  </div>
                  <div className="space-y-1 bg-slate-950/45 p-4 rounded-xl border border-slate-800">
                    <p className="text-rose-400 uppercase font-black text-[9px] tracking-wider leading-none mb-1">Unplanned Absence Penalty</p>
                    <p className="text-slate-200">Deduction Index: <span className="text-rose-400">-$50.00</span> per missing day</p>
                    <p className="text-slate-500 text-[9px]">Medical leaves with valid notice bypass cuts</p>
                  </div>
                  <div className="space-y-1 bg-slate-950/45 p-4 rounded-xl border border-slate-800">
                    <p className="text-emerald-400 uppercase font-black text-[9px] tracking-wider leading-none mb-1">Overtime Compensation</p>
                    <p className="text-slate-200">Earning Index: <span className="text-emerald-400">+$20.00</span> per authorized extra hour</p>
                    <p className="text-slate-500 text-[9px]">Calculated for after-hours tutoring and operations</p>
                  </div>
                </div>
              </div>

              {/* LIVE AUDIT DETAILED GRID */}
              <div className="bg-white rounded-[2.5rem] border border-slate-200 p-8 shadow-xl space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                  <div>
                    <h5 className="text-xs font-black uppercase tracking-widest text-slate-900">Audit Desk: Staff Paycheck Computations</h5>
                    <p className="text-[10px] font-bold text-slate-400 mt-1">
                      Direct formula-level links. Click action simulators to test penalty updates and see May 2026 paycheck outlays update live.
                    </p>
                  </div>
                  <span className="text-[9px] font-black uppercase tracking-widest bg-blue-50 text-blue-600 px-4 py-1.5 rounded-full">Formula Active</span>
                </div>

                <div className="divide-y divide-slate-100 space-y-6">
                  {employees.map(emp => {
                    const rec = payroll.find(p => p.employeeId === emp.id || p.employeeId === emp.employeeCode);
                    if (!rec) return null;

                    // Calculate live counters based on current mock database
                    const empAttendance = attendance.filter(a => a.employeeId === emp.id);
                    const latesCount = empAttendance.filter(a => a.status === 'late').length;
                    const absencesCount = empAttendance.filter(a => a.status === 'absent').length;
                    const otHoursCount = otRecords.filter(o => o.employeeId === emp.id && o.status === 'approved').reduce((sum, o) => sum + o.hours, 0)
                      + (rec.otPay / 15); // standard base OT calculation

                    const derivedLatesPenalty = latesCount * 10;
                    const derivedAbsencePenalty = absencesCount * 50;
                    const totalDerivedDeductions = derivedLatesPenalty + derivedAbsencePenalty;

                    return (
                      <div key={emp.id} className="pt-6 first:pt-0 flex flex-col xl:flex-row xl:items-center justify-between gap-6 hover:bg-slate-50/20 px-4 py-3 rounded-2xl transition-all">
                        
                        {/* Employee Bio details */}
                        <div className="flex items-center gap-4 w-72 shrink-0">
                          <div className="w-12 h-12 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 font-extrabold italic">
                            {emp.name.charAt(0)}
                          </div>
                          <div>
                            <p className="text-xs font-black text-slate-900 uppercase">{emp.name}</p>
                            <p className="text-[9px] text-slate-500 font-bold uppercase font-sans mt-0.5">{emp.positionId}</p>
                            <span className="inline-block mt-1 text-[8px] font-black bg-blue-50 text-blue-600 px-2 py-0.5 rounded uppercase">{emp.departmentId}</span>
                          </div>
                        </div>

                        {/* WORK RECOGNITION AND LIVE COUNTERS */}
                        <div className="grid grid-cols-3 gap-6 select-none">
                          <div className="p-3 bg-orange-50/50 border border-orange-100/65 rounded-xl text-center">
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest font-sans">Lates Recorded</p>
                            <p className="text-base font-black text-orange-600 mt-1 font-mono">
                              <AnimatedValue value={latesCount} isCurrency={false} />
                            </p>
                            <p className="text-[8px] font-black text-orange-500 uppercase mt-0.5 font-sans">
                              -<AnimatedValue value={derivedLatesPenalty} /> cut
                            </p>
                          </div>
                          <div className="p-3 bg-rose-50/30 border border-rose-100/50 rounded-xl text-center">
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest font-sans">Absences</p>
                            <p className="text-base font-black text-rose-600 mt-1 font-mono">
                              <AnimatedValue value={absencesCount} isCurrency={false} />
                            </p>
                            <p className="text-[8px] font-black text-rose-500 uppercase mt-0.5 font-sans">
                              -<AnimatedValue value={derivedAbsencePenalty} /> cut
                            </p>
                          </div>
                          <div className="p-3 bg-emerald-50/30 border border-emerald-100/50 rounded-xl text-center">
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest font-sans">OT Approved</p>
                            <p className="text-base font-black text-emerald-600 mt-1 font-mono">
                              <AnimatedValue value={Number(otHoursCount.toFixed(0))} isCurrency={false} /> Hrs
                            </p>
                            <p className="text-[8px] font-black text-emerald-500 uppercase mt-0.5 font-sans">
                              +<AnimatedValue value={rec.otPay} /> compensation
                            </p>
                          </div>
                        </div>

                        {/* PLAYGROUND ACTION SIMULATOR CONTROLS */}
                        <div className="flex flex-wrap items-center gap-2">
                          <button 
                            onClick={() => handleSimulateAttendancePenalty(emp.id, 'late')}
                            className="px-3 py-2 bg-orange-50 hover:bg-orange-100 text-orange-700 rounded-xl text-[8px] font-black uppercase tracking-wider flex items-center gap-1 cursor-pointer transition-all active:scale-95 border border-orange-100"
                            title="Simulate adding a new late clock-in punch"
                          >
                            +1 Late (-$10)
                          </button>
                          <button 
                            onClick={() => handleSimulateAttendancePenalty(emp.id, 'absent')}
                            className="px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl text-[8px] font-black uppercase tracking-wider flex items-center gap-1 cursor-pointer transition-all active:scale-95 border border-rose-100"
                            title="Simulate adding an unexcused absent mark"
                          >
                            +1 Absence (-$50)
                          </button>
                          <button 
                            onClick={() => handleSimulateOTIncrease(emp.id)}
                            className="px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-xl text-[8px] font-black uppercase tracking-wider flex items-center gap-1 cursor-pointer transition-all active:scale-95 border border-emerald-100"
                            title="Simulate approving +2 premium hours of extra duty"
                          >
                            +2 OT Hours (+$40)
                          </button>
                          
                          {/* Revert Sim button */}
                          {(attendance.some(a => a.employeeId === emp.id && a.id.startsWith("SIM-")) || otRecords.some(o => o.employeeId === emp.id && o.id.startsWith("SIM-"))) && (
                            <button 
                              onClick={() => handleResetAttendanceSimulations(emp.id)}
                              className="px-2.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-[8.5px] font-black uppercase tracking-widest cursor-pointer transition-all hover:text-slate-900"
                              title="Reset all dynamic alterations to reference real school data"
                            >
                              Reset Logs ↺
                            </button>
                          )}
                        </div>

                        {/* LIVE CALCULATION EQUATION SECTION */}
                        <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 flex flex-col justify-center text-right select-none font-bold min-w-[200px]">
                          <div className="flex items-center justify-between text-[8px] text-slate-400 uppercase tracking-widest mb-1.5 border-b border-dashed border-slate-200 pb-1 font-sans">
                            <span>Equation Model Check</span>
                            <span className="text-blue-600">Formula Sync</span>
                          </div>
                          
                          <div className="text-[10px] text-slate-500 font-mono space-y-0.5">
                            <div className="flex justify-between gap-4">
                              <span className="font-sans font-bold text-slate-400">Approved Base:</span>
                              <span><AnimatedValue value={rec.baseSalary} /></span>
                            </div>
                            <div className="flex justify-between gap-4">
                              <span className="font-sans font-bold text-emerald-500">+ Overtime:</span>
                              <span className="text-emerald-500"><AnimatedValue value={rec.otPay} /></span>
                            </div>
                            <div className="flex justify-between gap-4">
                              <span className="font-sans font-bold text-emerald-500">+ Incentives:</span>
                              <span className="text-emerald-500"><AnimatedValue value={rec.bonus + rec.allowance} /></span>
                            </div>
                            <div className="flex justify-between gap-4">
                              <span className="font-sans font-bold text-rose-500">- Penalties:</span>
                              <span className="text-rose-500">-<AnimatedValue value={rec.deductions} /></span>
                            </div>
                          </div>

                          <div className="h-px bg-slate-200 my-1.5" />
                          
                          <div className="flex items-center justify-between gap-4">
                            <span className="text-[8.5px] text-slate-500 uppercase font-sans font-black">Net Salary:</span>
                            <span className="text-sm font-black text-blue-600 font-mono leading-none"><AnimatedValue value={rec.netSalary} /></span>
                          </div>
                        </div>

                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {payrollSubTab === 'deduction-audit' && (
            <div className="space-y-6">
              {/* SECTION HEADERBANNER */}
              <div className="p-8 bg-slate-900 text-white rounded-[2.5rem] border border-slate-800 shadow-2xl space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-red-500/10 text-red-155 rounded-2xl">
                    <ShieldAlert size={18} />
                  </div>
                  <div>
                    <span className="text-[8px] font-black uppercase tracking-widest text-red-400">FINANCE SECURITY PROTOCOL</span>
                    <h5 className="text-sm font-black uppercase tracking-widest italic text-slate-100">Deductions Calculation Audit Ledger</h5>
                  </div>
                </div>
                <p className="text-slate-400 text-[10px] font-bold leading-relaxed max-w-4xl">
                  This transparent ledger highlights active HR regulatory compliance computations. It breaks down late counts and unnoted absences to audit exactly how payroll penalties are derived. Corrective adjustments can be initiated directly by modifying the employee's work logs or through the master register overriding panel.
                </p>
              </div>

              {/* FILTERING DEVICE */}
              <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-sm flex flex-col md:flex-row items-center gap-4 font-sans">
                <div className="relative flex-1 w-full">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input
                    type="text"
                    value={auditSearchQuery}
                    onChange={(e) => setAuditSearchQuery(e.target.value)}
                    placeholder="Search staff members by name, position, or department..."
                    className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold outline-none focus:ring-2 focus:ring-blue-500 transition-all font-sans"
                  />
                  {auditSearchQuery && (
                    <button
                      onClick={() => setAuditSearchQuery('')}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 font-sans text-xs font-black"
                    >
                      CLEAR
                    </button>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-3 w-full md:w-auto shrink-0 font-sans">
                  <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-2xl px-3.5 py-1.5 shadow-sm">
                    <span className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Start</span>
                    <input
                      type="date"
                      value={auditStartDate}
                      onChange={(e) => setAuditStartDate(e.target.value)}
                      className="bg-transparent border-0 outline-none text-xs font-black font-mono text-slate-600 cursor-pointer"
                    />
                  </div>

                  <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-2xl px-3.5 py-1.5 shadow-sm">
                    <span className="text-[9px] font-black uppercase text-slate-400 tracking-wider">End</span>
                    <input
                      type="date"
                      value={auditEndDate}
                      onChange={(e) => setAuditEndDate(e.target.value)}
                      className="bg-transparent border-0 outline-none text-xs font-black font-mono text-slate-600 cursor-pointer"
                    />
                  </div>

                  {(auditStartDate || auditEndDate) && (
                    <button
                      onClick={() => {
                        setAuditStartDate('');
                        setAuditEndDate('');
                      }}
                      className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all cursor-pointer"
                    >
                      Reset Range
                    </button>
                  )}
                </div>
              </div>

              {/* DEDUCTIONS CORNERSTONE GRID */}
              <div className="grid grid-cols-1 gap-6">
                {employees
                  .filter(emp => 
                    emp.name.toLowerCase().includes(auditSearchQuery.toLowerCase()) ||
                    emp.positionId.toLowerCase().includes(auditSearchQuery.toLowerCase()) ||
                    emp.departmentId.toLowerCase().includes(auditSearchQuery.toLowerCase())
                  )
                  .map(emp => {
                    // Calculate impacts using existing service logic
                    const impact = payrollSyncService.calculateAttendanceImpact(filteredAttendance, emp.id);
                    const matchedPayroll = payroll.find(p => p.employeeId === emp.id);
                    
                    const latesDeduction = impact.latesCount * 10;
                    const absenceDeduction = impact.absentCount * 50;
                    const totalDeductions = impact.deductions;
                    
                    const isSynced = matchedPayroll ? matchedPayroll.deductions === totalDeductions : false;

                    return (
                      <div key={emp.id} className="bg-white border border-slate-200 rounded-[2.5rem] p-8 shadow-md hover:shadow-lg transition-all space-y-6">
                        {/* Title of Employee and Quick Badges */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-slate-105 border border-slate-200 flex items-center justify-center text-slate-700 font-black text-sm italic">
                              {emp.name.charAt(0)}
                            </div>
                            <div>
                              <h4 className="text-xs font-black uppercase text-slate-900 tracking-tight">{emp.name}</h4>
                              <p className="text-[10px] text-slate-400 font-sans uppercase font-extrabold">{emp.positionId} • {emp.departmentId} Department</p>
                            </div>
                          </div>
                          
                          <div className="flex flex-wrap items-center gap-2">
                            {isSynced ? (
                              <span className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-[8.5px] font-black uppercase tracking-wider">
                                <CheckCircle2 size={11} />
                                In Sync with Payroll Ledger
                              </span>
                            ) : (
                              <span className="flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-700 border border-amber-200 rounded-full text-[8.5px] font-black uppercase tracking-wider animate-pulse font-sans">
                                <AlertCircle size={11} />
                                Pending Manual Register Sync
                              </span>
                            )}
                            <span className="px-3 py-1 bg-slate-50 border border-slate-200 rounded-full text-[8.5px] font-black text-slate-600 uppercase tracking-wider font-sans">
                              Code: {emp.employeeCode}
                            </span>
                          </div>
                        </div>

                        {/* Raw counts Grid */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 text-center">
                            <span className="text-[8.5px] font-black text-slate-400 uppercase tracking-widest font-sans">Late Counts</span>
                            <p className="text-base font-mono font-black text-orange-650 mt-1">{impact.latesCount} days</p>
                            <p className="text-[7.5px] text-slate-400 mt-0.5 uppercase font-sans font-black">arrival after 08:00 AM</p>
                          </div>
                          <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 text-center">
                            <span className="text-[8.5px] font-black text-slate-400 uppercase tracking-widest font-sans">Absent Counts</span>
                            <p className="text-base font-mono font-black text-red-650 mt-1">{impact.absentCount} days</p>
                            <p className="text-[7.5px] text-slate-400 mt-0.5 uppercase font-sans font-black">without valid leave file</p>
                          </div>
                          <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 text-center">
                            <span className="text-[8.5px] font-black text-slate-400 uppercase tracking-widest font-sans">Medical Leaves</span>
                            <p className="text-base font-mono font-black text-blue-600 mt-1">{impact.leavesCount} days</p>
                            <p className="text-[7.5px] text-slate-400 mt-0.5 uppercase font-sans font-black">authorized excused bypass</p>
                          </div>
                          <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 text-center">
                            <span className="text-[8.5px] font-black text-slate-400 uppercase tracking-widest font-sans">Overtime Hours</span>
                            <p className="text-base font-mono font-black text-emerald-600 mt-1">{impact.otHours} hrs</p>
                            <p className="text-[7.5px] text-slate-400 mt-0.5 uppercase font-sans font-black">recorded past standard slots</p>
                          </div>
                        </div>

                        {/* Calculation step-by-step audit block */}
                        <div className="bg-slate-950 text-slate-105 rounded-3xl p-6 font-mono text-[10px] space-y-3.5 border border-slate-800">
                          <div className="flex items-center justify-between pb-2 border-b border-slate-800/80 font-sans">
                            <span className="text-[9px] text-blue-450 uppercase font-black tracking-wider">Formula Execution Path</span>
                            <span className="text-slate-500 uppercase">Cycle: May 2026</span>
                          </div>

                          <div className="space-y-1.5 leading-relaxed">
                            <div className="flex justify-between">
                              <span className="text-slate-400">1. Tardiness Multiplier Penalty:</span>
                              <span className="text-orange-400 font-bold">
                                {impact.latesCount} lates × $10.00/late = -${latesDeduction.toFixed(2)}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-400">2. Absences Multiplier Penalty:</span>
                              <span className="text-red-400 font-bold">
                                {impact.absentCount} absences × $50.00/absent = -${absenceDeduction.toFixed(2)}
                              </span>
                            </div>
                            <div className="h-px bg-slate-800/80 my-2" />
                            <div className="flex justify-between items-center text-sm">
                              <span className="text-slate-300 font-black font-sans uppercase tracking-tight">Derived Total Penalties:</span>
                              <span className="text-rose-500 font-black">
                                -${totalDeductions.toFixed(2)}
                              </span>
                            </div>
                          </div>

                          <div className="pt-2 border-t border-slate-800/80 flex flex-col sm:flex-row justify-between gap-2 text-[8px] text-slate-500 font-sans">
                            <span>* Excludes payroll tax, social benefits, and corporate health insurance scales.</span>
                            <span className="italic">Authorized by Admin Policy #ALT-026</span>
                          </div>
                        </div>

                        {/* Explicit deduction list */}
                        <div className="space-y-3 font-sans">
                          <h5 className="text-[10px] font-black uppercase text-slate-401 tracking-wider flex items-center gap-2">
                            <ShieldAlert size={14} className="text-red-500 animate-[pulse_1.5s_infinite]" />
                            Explicit Deduction Breakdown (Individual Logs)
                          </h5>

                          {attendance.filter(r => r.employeeId === emp.id && (r.status === 'late' || r.status === 'absent')).length === 0 ? (
                            <div className="p-4 bg-slate-50 text-slate-400 rounded-2xl text-[10px] font-bold text-center border border-dashed border-slate-200">
                              No unexcused absences or late flags logged for this staff member in May 2026. Perfect compliance!
                            </div>
                          ) : (
                            <div className="border border-slate-200 rounded-3xl overflow-hidden shadow-sm bg-slate-50/50">
                              <div className="overflow-x-auto">
                                <table className="w-full text-left text-xs">
                                  <thead className="bg-slate-100/80 border-b border-slate-200 text-slate-500 font-black text-[8.5px] uppercase tracking-wider">
                                    <tr>
                                      <th className="px-5 py-3">Deduction Date</th>
                                      <th className="px-5 py-3">Violation Type</th>
                                      <th className="px-5 py-3">Standard Calculation Logic</th>
                                      <th className="px-5 py-3 text-right">Penalty</th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-slate-150 font-bold text-slate-700">
                                    {attendance
                                      .filter(r => r.employeeId === emp.id && (r.status === 'late' || r.status === 'absent'))
                                      .map(record => {
                                        const isAbsent = record.status === 'absent';
                                        const penaltyAmt = isAbsent ? 50 : 10;
                                        return (
                                          <tr key={record.id} className="hover:bg-slate-100/50 transition-colors">
                                            <td className="px-5 py-3.5 font-mono text-[10px] text-slate-500">
                                              {record.date}
                                            </td>
                                            <td className="px-5 py-3.5">
                                              <span className={cn(
                                                "px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider inline-block",
                                                isAbsent 
                                                  ? "bg-red-50 text-red-800 border border-red-100" 
                                                  : "bg-orange-50 text-orange-800 border border-orange-100"
                                              )}>
                                                {isAbsent ? 'Absent (Unexcused)' : 'Late Check-In'}
                                              </span>
                                            </td>
                                            <td className="px-5 py-3.5 text-[10px] text-slate-500 font-medium max-w-xs pr-10">
                                              {isAbsent 
                                                ? "Failure to complete standard shift without approved leave payload. Daily compliance reduction of $50.00."
                                                : `Check-in recorded at ${record.checkIn || 'N/A'} (past 08:00 AM target). Tarification warning penalty of $10.00.`
                                              }
                                            </td>
                                            <td className="px-5 py-3.5 text-right font-mono font-black text-rose-600">
                                              -${penaltyAmt}.00
                                            </td>
                                          </tr>
                                        );
                                      })}
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}

          {/* EDIT DRAFT LEDGER VALUES MODAL */}
          {editingPayrollRecord && editForm && (
            <div id="payroll-edit-modal" className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
              <motion.div 
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-white rounded-[2.5rem] shadow-2xl border border-slate-100 max-w-lg w-full p-8 space-y-6 overflow-hidden"
              >
                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-blue-600 bg-blue-50 px-3 py-1 rounded-full">Manual Override</span>
                    <h4 className="text-sm font-black uppercase tracking-widest italic text-slate-900 mt-2">
                      Adjust Draft Salary values
                    </h4>
                  </div>
                  <button 
                    onClick={() => { setEditingPayrollRecord(null); setEditForm(null); }}
                    className="p-2 text-slate-400 hover:text-slate-900 rounded-full hover:bg-slate-50 transition-all cursor-pointer"
                  >
                    <X size={20} />
                  </button>
                </div>

                <div className="space-y-4 font-bold">
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-black italic">
                      {employees.find(e => e.id === editingPayrollRecord.employeeId || e.employeeCode === editingPayrollRecord.employeeId)?.name.charAt(0) || "S"}
                    </div>
                    <div>
                      <p className="text-xs font-black text-slate-900 uppercase">
                        {employees.find(e => e.id === editingPayrollRecord.employeeId || e.employeeCode === editingPayrollRecord.employeeId)?.name}
                      </p>
                      <p className="text-[9px] font-bold text-slate-400 uppercase font-sans">
                        {employees.find(e => e.id === editingPayrollRecord.employeeId || e.employeeCode === editingPayrollRecord.employeeId)?.positionId}
                      </p>
                    </div>
                  </div>

                  <div className="pt-1">
                    <button 
                      type="button"
                      onClick={() => {
                        const syncedPayroll = payrollSyncService.syncAttendanceToPayroll(payroll, attendance, employees);
                        setPayroll(syncedPayroll);
                        const matched = syncedPayroll.find(p => p.id === editingPayrollRecord.id);
                        if (matched) {
                          setEditForm({
                            baseSalary: matched.baseSalary,
                            bonus: matched.bonus,
                            allowance: matched.allowance,
                            deductions: matched.deductions,
                            netSalary: matched.netSalary
                          });
                          setEditingPayrollRecord(matched);
                        }
                      }}
                      className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-550 hover:to-teal-650 text-white rounded-2xl font-black text-[9.5px] uppercase tracking-widest cursor-pointer shadow-md shadow-emerald-600/10 active:scale-95 transition-all text-center"
                      title="Pull latest biometric attendance logs to auto-update deductions/OT for this employee"
                    >
                      <ArrowRightLeft size={13} />
                      Sync Attendance To Form
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-left">
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider font-sans">Base Salary ($)</label>
                      <input 
                        type="number" 
                        value={editForm.baseSalary}
                        onChange={e => {
                          const val = Number(e.target.value);
                          setEditForm({ 
                            ...editForm, 
                            baseSalary: val,
                            netSalary: val + editingPayrollRecord.otPay + editForm.bonus + editForm.allowance - editForm.deductions
                          });
                        }}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-xs focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider font-sans">Lateness / Absence Deductions ($)</label>
                      <input 
                        type="number" 
                        value={editForm.deductions}
                        onChange={e => {
                          const val = Number(e.target.value);
                          setEditForm({ 
                            ...editForm, 
                            deductions: val,
                            netSalary: editForm.baseSalary + editingPayrollRecord.otPay + editForm.bonus + editForm.allowance - val
                          });
                        }}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-xs focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider font-sans">Bonus Incentive ($)</label>
                      <input 
                        type="number" 
                        value={editForm.bonus}
                        onChange={e => {
                          const val = Number(e.target.value);
                          setEditForm({ 
                            ...editForm, 
                            bonus: val,
                            netSalary: editForm.baseSalary + editingPayrollRecord.otPay + val + editForm.allowance - editForm.deductions
                          });
                        }}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-xs focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider font-sans">Allowance ($)</label>
                      <input 
                        type="number" 
                        value={editForm.allowance}
                        onChange={e => {
                          const val = Number(e.target.value);
                          setEditForm({ 
                            ...editForm, 
                            allowance: val,
                            netSalary: editForm.baseSalary + editingPayrollRecord.otPay + editForm.bonus + val - editForm.deductions
                          });
                        }}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-xs focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                    </div>
                  </div>

                  {/* Live Calculated Output Box within modal */}
                  <div className="p-5 bg-blue-50/50 border border-blue-100 rounded-2xl flex items-center justify-between">
                    <div>
                      <p className="text-[9px] font-bold text-blue-650 uppercase tracking-wider font-sans">Calculated Net Output</p>
                      <p className="text-[8px] text-slate-400 font-medium mt-0.5 font-sans">Base + Approved OT (${editingPayrollRecord.otPay}) + Bonus + Allow - Deductions</p>
                    </div>
                    <p className="text-lg font-black text-blue-600 font-mono">
                      ${editForm.netSalary.toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="flex gap-3 justify-end pt-4 border-t border-slate-100 font-bold">
                  <button 
                    onClick={() => { setEditingPayrollRecord(null); setEditForm(null); }}
                    className="px-5 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-black uppercase text-[10px] tracking-widest transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={() => {
                      const updatedPayroll = payroll.map(p => {
                        if (p.id === editingPayrollRecord.id) {
                          return {
                            ...p,
                            baseSalary: editForm.baseSalary,
                            bonus: editForm.bonus,
                            allowance: editForm.allowance,
                            deductions: editForm.deductions,
                            netSalary: editForm.netSalary
                          };
                        }
                        return p;
                      });
                      setPayroll(updatedPayroll);
                      setEditingPayrollRecord(null);
                      setEditForm(null);
                      setPayrollNotification(`Manually adjusted intermediate draft values for worker.`);
                      setTimeout(() => setPayrollNotification(null), 5000);
                    }}
                    className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-black uppercase text-[10px] tracking-widest shadow-lg shadow-blue-600/10 active:scale-95 transition-all cursor-pointer"
                  >
                    Apply Review Edits
                  </button>
                </div>
              </motion.div>
            </div>
          )}

          {/* BULK PUBLISH CONFIRMATION MODAL */}
          {isConfirmingPublish && (
            <div id="payroll-publish-confirm-modal" className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
              <motion.div 
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-white rounded-[2.5rem] shadow-2xl border border-slate-100 max-w-2xl w-full p-8 space-y-6 overflow-hidden text-left"
              >
                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-amber-100 text-amber-800 rounded-2xl shrink-0">
                      <ShieldAlert size={20} className="text-amber-600 animate-[bounce_2s_infinite]" />
                    </div>
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-amber-600 bg-amber-50 px-3 py-1 rounded-full">Security Authorization</span>
                      <h4 className="text-sm font-black uppercase tracking-widest italic text-slate-900 mt-2">
                        Draft Payroll Ledger Confirmation
                      </h4>
                    </div>
                  </div>
                  <button 
                    onClick={() => { setIsConfirmingPublish(false); setIsExplicitlyChecked(false); }}
                    className="p-2 text-slate-400 hover:text-slate-900 rounded-full hover:bg-slate-50 transition-all cursor-pointer"
                  >
                    <X size={20} />
                  </button>
                </div>

                <div className="space-y-4 font-bold">
                  <div className="p-4 bg-amber-50/50 border border-amber-100 rounded-2xl">
                    <p className="text-[11px] text-amber-800 font-bold leading-relaxed">
                      WARNING: You are transitioning <span className="underline decoration-2 font-black">{selectedPayrollIds.length}</span> staff payroll records from <span className="font-extrabold uppercase bg-amber-100 px-1 rounded text-amber-900">Draft</span> to <span className="font-extrabold uppercase bg-emerald-100 px-1 rounded text-emerald-900">Published</span>. 
                      This act seals the financial registers, freezes inputs against revisions, and creates permanent regulatory pay ledger entries.
                    </p>
                  </div>

                  {/* List of Targeted Records */}
                  <div className="max-h-48 overflow-y-auto custom-scrollbar border border-slate-100 rounded-2xl divide-y divide-slate-100">
                    {payroll.filter(p => selectedPayrollIds.includes(p.id)).map(rec => {
                      const emp = employees.find(e => e.id === rec.employeeId);
                      return (
                        <div key={rec.id} className="p-4 flex items-center justify-between text-xs hover:bg-slate-50/40">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-black text-[10px] italic">
                              {emp?.name.charAt(0)}
                            </div>
                            <div className="text-left animate-[pulse_3s_infinite]">
                              <p className="text-slate-950 uppercase font-black">{emp?.name}</p>
                              <span className="text-[9px] text-slate-400 font-sans uppercase">{emp?.positionId} ({emp?.departmentId})</span>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-mono text-slate-900 font-black">${rec.netSalary.toLocaleString()}</p>
                            <p className="text-[8.5px] text-slate-400 uppercase">Net Pay Outflow</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Aggregated Totals row inside Modal */}
                  <div className="p-5 bg-slate-900 text-white rounded-3xl flex items-center justify-between font-bold">
                    <div className="text-left">
                      <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest leading-none mb-1">AGGREGATED TREASURY RUN OUTLAY</p>
                      <p className="text-[9.5px] text-slate-500 font-sans font-medium">Summed total of all selected paycheck outlays</p>
                    </div>
                    <p className="text-xl font-black text-blue-400 font-mono">
                      ${payroll.filter(p => selectedPayrollIds.includes(p.id)).reduce((sum, p) => sum + p.netSalary, 0).toLocaleString()}
                    </p>
                  </div>

                  {/* EXPLICIT MANAGER CONFIRMATION CHECKBOX */}
                  <div className="flex items-start gap-3 p-4 bg-slate-50 border border-slate-150 rounded-2xl">
                    <input 
                      type="checkbox"
                      id="explicit-authorize-checkbox"
                      checked={isExplicitlyChecked}
                      onChange={(e) => setIsExplicitlyChecked(e.target.checked)}
                      className="mt-1 w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300 cursor-pointer"
                    />
                    <label htmlFor="explicit-authorize-checkbox" className="text-[10.5px] text-slate-600 font-semibold cursor-pointer leading-relaxed select-none text-left">
                      I explicitly confirm and authorize this May 2026 payroll finalization. I certify that all overtime logs, biometric attendance check-ins, tardiness penalties, and department indexes have been audited and verified.
                    </label>
                  </div>
                </div>

                <div className="flex gap-3 justify-end pt-4 border-t border-slate-100 font-bold">
                  <button 
                    onClick={() => { setIsConfirmingPublish(false); setIsExplicitlyChecked(false); }}
                    className="px-5 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-black uppercase text-[10px] tracking-widest transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button 
                    disabled={!isExplicitlyChecked}
                    onClick={() => {
                      // Finalize status transition
                      const updatedPayroll = payroll.map(p => {
                        if (selectedPayrollIds.includes(p.id)) {
                          return { ...p, status: 'published' as const };
                        }
                        return p;
                      });
                      setPayroll(updatedPayroll);

                      // Also approve corresponding pending OT records
                      const pendingOTEmpIds = payroll.filter(p => selectedPayrollIds.includes(p.id)).map(p => p.employeeId);
                      const updatedOTRecords = otRecords.map(ot => {
                        if (pendingOTEmpIds.includes(ot.employeeId) && ot.status === 'pending') {
                          return { ...ot, status: 'approved' as const };
                        }
                        return ot;
                      });
                      setOtRecords(updatedOTRecords);

                      setPayrollNotification(`Explicit sign-off registered: May 2026 payroll finalized for ${selectedPayrollIds.length} staff records!`);
                      setTimeout(() => setPayrollNotification(null), 5000);

                      setSelectedPayrollIds([]);
                      setIsConfirmingPublish(false);
                      setIsExplicitlyChecked(false);
                    }}
                    className={cn(
                      "px-6 py-3 rounded-xl font-black uppercase text-[10px] tracking-widest transition-all cursor-pointer shadow-lg active:scale-95",
                      isExplicitlyChecked 
                        ? "bg-gradient-to-r from-emerald-600 to-green-650 hover:from-emerald-500 hover:to-green-550 text-white shadow-emerald-500/15" 
                        : "bg-slate-200 text-slate-400 cursor-not-allowed shadow-none"
                    )}
                  >
                    Confirm & Publish
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'attendance' && (
        <div className="space-y-6">
           <div className="flex items-center justify-between">
             <h4 className="text-sm font-black uppercase tracking-widest italic text-slate-900">Staff Attendance Tracking</h4>
             <div className="flex items-center gap-2 px-4 py-2 bg-slate-100 rounded-xl">
                <Calendar size={14} className="text-slate-400" />
                <span className="text-[10px] font-black uppercase tracking-widest">Today: May 09, 2026</span>
             </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
             <div className="bg-emerald-50 p-6 rounded-3xl border border-emerald-100">
                <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-1 italic">On-Time Rate</p>
                <h3 className="text-3xl font-black text-emerald-700 italic">92.4%</h3>
             </div>
             <div className="bg-orange-50 p-6 rounded-3xl border border-orange-100">
                <p className="text-[10px] font-black text-orange-600 uppercase tracking-widest mb-1 italic">Late Arrivals</p>
                <h3 className="text-3xl font-black text-orange-700 italic">8 Today</h3>
             </div>
             <div className="bg-rose-50 p-6 rounded-3xl border border-rose-100">
                <p className="text-[10px] font-black text-rose-600 uppercase tracking-widest mb-1 italic">Unplanned Absences</p>
                <h3 className="text-3xl font-black text-rose-700 italic">3 Today</h3>
             </div>
          </div>

          <div className="bg-white rounded-[3rem] border border-slate-200 shadow-2xl overflow-hidden">
             <table className="w-full text-left border-collapse">
                <thead>
                   <tr className="bg-slate-50/50">
                      <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest italic border-b border-slate-100">Employee</th>
                      <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest italic border-b border-slate-100">Check-In</th>
                      <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest italic border-b border-slate-100">Check-Out</th>
                      <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest italic border-b border-slate-100">Status</th>
                      <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest italic border-b border-slate-100">Notes</th>
                   </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 italic font-bold">
                   {attendance.map(rec => {
                     const emp = employees.find(e => e.id === rec.employeeId);
                     return (
                        <tr key={rec.id} className="hover:bg-slate-50/50 transition-colors">
                           <td className="px-8 py-6">
                              <div className="flex items-center gap-3">
                                 <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 font-black italic text-xs">
                                    {emp?.name.charAt(0)}
                                 </div>
                                 <p className="text-xs text-slate-900 uppercase">{emp?.name}</p>
                              </div>
                           </td>
                           <td className="px-8 py-6">
                              {rec.checkIn ? (
                                <div className="flex items-center gap-2 text-xs text-slate-600">
                                   <Clock size={12} className="text-emerald-500" />
                                   {rec.checkIn}
                                </div>
                              ) : <span className="text-slate-300">--:--</span>}
                           </td>
                           <td className="px-8 py-6 text-xs text-slate-600">
                              {rec.checkOut || '--:--'}
                           </td>
                           <td className="px-8 py-6">
                              <span className={cn(
                                 "px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest",
                                 rec.status === 'present' ? "bg-emerald-50 text-emerald-600" :
                                 rec.status === 'late' ? "bg-orange-50 text-orange-600" :
                                 "bg-rose-50 text-rose-600"
                              )}>
                                 {rec.status}
                              </span>
                           </td>
                           <td className="px-8 py-6 text-[10px] text-slate-400 max-w-xs truncate">
                              {rec.note || '---'}
                           </td>
                        </tr>
                     );
                   })}
                </tbody>
             </table>
          </div>
        </div>
      )}

      {/* Add Expense Modal */}
      <AnimatePresence>
        {isAddingExpense && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xl z-[100] flex items-center justify-center p-6">
            <motion.div 
               initial={{ opacity: 0, scale: 0.95, y: 20 }}
               animate={{ opacity: 1, scale: 1, y: 0 }}
               exit={{ opacity: 0, scale: 0.95, y: 20 }}
               className="bg-white w-full max-w-lg rounded-[3rem] shadow-2xl overflow-hidden border border-slate-100"
            >
               <div className="p-10 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                  <div>
                     <h3 className="text-2xl font-black uppercase italic text-slate-900 leading-none">Register Expenditure</h3>
                     <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2 italic">Official voucher records and payments</p>
                  </div>
                  <button onClick={() => setIsAddingExpense(false)} className="p-3 hover:bg-white rounded-2xl text-slate-400"><X size={20} /></button>
               </div>

               <div className="p-10 space-y-6">
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Category</label>
                      <select 
                        value={newExpense.category}
                        onChange={e => setNewExpense({ ...newExpense, category: e.target.value })}
                        className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-rose-500/10 focus:border-rose-500 transition-all font-bold text-slate-600 appearance-none"
                      >
                        <option>Operational</option>
                        <option>Salaries</option>
                        <option>Utilities</option>
                        <option>Supplies</option>
                        <option>Maintenance</option>
                        <option>Other</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Date</label>
                       <input 
                        type="date" 
                        value={newExpense.date}
                        onChange={e => setNewExpense({ ...newExpense, date: e.target.value })}
                        className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none transition-all font-bold text-slate-600"
                       />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Description / Subject</label>
                    <input 
                      type="text"
                      value={newExpense.description}
                      onChange={e => setNewExpense({ ...newExpense, description: e.target.value })}
                      placeholder="What was this expense for?" 
                      className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-rose-500/10 focus:border-rose-500 transition-all font-bold"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Voucher Amount (USD)</label>
                    <div className="relative">
                      <DollarSign size={24} className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input 
                        type="number" 
                        value={newExpense.amount}
                        onChange={e => setNewExpense({ ...newExpense, amount: Number(e.target.value) })}
                        placeholder="0.00"
                        className="w-full pl-16 pr-6 py-5 bg-slate-50 border border-slate-200 rounded-3xl outline-none focus:ring-4 focus:ring-rose-500/10 focus:border-rose-500 transition-all font-black text-2xl text-rose-600"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-6 pt-4">
                    <div className="flex items-center gap-3">
                       <input 
                        type="radio" 
                        id="unpaid" 
                        name="status" 
                        checked={newExpense.status === 'pending'}
                        onChange={() => setNewExpense({ ...newExpense, status: 'pending' })}
                        className="w-5 h-5 accent-rose-600"
                       />
                       <label htmlFor="unpaid" className="text-[10px] font-black uppercase text-slate-500 tracking-widest italic">Pending</label>
                    </div>
                    <div className="flex items-center gap-3">
                       <input 
                        type="radio" 
                        id="paid" 
                        name="status"
                        checked={newExpense.status === 'paid'}
                        onChange={() => setNewExpense({ ...newExpense, status: 'paid' })}
                        className="w-5 h-5 accent-emerald-600"
                       />
                       <label htmlFor="paid" className="text-[10px] font-black uppercase text-slate-500 tracking-widest italic">Paid Out</label>
                    </div>
                  </div>

                  <button 
                    onClick={handleAddExpense}
                    className="w-full py-6 bg-slate-900 text-white rounded-[2rem] font-black uppercase text-xs tracking-widest shadow-2xl shadow-slate-900/20 hover:bg-slate-800 transition-all flex items-center justify-center gap-3 mt-4"
                  >
                    <FileText size={20} />
                    Issue Voucher Record
                  </button>
               </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
