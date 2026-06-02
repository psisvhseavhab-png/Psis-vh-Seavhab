import { Employee, EmployeeAttendanceRecord, PayrollRecord } from '../types';

export const payrollSyncService = {
  /**
   * Calculates OT pay and deductions for an employee based on their attendance records.
   * - Absent: deducts $50 per occurrence for hourly rate penalty.
   * - Late: deducts $10 per occurrence for lateness penalty.
   * - Present & Worked Extra: calculates exact hours worked beyond 8 hours.
   *   We treat everything after 8 hours as OT with a standard rate of $20/hr.
   */
  calculateAttendanceImpact(
    attendance: EmployeeAttendanceRecord[],
    employeeId: string,
    otHourlyRate: number = 20
  ) {
    let deductions = 0;
    let otHours = 0;
    let otPay = 0;
    let latesCount = 0;
    let absentCount = 0;
    let leavesCount = 0;

    // Support both ID and employee code matching to be fully resilient
    const empRecords = attendance.filter(r => r.employeeId === employeeId);

    empRecords.forEach(record => {
      if (record.status === 'absent') {
        deductions += 50;
        absentCount++;
      } else if (record.status === 'late') {
        deductions += 10;
        latesCount++;
      } else if (record.status === 'leave') {
        leavesCount++;
      } else if (record.status === 'present') {
        if (record.checkIn && record.checkOut) {
          try {
            const [inH, inM] = record.checkIn.split(':').map(Number);
            const [outH, outM] = record.checkOut.split(':').map(Number);
            
            const hoursWorked = (outH + outM / 60) - (inH + inM / 60);
            
            // Beyond 8 hours is considered Overtime
            if (hoursWorked > 8) {
              const extra = hoursWorked - 8;
              otHours += extra;
              otPay += extra * otHourlyRate;
            }
          } catch (e) {
            console.error("Failed to parse working hours", e);
          }
        }
      }
    });

    return {
      deductions: Math.round(deductions),
      otHours: Math.round(otHours * 10) / 10,
      otPay: Math.round(otPay),
      latesCount,
      absentCount,
      leavesCount
    };
  },

  /**
   * Performs automatic synchronization of staff attendance onto the payroll.
   * Calculates active metrics to update otPay and deductions.
   */
  syncAttendanceToPayroll(
    currentPayroll: PayrollRecord[],
    attendance: EmployeeAttendanceRecord[],
    employees: Employee[]
  ): PayrollRecord[] {
    return currentPayroll.map(pay => {
      // Find matching employee by id (or code as fallback)
      const emp = employees.find(e => e.id === pay.employeeId || e.employeeCode === pay.employeeId);
      if (!emp) return pay;

      const impact = this.calculateAttendanceImpact(attendance, emp.id);

      const baseSalary = pay.baseSalary || 1500;
      const otPay = impact.otPay; // set dynamic OT based on attendance calculations
      const deductions = impact.deductions; // set dynamic deductions based on failures & lates
      const allowance = pay.allowance || 0;
      const bonus = pay.bonus || 0;
      const netSalary = Math.max(0, baseSalary + otPay + bonus + allowance - deductions);

      return {
        ...pay,
        otPay,
        deductions,
        netSalary,
        status: pay.status || 'draft'
      };
    });
  }
};
