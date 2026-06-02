export type UserRole = 'admin' | 'teacher' | 'student' | 'parent';

export interface User {
  uid: string;
  name: string;
  email: string;
  role: UserRole;
  profilePic?: string;
  createdAt: string;
}

export interface AcademicTerm {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
}

export interface AppRole {
  id: string;
  name: string;
  modulePermissions: Record<string, boolean>; // Module ID -> boolean
  createdBy?: string;
  createdAt?: string;
}

export interface SystemUser {
  id: string;
  employeeId: string;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  roleId: string;
  academicYearId: string;
  dashboardLevel: 'Full' | 'Limited' | 'None';
  branchIds: string[];
  campusIds: string[];
  subProgramIds: string[];
  status: 'Active' | 'Inactive' | 'Pending';
  photo?: string;
}

export interface AcademicYear {
  id: string;
  year: string;
  startDate: string;
  endDate: string;
  terms?: AcademicTerm[];
}

export interface MainProgram {
  id: string;
  name: string;
  code: string;
  description?: string;
}

export interface SubProgram {
  id: string;
  mainProgramId: string;
  name: string;
  code: string;
  language: string;
}

export interface Room {
  id: string;
  name: string;
  floor: string;
  capacity: number;
  type: string;
}

export interface Family {
  id: string;
  familyCode: string;
  fatherName?: string;
  fatherOccupation?: string;
  motherName?: string;
  motherOccupation?: string;
  contact?: string;
  telegramChatId?: string;
}

export interface GradeLevel {
  id: string;
  subProgramId: string;
  name: string;
  nameKh?: string;
  code: string;
}

export interface ClassRoom {
  id: string;
  name: string;
  gradeLevelId: string;
  roomId: string;
  teacherId: string;
  academicYear: string;
  shiftTime?: string;
  status: 'active' | 'inactive';
}

export interface ClassPeriod {
  id: string;
  name: string;
  startTime: string;
  endTime: string;
  schoolLevelId: string;
}

export interface Floor {
  id: string;
  name: string;
  code: string;
}

export interface Employee {
  id: string;
  employeeCode: string;
  name: string;
  nameKh?: string;
  gender: 'Male' | 'Female';
  dob: string;
  positionId: string;
  departmentId: string;
  photo?: string;
  contact: string;
  status: 'active' | 'resigned' | 'on leave';
  joinDate?: string;
  rating?: number;
  telegramChatId?: string;
  createdAt?: string;
}

export interface EmployeePosition {
  id: string;
  name: string;
  description?: string;
}

export interface EmployeeDepartment {
  id: string;
  name: string;
}

export interface PublicHoliday {
  id: string;
  name: string;
  fromDate: string;
  toDate: string;
  description?: string;
}

export interface ServiceCategory {
  id: string;
  name: string;
  description?: string;
}

export interface SchoolService {
  id: string;
  categoryId: string;
  name: string;
  price: number;
  currency: string;
}

export interface Invoice {
  id: string;
  studentId: string;
  totalAmount: number;
  paidAmount: number;
  status: 'paid' | 'partial' | 'unpaid';
  date: string;
  items?: { name: string; amount: number }[];
}

export interface Expense {
  id: string;
  category: string;
  amount: number;
  date: string;
  description: string;
  status: 'paid' | 'pending';
  paymentMethod?: string;
  vendor?: string;
}

export interface AuxiliaryServiceAssignment {
  id: string;
  studentId: string;
  serviceId: string;
  startDate: string;
  endDate?: string;
  status: 'active' | 'inactive';
  notes?: string;
}

export type StudentStatus = 'active' | 'inactive' | 'graduated' | 'dropout' | 'suspended' | 'warning';

export interface Student {
  id: string;
  firebaseId?: string;
  name: string;
  nameKh?: string;
  class: string;
  gender: 'Male' | 'Female';
  dob: string;
  tel?: string;
  parent: string;
  enrollmentDate: string;
  academicYear?: string;
  status: StudentStatus;
  paymentStatus?: 'paid' | 'unpaid' | 'partial';
  violationCount?: number;
  profilePic?: string;
  telegramChatId?: string;
  guardian1?: {
    name: string;
    photo?: string;
    relation: string;
    contact?: string;
  };
  guardian2?: {
    name: string;
    photo?: string;
    relation: string;
    contact?: string;
  };
  emergencyContact?: string;
  auxiliary?: {
    daycare?: boolean;
    food?: boolean;
    transport?: boolean;
  };
}

export interface JobHiring {
  id: string;
  title: string;
  department: string;
  location: string;
  jobType: 'Full-time' | 'Part-time' | 'Contract';
  description: string;
  requirements: string[];
  status: 'Published' | 'Draft' | 'Closed';
  deadline: string;
  postedAt: string;
}

export interface WebsiteEvent {
  id: string;
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  location: string;
  description: string;
  image?: string;
  category: 'Academic' | 'Sports' | 'Culture' | 'Holiday';
  status: 'Upcoming' | 'Past' | 'Cancelled';
}

export interface NewsPost {
  id: string;
  title: string;
  summary: string;
  content: string;
  category: 'Achievement' | 'Announcement' | 'Student Life';
  author: string;
  image?: string;
  status: 'Published' | 'Draft';
  publishedAt: string;
}

export interface GalleryItem {
  id?: string;
  url: string;
  description?: string;
  createdAt: string;
  isPublic: boolean;
  eventId?: string;
  authorName?: string;
}

export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface BoardTaskAttachment {
  id: string;
  name: string;
  url: string;
  type: string;
  size: string;
}

export interface TaskComment {
  id: string;
  authorName: string;
  authorRole: 'Teacher' | 'Admin' | 'Staff';
  content: string;
  createdAt: string;
}

export interface TaskStatusHistory {
  id: string;
  fromColumn: string;
  toColumn: string;
  updatedAt: string;
  updatedBy: string;
}

export interface TaskSubtask {
  id: string;
  title: string;
  completed: boolean;
}

export interface BoardTask {
  id: string;
  title: string;
  description?: string;
  priority: TaskPriority;
  assigneeId?: string;
  dueDate?: string;
  tags?: string[];
  attachments?: BoardTaskAttachment[];
  createdAt: string;
  comments?: TaskComment[];
  statusHistory?: TaskStatusHistory[];
  subtasks?: TaskSubtask[];
}

export interface BoardColumn {
  id: string;
  title: string;
  taskIds: string[];
}

export type ProjectStatus = 'Planning' | 'Active' | 'On Hold' | 'Completed' | 'Cancelled';
export type ProjectCategory = 'Infrastructure' | 'Academic' | 'Administrative' | 'Student Event' | 'Technology';

export interface Project {
  id: string;
  title: string;
  description: string;
  status: ProjectStatus;
  category: ProjectCategory;
  startDate: string;
  endDate: string;
  progress: number;
  budget: number;
  spent: number;
  managerId: string;
  teamIds: string[];
  tasksCount: number;
  completedTasksCount: number;
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  image?: string;
  createdAt: string;
}

export interface OTRecord {
  id: string;
  employeeId: string;
  date: string;
  hours: number;
  ratePerByHour?: number;
  description: string;
  status: 'pending' | 'approved' | 'rejected';
}

export interface PayrollRecord {
  id: string;
  employeeId: string;
  month: string; // YYYY-MM
  baseSalary: number;
  otPay: number;
  bonus: number;
  allowance: number;
  deductions: number;
  netSalary: number;
  status: 'draft' | 'published' | 'paid';
  paymentDate?: string;
}

export interface EmployeeAttendanceRecord {
  id: string;
  employeeId: string;
  date: string;
  checkIn?: string;
  checkOut?: string;
  status: 'present' | 'absent' | 'leave' | 'late';
  note?: string;
  location?: {
    lat: number;
    lng: number;
  };
  distanceFromPin?: number;
}

export interface LeaveRequest {
  id: string;
  employeeId: string;
  leaveType: 'Annual' | 'Sick' | 'Personal' | 'Special';
  startDate: string;
  endDate: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  appliedAt: string;
}

export interface AttendanceRecord {
  id: string;
  classId: string;
  date: string;
  records: Record<string, 'present' | 'absent' | 'late'>;
}

export interface GradeEntry {
  id: string;
  studentId: string;
  subject: string;
  score: number;
  term: string;
  date: string;
  teacherId: string;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  authorId: string;
  targetRole?: UserRole;
  createdAt: string;
}

export interface ElementConfig {
  x: number;
  y: number;
  fontSize?: number;
  color?: string;
  visible: boolean;
  statusBadge?: {
    visible: boolean;
    color?: string;
  };
}

export interface CardConfig {
  headerColor: string;
  footerColor: string;
  waveColor: string;
  schoolNameKh: string;
  schoolNameEn: string;
  tagline1Kh: string;
  tagline1En: string;
  tagline2Kh: string;
  tagline2En: string;
  tagline3Kh: string;
  tagline3En: string;
  primaryTextColor: string;
  secondaryTextColor: string;
  profileBorderColor: string;
  // Advanced Design Props
  borderRadius?: number;
  bgType?: 'solid' | 'gradient' | 'pattern';
  bgSecondary?: string;
  patternOpacity?: number;
  fontFamily?: 'sans' | 'mono' | 'serif' | 'display' | 'khmer';
  showQrCode?: boolean;
  accentColor?: string;
  cardPadding?: number;
  logoUrl?: string;
  isHonorGold?: boolean;
  // Canvas / Custom Layout
  backgroundImage?: string;
  backBackgroundImage?: string;
  overlayImage?: string;
  layout?: {
    name: ElementConfig;
    class: ElementConfig;
    qr: ElementConfig;
    photo: ElementConfig;
    schoolHeader?: ElementConfig;
    statusBadge?: ElementConfig;
    barcode?: ElementConfig;
  };
  backLayout?: {
    guardian1Photo: ElementConfig;
    guardian1Name: ElementConfig;
    guardian2Photo: ElementConfig;
    guardian2Name: ElementConfig;
    contactInfo: ElementConfig;
    schoolHeader?: ElementConfig;
  };
}
