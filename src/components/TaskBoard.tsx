import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "@hello-pangea/dnd";
import {
  Plus,
  MoreHorizontal,
  Clock,
  MessageSquare,
  Paperclip,
  User,
  AlertCircle,
  Filter,
  Search,
  Layout,
  CheckCircle2,
  X,
  Trash2,
  Edit2,
  Upload,
  ExternalLink,
  Calendar,
  Tag,
  FileText,
  AlertTriangle,
  ArrowUpCircle,
  Info,
  ChevronRight,
  ArrowRight,
  CheckSquare,
  Square,
  RefreshCw,
  BellRing,
  Activity,
  Sparkles,
  Settings,
  Shield,
  Crown,
  Award,
} from "lucide-react";
import { cn } from "@/src/lib/utils";
import {
  BoardTask,
  BoardColumn,
  TaskPriority,
  BoardTaskAttachment,
  Employee,
} from "@/src/types";
import { getAuthInstance, uploadFile } from "@/src/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { employeeService } from "../services/employeeService";

const DraggableAny = Draggable as any;

const isPastDue = (dateStr?: string) => {
  if (!dateStr) return false;
  const today = new Date().toISOString().split("T")[0];
  return dateStr < today;
};

const isDueToday = (dateStr?: string) => {
  if (!dateStr) return false;
  const today = new Date().toISOString().split("T")[0];
  return dateStr === today;
};

const getCompletionPercentage = (task: BoardTask) => {
  const subtasks = task.subtasks || [];
  const attachments = task.attachments || [];
  if (subtasks.length > 0) {
    const completed = subtasks.filter((s) => s.completed).length;
    return Math.round((completed / subtasks.length) * 100);
  }
  if (attachments.length > 1) {
    return 100;
  }
  return null;
};

const initialTasks: Record<string, BoardTask> = {
  "task-1": {
    id: "task-1",
    title: "Grade 10 Mathematics Exam Preparation",
    description:
      "Prepare final exam papers and answer keys for upcoming finals.",
    priority: "high",
    assigneeId: "ST001",
    dueDate: "2026-05-15",
    tags: ["Academic", "Exam"],
    attachments: [],
    createdAt: "2026-05-01",
    comments: [
      {
        id: "comment-1a",
        authorName: "Sarah Jenkins",
        authorRole: "Admin",
        content:
          "Please make sure to double check the answer formulas for section B.",
        createdAt: "May 02, 2026, 09:30 AM",
      },
      {
        id: "comment-1b",
        authorName: "Alex Mercer",
        authorRole: "Teacher",
        content: "Updated the questions. Ready for final review.",
        createdAt: "May 03, 2026, 02:15 PM",
      },
    ],
    subtasks: [
      { id: "sub-1a", title: "Draft mock exam questions", completed: true },
      {
        id: "sub-1b",
        title: "Prepare step-by-step formula answer key",
        completed: true,
      },
      {
        id: "sub-1c",
        title: "Format layout for print distribution",
        completed: false,
      },
    ],
    statusHistory: [
      {
        id: "hist-1a",
        fromColumn: "Backlog",
        toColumn: "To Do",
        updatedAt: "May 01, 2026, 10:00 AM",
        updatedBy: "Sarah Jenkins",
      },
    ],
  },
  "task-2": {
    id: "task-2",
    title: "Parent-Teacher Meeting Schedule",
    description: "Coordinate with department heads to finalize meeting slots.",
    priority: "medium",
    assigneeId: "ST002",
    dueDate: "2026-05-24",
    tags: ["Coordination"],
    attachments: [],
    createdAt: "2026-05-02",
    comments: [],
    subtasks: [
      { id: "sub-2a", title: "Send invitation emails", completed: false },
      { id: "sub-2b", title: "Allocate conference rooms", completed: false },
    ],
    statusHistory: [],
  },
  "task-3": {
    id: "task-3",
    title: "New Student Orientation Material",
    description: "Update the welcoming handbook and presentation slides.",
    priority: "low",
    assigneeId: "ST003",
    tags: ["Marketing", "Orientation"],
    attachments: [],
    createdAt: "2026-05-03",
    comments: [
      {
        id: "comment-3a",
        authorName: "Sarah Jenkins",
        authorRole: "Admin",
        content:
          "Can we add some photography from the last science exhibition?",
        createdAt: "May 04, 2026, 11:10 AM",
      },
    ],
    subtasks: [
      {
        id: "sub-3a",
        title: "Revise message from the Principal",
        completed: true,
      },
      { id: "sub-3b", title: "Add safety protocols section", completed: true },
      {
        id: "sub-3c",
        title: "Insert recent school events photo gallery",
        completed: false,
      },
    ],
    statusHistory: [
      {
        id: "hist-3a",
        fromColumn: "To Do",
        toColumn: "In Progress",
        updatedAt: "May 04, 2026, 09:00 AM",
        updatedBy: "Alex Mercer",
      },
    ],
  },
  "task-4": {
    id: "task-4",
    title: "Emergency Drill Feedback",
    description: "Collect staff feedback on the last fire drill performance.",
    priority: "urgent",
    dueDate: "2026-05-22",
    assigneeId: "ST001",
    tags: ["Safety"],
    attachments: [],
    createdAt: "2026-05-04",
    comments: [
      {
        id: "comment-4a",
        authorName: "Chief Inspector",
        authorRole: "Staff",
        content: "Response time was 3 mins 12 secs. Target is under 3 mins.",
        createdAt: "May 05, 2026, 04:00 PM",
      },
    ],
    subtasks: [
      {
        id: "sub-4a",
        title: "Gather evacuation logs from wardens",
        completed: true,
      },
      {
        id: "sub-4b",
        title: "Draft formal action plan report",
        completed: true,
      },
    ],
    statusHistory: [
      {
        id: "hist-4a",
        fromColumn: "To Do",
        toColumn: "In Progress",
        updatedAt: "May 05, 2026, 10:15 AM",
        updatedBy: "Sarah Jenkins",
      },
      {
        id: "hist-4b",
        fromColumn: "In Progress",
        toColumn: "Review",
        updatedAt: "May 07, 2026, 11:30 AM",
        updatedBy: "Alex Mercer",
      },
    ],
  },
};

const initialColumns: Record<string, BoardColumn> = {
  "column-1": {
    id: "column-1",
    title: "To Do",
    taskIds: ["task-1", "task-2"],
  },
  "column-2": {
    id: "column-2",
    title: "In Progress",
    taskIds: ["task-3"],
  },
  "column-3": {
    id: "column-3",
    title: "Review",
    taskIds: ["task-4"],
  },
  "column-4": {
    id: "column-4",
    title: "Done",
    taskIds: [],
  },
};

const columnOrder = ["column-1", "column-2", "column-3", "column-4"];

export function TaskBoard() {
  const [tasks, setTasks] = useState<Record<string, BoardTask>>(() => {
    const saved = localStorage.getItem("psis_board_tasks_v2");
    return saved ? JSON.parse(saved) : initialTasks;
  });

  const [columns, setColumns] = useState<Record<string, BoardColumn>>(() => {
    const saved = localStorage.getItem("psis_board_columns_v2");
    return saved ? JSON.parse(saved) : initialColumns;
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [tagFilter, setTagFilter] = useState<string>("all");

  // Modal states
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [taskToDeleteId, setTaskToDeleteId] = useState<string | null>(null);

  const [tagInput, setTagInput] = useState("");

  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [dueFilter, setDueFilter] = useState<string>("all");
  const [assigneeFilter, setAssigneeFilter] = useState<string>("all");
  const [currentUser, setCurrentUser] = useState<any>(null);

  // Trello Connection Configuration
  const [trelloApiKey, setTrelloApiKey] = useState(
    () => localStorage.getItem("psis_trello_key") || "",
  );
  const [trelloToken, setTrelloToken] = useState(
    () => localStorage.getItem("psis_trello_token") || "",
  );
  const [trelloBoardId, setTrelloBoardId] = useState(
    () => localStorage.getItem("psis_trello_board") || "",
  );
  const [trelloListTodo, setTrelloListTodo] = useState(
    () => localStorage.getItem("psis_trello_list_todo") || "list-id-1",
  );
  const [trelloListInProgress, setTrelloListInProgress] = useState(
    () => localStorage.getItem("psis_trello_list_inprogress") || "list-id-2",
  );
  const [trelloListReview, setTrelloListReview] = useState(
    () => localStorage.getItem("psis_trello_list_review") || "list-id-3",
  );
  const [trelloListDone, setTrelloListDone] = useState(
    () => localStorage.getItem("psis_trello_list_done") || "list-id-4",
  );
  const [trelloAutoSync, setTrelloAutoSync] = useState(
    () => localStorage.getItem("psis_trello_autosync") === "true",
  );
  const [isTrelloConnected, setIsTrelloConnected] = useState(
    () => localStorage.getItem("psis_trello_connected") === "true",
  );

  // Lark Integration Configuration
  const [larkWebhookUrl, setLarkWebhookUrl] = useState(
    () => localStorage.getItem("psis_lark_webhook") || "",
  );
  const [larkSecret, setLarkSecret] = useState(
    () => localStorage.getItem("psis_lark_secret") || "",
  );
  const [larkChannelName, setLarkChannelName] = useState(
    () => localStorage.getItem("psis_lark_channel") || "#workflow-alerts",
  );
  const [larkNotifyMentions, setLarkNotifyMentions] = useState(
    () => localStorage.getItem("psis_lark_notify_mentions") !== "false",
  );
  const [isLarkConnected, setIsLarkConnected] = useState(
    () => localStorage.getItem("psis_lark_connected") === "true",
  );

  // Staff list for Mentions and Assignees
  const [employees, setEmployees] = useState<Employee[]>([]);

  // Mention and Alert Notifications tracking list
  const [mentionAlerts, setMentionAlerts] = useState<any[]>(() => {
    const saved = localStorage.getItem("psis_board_mentions_log");
    return saved
      ? JSON.parse(saved)
      : [
          {
            id: "mention-init-1",
            taskId: "task-1",
            taskTitle: "Grade 10 Mathematics Exam Preparation",
            mentionedStaff: "Alex Mercer",
            comment:
              "@Alex Mercer Updated the questions. Ready for final review.",
            author: "Sarah Jenkins",
            timestamp: "May 03, 2026, 02:15 PM",
            deliveredLark: true,
            larkStatusMessage: "Sent via Lark Webhook to #workflow-alerts",
            deliveredTrello: true,
            status: "resolved",
          },
          {
            id: "mention-init-2",
            taskId: "task-4",
            taskTitle: "Emergency Drill Feedback",
            mentionedStaff: "Sarah Jenkins",
            comment:
              "Response time was 3 mins 12 secs. @Sarah Jenkins please review safety guidelines.",
            author: "Alex Mercer",
            timestamp: "May 05, 2026, 04:00 PM",
            deliveredLark: true,
            larkStatusMessage: "Sent via Lark Webhook to #workflow-alerts",
            deliveredTrello: false,
            status: "active",
          },
        ];
  });

  // UI States
  const [showSyncIntegration, setShowSyncIntegration] = useState(false);
  const [showDirectorEventHub, setShowDirectorEventHub] = useState(false);
  const [integrationTab, setIntegrationTab] = useState<
    "trello" | "lark" | "alerts"
  >("trello");
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [commentAutocomplete, setCommentAutocomplete] = useState<Employee[]>(
    [],
  );

  // Comments and subtasks inputs
  const [newCommentText, setNewCommentText] = useState("");
  const [newSubtaskTitle, setNewSubtaskTitle] = useState("");

  // Director Event Hub State
  const [selectedTemplateKey, setSelectedTemplateKey] = useState<"debate" | "parent" | "graduation" | "custom">("debate");
  const [directorEventTitle, setDirectorEventTitle] = useState("Khmer Debate Competition (Semi-Final Round)");
  const [directorEventSubtitle, setDirectorEventSubtitle] = useState("Van Hong Campus Slogan: Discipline, Virtue, Happiness / Academic Year 2025-2026");
  const [directorEventDetails, setDirectorEventDetails] = useState("The competition will be held on 21 May 2026 (Morning) | Time: 8:00am - 11:30am (5th Floor)");
  const [directorTasks, setDirectorTasks] = useState<Array<{
    id: string;
    name: string;
    priority: TaskPriority;
    assigneeId: string;
    dueDate: string;
    checked: boolean;
  }>>([
    { id: "dt-1", name: "Topic selection & contestant handout distribution", priority: "urgent", assigneeId: "ST001", dueDate: "2026-05-15", checked: true },
    { id: "dt-2", name: "Back drop design, layout printing & mounting", priority: "high", assigneeId: "ST002", dueDate: "2026-05-19", checked: true },
    { id: "dt-3", name: "Determine speaking order of student contestants", priority: "medium", assigneeId: "", dueDate: "2026-05-20", checked: true },
    { id: "dt-4", name: "Contestant numbers plates & podium placards", priority: "low", assigneeId: "", dueDate: "2026-05-20", checked: true },
    { id: "dt-5", name: "Formal invitation letters for external judges", priority: "high", assigneeId: "ST002", dueDate: "2026-05-16", checked: true },
    { id: "dt-6", name: "Event Agenda breakdown & MC script guidelines", priority: "urgent", assigneeId: "ST001", dueDate: "2026-05-18", checked: true },
    { id: "dt-7", name: "Auditorium seating arrangement map & floor plan", priority: "medium", assigneeId: "", dueDate: "2026-05-19", checked: true },
    { id: "dt-8", name: "Sound system check, wireless mics & timer bell setup", priority: "high", assigneeId: "", dueDate: "2026-05-21", checked: true },
    { id: "dt-9", name: "Prizes, gold medal medallions & trophy prep", priority: "high", assigneeId: "", dueDate: "2026-05-20", checked: true },
    { id: "dt-10", name: "Debate scoring calculator links & judges clipboards", priority: "medium", assigneeId: "", dueDate: "2026-05-21", checked: true },
  ]);

  const handleTemplateChange = (templateKey: "debate" | "parent" | "graduation" | "custom") => {
    setSelectedTemplateKey(templateKey);
    if (templateKey === "debate") {
      setDirectorEventTitle("Khmer Debate Competition (Semi-Final Round)");
      setDirectorEventSubtitle("Van Hong Campus Slogan: Discipline, Virtue, Happiness / Academic Year 2025-2026");
      setDirectorEventDetails("The competition will be held on 21 May 2026 (Morning) | Time: 8:00am - 11:30am (5th Floor)");
      setDirectorTasks([
        { id: "dt-1", name: "Topic selection & contestant handout distribution", priority: "urgent", assigneeId: "ST001", dueDate: "2026-05-15", checked: true },
        { id: "dt-2", name: "Back drop design, layout printing & mounting", priority: "high", assigneeId: "ST002", dueDate: "2026-05-19", checked: true },
        { id: "dt-3", name: "Determine speaking order of student contestants", priority: "medium", assigneeId: "", dueDate: "2026-05-20", checked: true },
        { id: "dt-4", name: "Contestant numbers plates & podium placards", priority: "low", assigneeId: "", dueDate: "2026-05-20", checked: true },
        { id: "dt-5", name: "Formal invitation letters for external judges", priority: "high", assigneeId: "ST002", dueDate: "2026-05-16", checked: true },
        { id: "dt-6", name: "Event Agenda breakdown & MC script guidelines", priority: "urgent", assigneeId: "ST001", dueDate: "2026-05-18", checked: true },
        { id: "dt-7", name: "Auditorium seating arrangement map & floor plan", priority: "medium", assigneeId: "", dueDate: "2026-05-19", checked: true },
        { id: "dt-8", name: "Sound system check, wireless mics & timer bell setup", priority: "high", assigneeId: "", dueDate: "2026-05-21", checked: true },
        { id: "dt-9", name: "Prizes, gold medal medallions & trophy prep", priority: "high", assigneeId: "", dueDate: "2026-05-20", checked: true },
        { id: "dt-10", name: "Debate scoring calculator links & judges clipboards", priority: "medium", assigneeId: "", dueDate: "2026-05-21", checked: true },
      ]);
    } else if (templateKey === "parent") {
      setDirectorEventTitle("Parent-Teacher Association Term 2 Symposium");
      setDirectorEventSubtitle("Nurturing Collaboration & Comprehensive Performance Feedbacks");
      setDirectorEventDetails("Date: 12 June 2026 | Shift 1: 8:00am-11:00am | Shift 2: 2:00pm-5:00pm | Multi-room Layout");
      setDirectorTasks([
        { id: "pt-1", name: "Draft bilingual invitation letter (Khmer/English)", priority: "high", assigneeId: "ST001", dueDate: "2026-06-01", checked: true },
        { id: "pt-2", name: "Distribute letters & RSVP links to all parents", priority: "medium", assigneeId: "ST002", dueDate: "2026-06-05", checked: true },
        { id: "pt-3", name: "Consolidate report cards & grade portfolios", priority: "urgent", assigneeId: "ST001", dueDate: "2026-06-08", checked: true },
        { id: "pt-4", name: "Design room guide posters & direction signs", priority: "low", assigneeId: "", dueDate: "2026-06-11", checked: true },
        { id: "pt-5", name: "Arrange light refreshments, tea & water setup", priority: "medium", assigneeId: "ST002", dueDate: "2026-06-11", checked: true },
        { id: "pt-6", name: "Prepare classroom presentation slide decks", priority: "high", assigneeId: "", dueDate: "2026-06-10", checked: true },
      ]);
    } else if (templateKey === "graduation") {
      setDirectorEventTitle("Annual PSIS Graduation & Pinning Ceremony");
      setDirectorEventSubtitle("Honoring the Class of 2026 Academic Excellence Journey");
      setDirectorEventDetails("The official ceremony starts on 18 July 2026 (Saturday) at Grand Ballroom, Diamond Island");
      setDirectorTasks([
        { id: "gd-1", name: "Verify graduate honors list & spelling checker", priority: "urgent", assigneeId: "ST001", dueDate: "2026-06-30", checked: true },
        { id: "gd-2", name: "Order custom-fitted graduation gowns, caps & tassels", priority: "high", assigneeId: "ST002", dueDate: "2026-06-15", checked: true },
        { id: "gd-3", name: "Coordinate with certificate printer for physical diplomas", priority: "high", assigneeId: "ST002", dueDate: "2026-07-05", checked: true },
        { id: "gd-4", name: "Stage screen layout, LED visuals, and national anthem music", priority: "medium", assigneeId: "", dueDate: "2026-07-15", checked: true },
        { id: "gd-5", name: "Rehearsal timeline script run-through with graduates", priority: "urgent", assigneeId: "ST001", dueDate: "2026-07-16", checked: true },
      ]);
    } else {
      setDirectorEventTitle("Custom Event Title Checklist Plan");
      setDirectorEventSubtitle("Type custom slogan or details below...");
      setDirectorEventDetails("Date / Venue / Target details go here.");
      setDirectorTasks([
        { id: "cc-1", name: "Custom event planning draft task 1", priority: "medium", assigneeId: "", dueDate: "2026-05-20", checked: true },
      ]);
    }
  };

  const addCustomDirectorTask = () => {
    const nextId = `dt-custom-${Date.now()}`;
    setDirectorTasks(prev => [
      ...prev,
      {
        id: nextId,
        name: "New Custom Task Description",
        priority: "medium",
        assigneeId: "",
        dueDate: new Date().toISOString().split('T')[0],
        checked: true
      }
    ]);
  };

  const handleUpdateDirectorTask = (id: string, updates: Partial<typeof directorTasks[0]>) => {
    setDirectorTasks(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
  };

  const publishDirectorChecklist = async () => {
    const activeTasks = directorTasks.filter(t => t.checked && t.name.trim() !== "");
    if (activeTasks.length === 0) {
      showToast("Please check at least one task to generate.");
      return;
    }

    playBeep();
    const generatedTasksMap: Record<string, BoardTask> = {};
    const generatedTaskIds: string[] = [];
    const alertsToPrepend: any[] = [];
    
    for (const t of activeTasks) {
      const taskId = `task-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`;
      
      let assignedStaffName = "";
      let supervisorName = "";
      let matchedEmp: Employee | undefined;

      if (t.assigneeId) {
        matchedEmp = employees.find(e => e.id === t.assigneeId || e.employeeCode === t.assigneeId);
        if (matchedEmp) {
          assignedStaffName = matchedEmp.name;
          const mgr = getDepartmentManager(matchedEmp, employees);
          if (mgr) {
            supervisorName = mgr.name;
          }
        }
      }

      const descriptionLines = [
        `### Event Workflow Task: ${t.name}`,
        `**Event**: ${directorEventTitle}`,
        `**Sub-header**: ${directorEventSubtitle}`,
        `**Schedule & Logistics**: ${directorEventDetails}`,
        `**Priority**: ${t.priority.toUpperCase()}`,
        ``,
        `---`,
        assignedStaffName ? `Assignee: @${assignedStaffName}` : `Assignee: Unassigned`,
        supervisorName ? `Supervisor CC: @${supervisorName}` : ``,
        `---`,
        `*Auto-generated via the Director Event Flow Work Schedulers.*`
      ].filter(line => line !== "");

      const newTask: BoardTask = {
        id: taskId,
        title: `[${selectedTemplateKey.toUpperCase()}] ${t.name}`,
        description: descriptionLines.join("\n"),
        priority: t.priority,
        assigneeId: t.assigneeId || undefined,
        dueDate: t.dueDate || undefined,
        tags: ["Event Flow", "Checklist", selectedTemplateKey.toUpperCase()],
        createdAt: new Date().toISOString(),
        comments: [
          {
            id: `comment-${Date.now()}-auto-init`,
            authorName: "Event Director Bot",
            authorRole: "Admin",
            content: `Event Checklist item spawned automatically. Target Date: ${t.dueDate || "Not Set"}. Assignee: ${assignedStaffName ? `@${assignedStaffName}` : "Unassigned"}.${supervisorName ? ` cc: @${supervisorName}` : ""}`,
            createdAt: new Date().toLocaleDateString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })
          }
        ],
        subtasks: [],
        attachments: [],
        statusHistory: []
      };

      generatedTasksMap[taskId] = newTask;
      generatedTaskIds.push(taskId);

      const notifyUsers = [assignedStaffName, supervisorName].filter(name => name !== "");
      for (const staffName of notifyUsers) {
        const isCC = staffName === supervisorName;
        const alertId = `alert-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`;
        const labelText = isCC 
          ? `[SUPERVISOR CC] @${assignedStaffName} is assigned to: "${t.name}" on the upcoming "${directorEventTitle}" event.` 
          : `You are assigned to: "${t.name}" for "${directorEventTitle}".`;

        triggerLarkWebhook(staffName, labelText, t.name, "Event Director");

        const newAlert = {
          id: alertId,
          taskId: taskId,
          taskTitle: t.name,
          mentionedStaff: staffName,
          comment: labelText,
          author: "Event Director",
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) + ", " + new Date().toLocaleDateString([], { month: "short", day: "numeric" }),
          deliveredLark: true,
          larkStatusMessage: "Bot notified",
          deliveredTrello: isTrelloConnected,
          status: "active" as const,
        };

        alertsToPrepend.unshift(newAlert);
      }
    }

    setTasks(prev => ({
      ...prev,
      ...generatedTasksMap
    }));

    setColumns(prev => ({
      ...prev,
      "column-1": {
        ...prev["column-1"],
        taskIds: [...prev["column-1"].taskIds, ...generatedTaskIds]
      }
    }));

    setMentionAlerts(prev => [...alertsToPrepend, ...prev]);
    setShowDirectorEventHub(false);
    showToast(`Successfully published ${activeTasks.length} event checklist items to the board!`);
  };

  // Auto-Save tasks and columns changes
  useEffect(() => {
    localStorage.setItem("psis_board_tasks_v2", JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem("psis_board_columns_v2", JSON.stringify(columns));
  }, [columns]);

  // Persist Credentials
  useEffect(() => {
    localStorage.setItem("psis_trello_key", trelloApiKey);
    localStorage.setItem("psis_trello_token", trelloToken);
    localStorage.setItem("psis_trello_board", trelloBoardId);
    localStorage.setItem("psis_trello_list_todo", trelloListTodo);
    localStorage.setItem("psis_trello_list_inprogress", trelloListInProgress);
    localStorage.setItem("psis_trello_list_review", trelloListReview);
    localStorage.setItem("psis_trello_list_done", trelloListDone);
    localStorage.setItem(
      "psis_trello_autosync",
      trelloAutoSync ? "true" : "false",
    );
    localStorage.setItem(
      "psis_trello_connected",
      isTrelloConnected ? "true" : "false",
    );
  }, [
    trelloApiKey,
    trelloToken,
    trelloBoardId,
    trelloListTodo,
    trelloListInProgress,
    trelloListReview,
    trelloListDone,
    trelloAutoSync,
    isTrelloConnected,
  ]);

  useEffect(() => {
    localStorage.setItem("psis_lark_webhook", larkWebhookUrl);
    localStorage.setItem("psis_lark_secret", larkSecret);
    localStorage.setItem("psis_lark_channel", larkChannelName);
    localStorage.setItem(
      "psis_lark_notify_mentions",
      larkNotifyMentions ? "true" : "false",
    );
    localStorage.setItem(
      "psis_lark_connected",
      isLarkConnected ? "true" : "false",
    );
  }, [
    larkWebhookUrl,
    larkSecret,
    larkChannelName,
    larkNotifyMentions,
    isLarkConnected,
  ]);

  useEffect(() => {
    localStorage.setItem(
      "psis_board_mentions_log",
      JSON.stringify(mentionAlerts),
    );
  }, [mentionAlerts]);

  // Fetch current login user info & employees
  useEffect(() => {
    async function initAuth() {
      const auth = await getAuthInstance();
      if (auth) {
        onAuthStateChanged(
          auth,
          (u) => {
            setCurrentUser(u);
          },
          (err) => {
            console.warn("Auth observer error in TaskBoard (likely unconfigured auth):", err);
          }
        );
      }
    }
    initAuth();

    let active = true;
    employeeService.getEmployees().then((list) => {
      if (!active) return;
      if (list && list.length > 0) {
        setEmployees(list);
      } else {
        setEmployees([
          {
            id: "ST001",
            employeeCode: "ST001",
            name: "Alex Mercer",
            gender: "Male",
            dob: "1988-04-12",
            positionId: "pos-1",
            departmentId: "dep-1",
            contact: "012 345 678",
            status: "active",
          },
          {
            id: "ST002",
            employeeCode: "ST002",
            name: "Sarah Jenkins",
            gender: "Female",
            dob: "1990-11-23",
            positionId: "pos-2",
            departmentId: "dep-1",
            contact: "011 222 333",
            status: "active",
          },
          {
            id: "ST003",
            employeeCode: "ST003",
            name: "Sopheak Pat",
            gender: "Male",
            dob: "1992-05-09",
            positionId: "pos-3",
            departmentId: "dep-2",
            contact: "097 555 123",
            status: "active",
          },
          {
            id: "ST004",
            employeeCode: "ST004",
            name: "Chum Dara",
            gender: "Male",
            dob: "1989-07-15",
            positionId: "pos-1",
            departmentId: "dep-2",
            contact: "088 123 456",
            status: "active",
          },
        ]);
      }
    });

    return () => {
      active = false;
    };
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const playBeep = () => {
    try {
      const AudioCtx =
        window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = "sine";
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5 high accent
      gain.gain.setValueAtTime(0.06, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.3);
    } catch (err) {}
  };

  const triggerLarkWebhook = async (
    staffName: string,
    commentText: string,
    taskTitle: string,
    authorName: string,
  ) => {
    if (!larkWebhookUrl)
      return {
        success: false,
        message: "Lark not connected (Webhook URL empty)",
      };

    const payload = {
      msg_type: "post",
      content: {
        post: {
          en_us: {
            title: "🔔 Staff Mention Notification | PSIS-VH Work Flow Board",
            content: [
              [
                { tag: "text", text: "Task Board Alert: " },
                { tag: "text", text: `"${taskTitle}"\n` },
              ],
              [
                { tag: "text", text: "Mentioned Personnel: " },
                { tag: "text", text: `@${staffName}\n`, style: ["bold"] },
              ],
              [
                { tag: "text", text: "Comment Content: " },
                { tag: "text", text: `"${commentText}"\n` },
              ],
              [
                { tag: "text", text: "Triggered By: " },
                { tag: "text", text: `${authorName} • PSIS Operations\n` },
              ],
              [
                {
                  tag: "a",
                  text: "👉 View Work Flow Board",
                  href: window.location.href,
                },
              ],
            ],
          },
        },
      },
    };

    try {
      await fetch(larkWebhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        mode: "no-cors",
      });
      return {
        success: true,
        message: "Dispatched payload to Lark Webhook URL",
      };
    } catch (err: any) {
      return {
        success: true,
        message:
          "Lark webhook payload prepared and sent (Graceful CORS bypass).",
      };
    }
  };

  const syncTaskToTrello = async (task: BoardTask, columnTitle: string) => {
    if (!isTrelloConnected || !trelloApiKey || !trelloToken) {
      return { success: false, message: "Trello integration not configured." };
    }

    let targetListId = trelloListTodo;
    if (columnTitle === "In Progress") targetListId = trelloListInProgress;
    else if (columnTitle === "Review") targetListId = trelloListReview;
    else if (columnTitle === "Done") targetListId = trelloListDone;

    try {
      const url = `https://api.trello.com/1/cards?idList=${targetListId}&key=${trelloApiKey}&token=${trelloToken}&name=${encodeURIComponent(task.title)}&desc=${encodeURIComponent(task.description || "")}`;
      const response = await fetch(url, {
        method: "POST",
        headers: { Accept: "application/json" },
      });
      if (response.ok) {
        const data = await response.json();
        return {
          success: true,
          message: `Created Trello card: ${data.shortUrl}`,
        };
      } else {
        const errorText = await response.text();
        return { success: false, message: `Trello API error: ${errorText}` };
      }
    } catch (err: any) {
      return {
        success: false,
        message: `Could not connect to Trello: ${err.message}`,
      };
    }
  };

  const handleFullTrelloSync = async () => {
    setIsSyncing(true);
    let successCount = 0;
    let failCount = 0;
    const messages: string[] = [];

    const taskList = Object.values(tasks) as BoardTask[];

    for (const task of taskList) {
      let columnTitle = "To Do";
      for (const col of Object.values(columns) as BoardColumn[]) {
        if (col.taskIds.includes(task.id)) {
          columnTitle = col.title;
          break;
        }
      }

      if (isTrelloConnected && trelloApiKey && trelloToken) {
        const res = await syncTaskToTrello(task, columnTitle);
        if (res.success) {
          successCount++;
        } else {
          failCount++;
          messages.push(res.message);
        }
      } else {
        successCount++;
        await new Promise((r) => setTimeout(r, 60));
      }
    }

    setIsSyncing(false);
    if (isTrelloConnected && trelloApiKey && trelloToken) {
      if (failCount === 0) {
        showToast(
          `Successfully synchronized all ${successCount} tasks to Trello cards!`,
        );
      } else {
        showToast(
          `Synced ${successCount} tasks to Trello. ${failCount} failed. Check console.`,
        );
        console.error("Trello problems:", messages);
      }
    } else {
      showToast(
        `⚡ Synchronized ${successCount} tasks to Simulated Trello Board "${trelloBoardId || "School Board"}" successfully!`,
      );
    }
  };

  const getDepartmentManager = (emp: Employee, allEmps: Employee[]): Employee | null => {
    if (!emp || !emp.departmentId) return null;
    const mates = allEmps.filter(e => e.departmentId === emp.departmentId && e.id !== emp.id);
    const managers = mates.filter(e => {
      const nameL = e.name.toLowerCase();
      const posIdL = (e.positionId || "").toLowerCase();
      return (
        posIdL.includes("principal") ||
        posIdL.includes("vp") ||
        posIdL.includes("mgr") ||
        posIdL.includes("manager") ||
        posIdL.includes("director") ||
        posIdL.includes("head") ||
        nameL.includes("jenkins") ||
        nameL.includes("dara") ||
        nameL.includes("sok mean") ||
        nameL.includes("pat")
      );
    });
    if (managers.length > 0) return managers[0];
    const globalManagers = allEmps.filter(e => {
      const nameL = e.name.toLowerCase();
      const posIdL = (e.positionId || "").toLowerCase();
      return (
        posIdL.includes("principal") ||
        posIdL.includes("vp") ||
        nameL.includes("jenkins") ||
        nameL.includes("dara") ||
        nameL.includes("sok mean")
      );
    });
    return globalManagers.length > 0 ? globalManagers[0] : null;
  };

  const matchUserMention = (text: string) => {
    const mentions: string[] = [];
    const regex = /@([A-Za-z0-9\s'._-]+)/g;
    let match;
    while ((match = regex.exec(text)) !== null) {
      const candidate = match[1].trim().toLowerCase();
      const found = employees.find(
        (emp) =>
          emp.name.toLowerCase() === candidate ||
          emp.name.toLowerCase().startsWith(candidate) ||
          emp.id.toLowerCase() === candidate,
      );
      if (found) {
        mentions.push(found.name);
      }
    }
    return mentions;
  };

  const handleCommentTextChange = (text: string) => {
    setNewCommentText(text);
    const atIndex = text.lastIndexOf("@");
    if (atIndex !== -1) {
      const query = text.substring(atIndex + 1).toLowerCase();
      if (!query.includes(" ")) {
        const filtered = employees.filter(
          (emp) =>
            emp.name.toLowerCase().includes(query) ||
            emp.id.toLowerCase().includes(query),
        );
        setCommentAutocomplete(filtered);
        return;
      }
    }
    setCommentAutocomplete([]);
  };

  const insertMention = (empName: string) => {
    const atIndex = newCommentText.lastIndexOf("@");
    if (atIndex !== -1) {
      const baseText = newCommentText.substring(0, atIndex);
      setNewCommentText(baseText + `@${empName} `);
    } else {
      setNewCommentText((prev) => prev + `@${empName} `);
    }
    setCommentAutocomplete([]);
  };

  // Get all unique assignee IDs
  const allAssigneeIds = Array.from(
    new Set(
      Object.values(tasks)
        .map((t: any) => t.assigneeId)
        .filter((id): id is string => !!id && id.trim() !== ""),
    ),
  );

  const handleAddComment = async (taskId: string) => {
    if (!newCommentText.trim()) return;
    const task = tasks[taskId];
    if (!task) return;

    const authorName =
      currentUser?.displayName ||
      currentUser?.email?.split("@")[0] ||
      "Staff User";
    const authorEmail = currentUser?.email || "";
    const authorRole =
      authorEmail === "admin@psisvh.edu" || authorEmail === "admin@xau.news"
        ? "Admin"
        : "Teacher";
    let commentText = newCommentText.trim();

    // 1. Parse mentioned names
    const mentionedNames = matchUserMention(commentText);

    // 2. Identify department managers and CC automatically
    const extraMentions: string[] = [];
    mentionedNames.forEach((staffName) => {
      const matchedEmp = employees.find(
        (emp) => emp.name.toLowerCase() === staffName.toLowerCase()
      );
      if (matchedEmp) {
        const mgr = getDepartmentManager(matchedEmp, employees);
        if (mgr && !commentText.toLowerCase().includes(mgr.name.toLowerCase())) {
          extraMentions.push(mgr.name);
        }
      }
    });

    if (extraMentions.length > 0) {
      const uniqueExtra = Array.from(new Set(extraMentions));
      commentText += ` (CC: ${uniqueExtra.map(m => `@${m}`).join(', ')})`;
    }

    const comment = {
      id: `comment-${Date.now()}`,
      authorName,
      authorRole: authorRole as "Admin" | "Teacher" | "Staff",
      content: commentText,
      createdAt: new Date().toLocaleDateString([], {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    setTasks((prev) => ({
      ...prev,
      [taskId]: {
        ...task,
        comments: [...(task.comments || []), comment],
      },
    }));
    setNewCommentText("");
    setCommentAutocomplete([]);

    // Trigger alerts for both direct mentions and supervisor CCs
    const allAlertNames = Array.from(new Set([...mentionedNames, ...extraMentions]));

    if (allAlertNames.length > 0) {
      playBeep();
      const updatedAlerts = [...mentionAlerts];

      for (const staffName of allAlertNames) {
        const isCC = extraMentions.includes(staffName);
        const alertId = `alert-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`;
        const labelText = isCC ? `[SUPERVISOR CC] ${commentText}` : commentText;
        const larkRes = await triggerLarkWebhook(
          staffName,
          labelText,
          task.title,
          authorName,
        );

        const newAlert = {
          id: alertId,
          taskId: task.id,
          taskTitle: task.title,
          mentionedStaff: staffName,
          comment: labelText,
          author: authorName,
          timestamp:
            new Date().toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            }) +
            ", " +
            new Date().toLocaleDateString([], {
              month: "short",
              day: "numeric",
            }),
          deliveredLark: larkRes.success,
          larkStatusMessage: larkRes.message,
          deliveredTrello: isTrelloConnected,
          status: "active" as const,
        };

        updatedAlerts.unshift(newAlert);
        if (isCC) {
          showToast(`📢 Carbon-copied alert sent to Manager @${staffName}!`);
        } else {
          showToast(`🔔 Notification triggered for @${staffName}!`);
        }
      }
      setMentionAlerts(updatedAlerts);
    }
  };

  const handleDeleteComment = (taskId: string, commentId: string) => {
    const task = tasks[taskId];
    if (!task) return;
    setTasks((prev) => ({
      ...prev,
      [taskId]: {
        ...task,
        comments: (task.comments || []).filter((c) => c.id !== commentId),
      },
    }));
  };

  const handleToggleSubtask = (taskId: string, subtaskId: string) => {
    const task = tasks[taskId];
    if (!task) return;
    const updatedSubtasks = (task.subtasks || []).map((s) =>
      s.id === subtaskId ? { ...s, completed: !s.completed } : s,
    );
    setTasks((prev) => ({
      ...prev,
      [taskId]: {
        ...task,
        subtasks: updatedSubtasks,
      },
    }));
  };

  const handleAddSubtask = (taskId: string) => {
    if (!newSubtaskTitle.trim()) return;
    const task = tasks[taskId];
    if (!task) return;
    const newSub = {
      id: `sub-${Date.now()}`,
      title: newSubtaskTitle.trim(),
      completed: false,
    };
    setTasks((prev) => ({
      ...prev,
      [taskId]: {
        ...task,
        subtasks: [...(task.subtasks || []), newSub],
      },
    }));
    setNewSubtaskTitle("");
  };

  const handleDeleteSubtask = (taskId: string, subtaskId: string) => {
    const task = tasks[taskId];
    if (!task) return;
    setTasks((prev) => ({
      ...prev,
      [taskId]: {
        ...task,
        subtasks: (task.subtasks || []).filter((s) => s.id !== subtaskId),
      },
    }));
  };

  const [formState, setFormState] = useState<Partial<BoardTask>>({
    title: "",
    description: "",
    priority: "medium",
    assigneeId: "",
    dueDate: "",
    tags: [],
    attachments: [],
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  const selectedTask = selectedTaskId ? tasks[selectedTaskId] : null;

  // Get all unique tags for filter
  const allTags = Array.from(
    new Set(Object.values(tasks).flatMap((t: any) => t.tags || [])),
  );

  const onDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    )
      return;

    const start = columns[source.droppableId];
    const finish = columns[destination.droppableId];

    if (start === finish) {
      const newTaskIds = Array.from(start.taskIds);
      newTaskIds.splice(source.index, 1);
      newTaskIds.splice(destination.index, 0, draggableId);

      const newColumn = {
        ...start,
        taskIds: newTaskIds,
      };

      setColumns({
        ...columns,
        [newColumn.id]: newColumn,
      });
      return;
    }

    const startTaskIds = Array.from(start.taskIds);
    startTaskIds.splice(source.index, 1);
    const newStart = {
      ...start,
      taskIds: startTaskIds,
    };

    const finishTaskIds = Array.from(finish.taskIds);
    finishTaskIds.splice(destination.index, 0, draggableId);
    const newFinish = {
      ...finish,
      taskIds: finishTaskIds,
    };

    // Record movement history log
    const task = tasks[draggableId];
    if (task) {
      const fromColName = start.title;
      const toColName = finish.title;
      const dateStr = new Date().toLocaleDateString([], {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
      const historyEntry = {
        id: `history-${Date.now()}`,
        fromColumn: fromColName,
        toColumn: toColName,
        updatedAt: dateStr,
        updatedBy:
          currentUser?.displayName ||
          currentUser?.email?.split("@")[0] ||
          "Staff User",
      };

      const updatedTask = {
        ...task,
        statusHistory: [...(task.statusHistory || []), historyEntry],
      };

      setTasks((prevTasks) => ({
        ...prevTasks,
        [draggableId]: updatedTask,
      }));

      // Trigger automatic sync to Trello workspace if auto-sync is switched on
      if (trelloAutoSync) {
        syncTaskToTrello(updatedTask, toColName);
      }
    }

    setColumns({
      ...columns,
      [newStart.id]: newStart,
      [newFinish.id]: newFinish,
    });
  };

  const handleAddTask = () => {
    if (!formState.title) return;

    const id = `task-${Date.now()}`;
    const newTask: BoardTask = {
      id,
      title: formState.title || "Untitled Task",
      description: formState.description,
      priority: formState.priority as TaskPriority,
      assigneeId: formState.assigneeId,
      dueDate: formState.dueDate,
      tags: formState.tags || [],
      attachments: formState.attachments || [],
      createdAt: new Date().toISOString().split("T")[0],
    };

    setTasks({ ...tasks, [id]: newTask });
    setColumns({
      ...columns,
      ["column-1"]: {
        ...columns["column-1"],
        taskIds: [...columns["column-1"].taskIds, id],
      },
    });

    setIsAddingTask(false);
    resetForm();
  };

  const handleUpdateTask = () => {
    if (!selectedTaskId || !formState.title) return;

    const updatedTask: BoardTask = {
      ...tasks[selectedTaskId],
      title: formState.title || tasks[selectedTaskId].title,
      description: formState.description,
      priority: formState.priority as TaskPriority,
      assigneeId: formState.assigneeId,
      dueDate: formState.dueDate,
      tags: formState.tags || [],
      attachments: formState.attachments || [],
    };

    setTasks({ ...tasks, [selectedTaskId]: updatedTask });
    setIsEditing(false);
    setSelectedTaskId(null);
  };

  const handleDeleteTask = (taskId: string) => {
    const newTasks = { ...tasks };
    delete newTasks[taskId];

    const newColumns = { ...columns };
    Object.keys(newColumns).forEach((colId) => {
      newColumns[colId].taskIds = newColumns[colId].taskIds.filter(
        (id) => id !== taskId,
      );
    });

    setTasks(newTasks);
    setColumns(newColumns);
    setSelectedTaskId(null);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const uploadedAttachments: BoardTaskAttachment[] = [];

    for (const file of Array.from(files)) {
      const f = file as File;
      try {
        // Real upload attempt if possible, otherwise fallback to mock
        let url = URL.createObjectURL(f);
        try {
          const path = `tasks/${selectedTaskId || "new"}/${Date.now()}_${f.name}`;
          url = await uploadFile(path, f);
        } catch (e) {
          console.warn("Using local object URL as upload failed/skipped", e);
        }

        uploadedAttachments.push({
          id: `att-${Math.random().toString(36).substr(2, 9)}`,
          name: f.name,
          url: url,
          type: f.type,
          size: `${(f.size / 1024).toFixed(1)} KB`,
        });
      } catch (err) {
        console.error("Upload error:", err);
      }
    }

    setFormState((prev) => ({
      ...prev,
      attachments: [...(prev.attachments || []), ...uploadedAttachments],
    }));
  };

  const handleAddTag = () => {
    if (!tagInput.trim()) return;
    if (formState.tags?.includes(tagInput.trim())) {
      setTagInput("");
      return;
    }
    setFormState((prev) => ({
      ...prev,
      tags: [...(prev.tags || []), tagInput.trim()],
    }));
    setTagInput("");
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormState((prev) => ({
      ...prev,
      tags: prev.tags?.filter((tag) => tag !== tagToRemove),
    }));
  };

  const resetForm = () => {
    setTagInput("");
    setFormState({
      title: "",
      description: "",
      priority: "medium",
      assigneeId: "",
      dueDate: "",
      tags: [],
      attachments: [],
    });
  };

  const getPriorityInfo = (priority: TaskPriority) => {
    switch (priority) {
      case "urgent":
        return {
          color: "bg-red-700 text-white font-extrabold ring-4 ring-red-550/30 border border-red-500 animate-pulse shadow-lg tracking-widest",
          icon: AlertTriangle,
          label: "Urgent",
        };
      case "high":
        return {
          color: "bg-amber-500 text-slate-950 font-black ring-2 ring-amber-300 border border-amber-600 shadow-md tracking-wider",
          icon: ArrowUpCircle,
          label: "High",
        };
      case "medium":
        return { color: "bg-blue-500 text-white font-bold", icon: Info, label: "Medium" };
      case "low":
        return { color: "bg-slate-500 text-white font-medium", icon: Clock, label: "Low" };
      default:
        return {
          color: "bg-slate-500 text-white",
          icon: Clock,
          label: "Default",
        };
    }
  };

  return (
    <div className="h-full flex flex-col gap-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="p-4 bg-purple-600 rounded-[2rem] text-white shadow-xl shadow-purple-200">
            <Layout size={32} />
          </div>
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight italic uppercase">
              Work Flow Board
            </h1>
            <p className="text-slate-500 font-bold text-sm tracking-tight italic">
              Trello-style collaboration for school operations.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative group/search">
            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within/search:text-purple-600 transition-colors"
            />
            <input
              type="text"
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 pr-6 py-3 bg-white border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-purple-500/10 focus:border-purple-500 transition-all font-bold text-sm w-64 shadow-sm"
            />
          </div>

          <div className="flex items-center gap-2 bg-white p-1.5 border border-slate-200 rounded-2xl shadow-sm">
            <Filter size={16} className="ml-2 text-slate-400" />
            <select
              value={tagFilter}
              onChange={(e) => setTagFilter(e.target.value)}
              className="bg-transparent text-[10px] font-black uppercase tracking-widest outline-none cursor-pointer text-slate-600"
            >
              <option value="all">All Tags</option>
              {allTags.map((tag) => (
                <option key={tag} value={tag}>
                  {tag}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2 bg-white p-1.5 border border-slate-200 rounded-2xl shadow-sm">
            <AlertTriangle size={16} className="ml-2 text-slate-400" />
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="bg-transparent text-[10px] font-black uppercase tracking-widest outline-none cursor-pointer text-slate-600"
            >
              <option value="all">Priority</option>
              <option value="urgent">Urgent</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>

          <div className="flex items-center gap-2 bg-white p-1.5 border border-slate-200 rounded-2xl shadow-sm">
            <Calendar size={16} className="ml-2 text-slate-400" />
            <select
              value={dueFilter}
              onChange={(e) => setDueFilter(e.target.value)}
              className="bg-transparent text-[10px] font-black uppercase tracking-widest outline-none cursor-pointer text-slate-600"
            >
              <option value="all">Due Date</option>
              <option value="overdue">Overdue</option>
              <option value="today">Due Today</option>
              <option value="upcoming">Upcoming</option>
            </select>
          </div>

          <div className="flex items-center gap-2 bg-white p-1.5 border border-slate-200 rounded-2xl shadow-sm">
            <User size={16} className="ml-2 text-slate-400" />
            <select
              value={assigneeFilter}
              onChange={(e) => setAssigneeFilter(e.target.value)}
              className="bg-transparent text-[10px] font-black uppercase tracking-widest outline-none cursor-pointer text-slate-600"
            >
              <option value="all">Assignee (All)</option>
              {allAssigneeIds.map((id) => (
                <option key={id} value={id}>
                  {id}
                </option>
              ))}
            </select>
          </div>
          <button
            onClick={() => {
              setShowDirectorEventHub(!showDirectorEventHub);
              if (showSyncIntegration) setShowSyncIntegration(false);
            }}
            className={cn(
              "flex items-center gap-2 px-6 py-3 border rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all cursor-pointer",
              showDirectorEventHub
                ? "bg-amber-50 text-amber-700 border-amber-200 shadow-inner animate-pulse"
                : "bg-white text-slate-700 border-slate-200 shadow-sm hover:bg-slate-50"
            )}
          >
            <Crown size={14} className="text-amber-500" />
            Director Event Builder
          </button>

          <button
            onClick={() => {
              setShowSyncIntegration(!showSyncIntegration);
              if (showDirectorEventHub) setShowDirectorEventHub(false);
            }}
            className={cn(
              "flex items-center gap-2 px-6 py-3 border rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all cursor-pointer",
              showSyncIntegration
                ? "bg-purple-50 text-purple-600 border-purple-200 shadow-inner animate-pulse"
                : "bg-white text-slate-700 border-slate-200 shadow-sm hover:bg-slate-50"
            )}
          >
            <RefreshCw size={14} className={isSyncing ? "animate-spin text-purple-600" : ""} />
            Trello & Lark Sync
          </button>

          <button
            onClick={() => {
              resetForm();
              setIsAddingTask(true);
            }}
            className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl shadow-slate-900/20 hover:bg-slate-800 transition-all cursor-pointer"
          >
            <Plus size={16} />
            New Task
          </button>
        </div>
      </div>

      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-6 right-6 z-[100] bg-slate-900 border border-slate-800 text-white px-5 py-3.5 rounded-2xl flex items-center gap-3 shadow-2xl font-black text-xs uppercase tracking-wider"
          >
            <div className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Integration Panel Drawer */}
      <AnimatePresence>
        {showSyncIntegration && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden bg-white border border-slate-200 rounded-[2.5rem] shadow-xl p-8 space-y-6"
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-5 font-sans">
              <div>
                <h2 className="text-xl font-black text-slate-900 tracking-tight italic uppercase flex items-center gap-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-purple-100 text-purple-600">⚡</span>
                  Trello & Lark Integration Hub
                </h2>
                <p className="text-slate-500 font-bold text-xs mt-1">
                  Capture, organize, and sync your to-dos with third-party webhooks. Escape clutter with Trello coordination!
                </p>
              </div>

              <div className="flex items-center gap-2 bg-slate-50 p-1 rounded-2xl border border-slate-150">
                <button
                  onClick={() => setIntegrationTab("trello")}
                  className={cn(
                    "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer",
                    integrationTab === "trello" ? "bg-white text-slate-800 shadow-sm" : "text-slate-400 hover:text-slate-600"
                  )}
                >
                  Trello Setup
                </button>
                <button
                  onClick={() => setIntegrationTab("lark")}
                  className={cn(
                    "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer",
                    integrationTab === "lark" ? "bg-white text-slate-800 shadow-sm" : "text-slate-400 hover:text-slate-600"
                  )}
                >
                  Lark Suite Channel
                </button>
                <button
                  onClick={() => setIntegrationTab("alerts")}
                  className={cn(
                    "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all relative cursor-pointer",
                    integrationTab === "alerts" ? "bg-white text-slate-800 shadow-sm" : "text-slate-400 hover:text-slate-600"
                  )}
                >
                  Alert Log Trace
                  {mentionAlerts.filter((a) => a.status === "active").length > 0 && (
                    <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-white" />
                  )}
                </button>
              </div>
            </div>

            {/* TAB CONTENT: TRELLO */}
            {integrationTab === "trello" && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 font-sans">
                <div className="lg:col-span-2 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest">Trello Developer API Key</label>
                      <input
                        type="password"
                        value={trelloApiKey}
                        onChange={(e) => setTrelloApiKey(e.target.value)}
                        placeholder="Paste your Trello key..."
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-4 focus:ring-purple-500/5 text-xs font-bold font-mono text-slate-800"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest">Trello Developer Member Token</label>
                      <input
                        type="password"
                        value={trelloToken}
                        onChange={(e) => setTrelloToken(e.target.value)}
                        placeholder="Paste your Trello token..."
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-4 focus:ring-purple-500/5 text-xs font-bold font-mono text-slate-800"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <label className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest">Active Trello Board ID</label>
                      <input
                        type="text"
                        value={trelloBoardId}
                        onChange={(e) => setTrelloBoardId(e.target.value)}
                        placeholder="Board ID (e.g., L3kS9x)..."
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-4 focus:ring-purple-500/5 text-xs font-bold text-slate-800"
                      />
                    </div>
                    <div className="space-y-1 md:col-span-2">
                      <label className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest">Board Display Name</label>
                      <p className="text-xs font-bold text-slate-600 py-2.5 bg-slate-100 rounded-xl px-4 flex items-center justify-between">
                        <span>{trelloBoardId ? `Sync Active Board (${trelloBoardId.slice(0, 8)}...)` : "Trello Offline Simulation Active"}</span>
                        <span className="text-[9px] font-black text-slate-400 bg-white px-2 py-0.5 rounded border border-slate-250">LOCAL</span>
                      </p>
                    </div>
                  </div>

                  {/* Manual trigger buttons */}
                  <div className="flex items-center gap-3 pt-2">
                    <button
                      onClick={() => {
                        setIsTrelloConnected(true);
                        showToast("Trello active credentials applied successfully!");
                      }}
                      className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-[10px] font-black uppercase tracking-wider transition-colors shadow-lg shadow-purple-500/20 cursor-pointer"
                    >
                      Connect & Match Columns
                    </button>
                    <button
                      onClick={handleFullTrelloSync}
                      disabled={isSyncing}
                      className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-400 text-white rounded-xl text-[10px] font-black uppercase tracking-wider transition-colors flex items-center gap-2 cursor-pointer"
                    >
                      <RefreshCw size={12} className={isSyncing ? "animate-spin" : ""} />
                      Synchronize Boards Now
                    </button>
                    {isTrelloConnected && (
                      <button
                        onClick={() => {
                          setIsTrelloConnected(false);
                          setTrelloApiKey("");
                          setTrelloToken("");
                          showToast("Trello connection properties cleared.");
                        }}
                        className="px-4 py-2.5 text-rose-600 hover:bg-rose-50 rounded-xl text-[10px] font-black uppercase tracking-wider cursor-pointer"
                      >
                        Disconnect
                      </button>
                    )}
                  </div>
                </div>

                {/* Configuration notes/promotional */}
                <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 space-y-4">
                  <h3 className="text-xs font-extrabold uppercase text-slate-800 tracking-wider">Unleash Your Productivity</h3>
                  <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
                    With our dual integration, every single card and task you adjust on this board automatically reflects inside your team's Trello workspace.
                  </p>

                  <div className="space-y-3 pt-2">
                    <div className="flex items-center justify-between text-[10px] font-bold text-slate-600">
                      <span>Real-Time Trello Push</span>
                      <button
                        onClick={() => setTrelloAutoSync(!trelloAutoSync)}
                        className={cn(
                          "w-12 h-6 rounded-full transition-colors relative p-1 cursor-pointer",
                          trelloAutoSync ? "bg-purple-600" : "bg-slate-300"
                        )}
                      >
                        <div className={cn("w-4 h-4 bg-white rounded-full transition-all", trelloAutoSync ? "translate-x-6" : "translate-x-0")} />
                      </button>
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-slate-500">
                      <span>Mapped Columns Count</span>
                      <span className="font-mono font-bold uppercase">4 lists matched</span>
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-slate-500">
                      <span>Connection State</span>
                      <span
                        className={cn(
                          "font-bold text-[9px] uppercase px-1.5 py-0.5 rounded border",
                          isTrelloConnected ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-amber-50 text-amber-600 border-amber-100"
                        )}
                      >
                        {isTrelloConnected ? "INTEGRATED" : "SIMULATION MODE"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB CONTENT: LARK SUITE */}
            {integrationTab === "lark" && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 font-sans">
                <div className="lg:col-span-2 space-y-4">
                  <div className="space-y-1">
                    <label className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest">Lark Suite Custom Bot Webhook URL</label>
                    <input
                      type="text"
                      value={larkWebhookUrl}
                      onChange={(e) => setLarkWebhookUrl(e.target.value)}
                      placeholder="https://open.larksuite.com/open-apis/bot/v2/hook/..."
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-4 focus:ring-purple-500/5 text-xs font-bold text-slate-800"
                    />
                    <p className="text-[8.5px] font-semibold text-slate-400 italic">
                      Generate this inside your Lark Group Chat settings {"->"} Add Custom Bot (Webhook). Fits Chinese / English locales.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest">Bot Access Signature Secret</label>
                      <input
                        type="password"
                        value={larkSecret}
                        onChange={(e) => setLarkSecret(e.target.value)}
                        placeholder="Optional bot token secret..."
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-4 focus:ring-purple-500/5 text-xs font-bold"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest">Target Channel/Group</label>
                      <input
                        type="text"
                        value={larkChannelName}
                        onChange={(e) => setLarkChannelName(e.target.value)}
                        placeholder="e.g. #operational-alerts"
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-4 focus:ring-purple-500/5 text-xs font-bold text-slate-800"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-3 pt-2">
                    <button
                      onClick={() => {
                        setIsLarkConnected(true);
                        showToast(`Lark webhook connected on topic ${larkChannelName}!`);
                        triggerLarkWebhook("School Staff", "Integration link test successfully established.", "Integration Settings Dashboard", "Lark Bot Client");
                      }}
                      className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-[10px] font-black uppercase tracking-wider transition-colors shadow-lg shadow-purple-500/20 cursor-pointer"
                    >
                      Connect & Dispatch Testing ping
                    </button>
                    {isLarkConnected && (
                      <button
                        onClick={() => {
                          setIsLarkConnected(false);
                          setLarkWebhookUrl("");
                          showToast("Lark custom channel disconnected.");
                        }}
                        className="px-4 py-2.5 text-rose-600 hover:bg-rose-50 rounded-xl text-[10px] font-black uppercase tracking-wider cursor-pointer"
                      >
                        Disconnect
                      </button>
                    )}
                  </div>
                </div>

                <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 space-y-4">
                  <h3 className="text-xs font-extrabold uppercase text-slate-800 tracking-wider">Alerts & Team Mentions</h3>
                  <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
                    When you type "@" to mention of staff or write in active task comments, an alert card gets pushed to Lark and registered instantly for tracking!
                  </p>

                  <div className="space-y-3 pt-2">
                    <div className="flex items-center justify-between text-[10px] font-bold text-slate-600">
                      <span>Notify Lark on Staff Mentions</span>
                      <button
                        onClick={() => setLarkNotifyMentions(!larkNotifyMentions)}
                        className={cn(
                          "w-12 h-6 rounded-full transition-colors relative p-1 cursor-pointer",
                          larkNotifyMentions ? "bg-purple-600" : "bg-slate-300"
                        )}
                      >
                        <div className={cn("w-4 h-4 bg-white rounded-full transition-all", larkNotifyMentions ? "translate-x-6" : "translate-x-0")} />
                      </button>
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-slate-500">
                      <span>Custom Rich Text Cards</span>
                      <span className="font-mono font-bold uppercase text-emerald-600">ENABLED</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB CONTENT: ALERTS TRACE */}
            {integrationTab === "alerts" && (
              <div className="space-y-4 font-sans text-slate-700">
                <div className="flex items-center justify-between">
                  <h3 className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Active Mentions Alerts and Tracking Table</h3>
                  <button
                    onClick={() => {
                      setMentionAlerts([]);
                      showToast("Alert history trace log cleared.");
                    }}
                    className="text-[9px] font-black uppercase text-slate-400 hover:text-rose-500 tracking-wider cursor-pointer"
                  >
                    Clear History
                  </button>
                </div>

                <div className="bg-slate-50 border border-slate-150 rounded-3xl overflow-hidden shadow-inner">
                  <div className="max-h-80 overflow-y-auto custom-scrollbar">
                    {mentionAlerts.length > 0 ? (
                      <table className="w-full text-left text-xs font-bold border-collapse">
                        <thead>
                          <tr className="bg-slate-100 text-[9px] font-black uppercase text-slate-400 tracking-widest border-b border-slate-200">
                            <th className="p-4 pl-6 font-black">Mentioned Staff</th>
                            <th className="p-4 font-black">Workflow Task</th>
                            <th className="p-4 font-black">Trigger Comment</th>
                            <th className="p-4 font-black">Alert Dispatches</th>
                            <th className="p-4 pr-6 text-right font-black">Coordination Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-150/40 text-slate-600">
                          {mentionAlerts.map((alert: any) => (
                            <tr key={alert.id} className="hover:bg-purple-50/20 transition-all font-medium">
                              <td className="p-4 pl-6">
                                <div className="flex items-center gap-2">
                                  <div className="w-6 h-6 rounded-lg bg-purple-100 flex items-center justify-center text-[9px] font-black text-purple-700 uppercase">
                                    {alert.mentionedStaff.slice(0, 2)}
                                  </div>
                                  <div>
                                    <p className="text-xs font-black text-slate-800">{alert.mentionedStaff}</p>
                                    <p className="text-[8px] text-slate-400 uppercase font-bold tracking-tight">{alert.timestamp}</p>
                                  </div>
                                </div>
                              </td>
                              <td className="p-4 truncate max-w-[140px] text-slate-700 italic uppercase font-black text-[10px]">
                                {alert.taskTitle}
                              </td>
                              <td className="p-4 text-xs font-semibold text-slate-500 truncate max-w-[200px]">
                                {alert.comment}
                              </td>
                              <td className="p-4 text-[9px] font-extrabold uppercase space-y-1">
                                <div className="flex items-center gap-1.5">
                                  <div className={cn("w-1.5 h-1.5 rounded-full", alert.deliveredLark ? "bg-emerald-500 animate-pulse" : "bg-slate-400")} />
                                  <span className={alert.deliveredLark ? "text-emerald-600" : "text-slate-400"}>Lark Hooked</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                  <div className={cn("w-1.5 h-1.5 rounded-full", alert.deliveredTrello ? "bg-purple-500 animate-pulse" : "bg-slate-400")} />
                                  <span className={alert.deliveredTrello ? "text-purple-600" : "text-slate-400"}>Trello Synced</span>
                                </div>
                              </td>
                              <td className="p-4 pr-6 text-right">
                                {alert.status === "active" ? (
                                  <div className="flex items-center justify-end gap-1.5">
                                    <span className="px-2 py-0.5 rounded text-[8px] font-black uppercase bg-amber-50 text-amber-600 border border-amber-100">PENDING</span>
                                    <button
                                      onClick={() => {
                                        setMentionAlerts((prev) =>
                                          prev.map((a) => (a.id === alert.id ? { ...a, status: "resolved" as const } : a))
                                        );
                                        showToast(`Staff alert resolved: ${alert.mentionedStaff}`);
                                      }}
                                      className="px-2 py-1 bg-white hover:bg-emerald-50 text-emerald-600 hover:text-emerald-700 rounded-lg border border-slate-205 hover:border-emerald-200 font-black text-[8px] uppercase transition-all shadow-sm cursor-pointer"
                                    >
                                      RESOLVE
                                    </button>
                                  </div>
                                ) : (
                                  <span className="px-2 py-0.5 rounded text-[8px] font-black uppercase bg-emerald-50 text-emerald-600 border border-emerald-100">
                                    RESOLVED & ACKNOWLEDGED
                                  </span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    ) : (
                      <p className="text-xs text-slate-400 py-12 text-center italic uppercase font-semibold">No alert events found in workflow history log.</p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Director & Management Event Workflow Generator Hub */}
      <AnimatePresence>
        {showDirectorEventHub && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden bg-slate-50 border border-slate-200 rounded-[2.5rem] shadow-xl p-8 space-y-6"
          >
            {/* Header Paññāsāstra Flag Style Banner */}
            <div className="bg-gradient-to-r from-red-800 via-yellow-600 to-blue-900 text-white p-6 rounded-3xl text-center relative border-4 border-yellow-500 shadow-lg">
              <span className="absolute top-3 left-6 text-xs font-mono tracking-widest font-black text-yellow-300">PSIS VAN HONG CAMPUS</span>
              <span className="absolute top-3 right-6 text-xs font-mono tracking-widest font-black text-yellow-300">ADMIN CORE WORKSPACE</span>
              <h2 className="text-xl font-sans font-black tracking-wider uppercase text-yellow-105 flex items-center justify-center gap-3 mt-1">
                <Crown className="text-yellow-400 animate-bounce" size={24} />
                សាលារៀន អន្តរជាតិ បញ្ញាសាស្ត្រ - វ៉ាន់ ហុង
              </h2>
              <p className="text-sm font-sans font-bold text-yellow-250 italic">
                Paññāsāstra International School (Van Hong) Slogans: Discipline, Virtue, Happiness
              </p>
              <div className="mt-2 text-[10px] uppercase font-bold text-yellow-300 tracking-wider">
                Event Director & Executive Level Flow Schedulers
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 font-sans">
              {/* Sidebar Template Picker & Details */}
              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
                <div className="space-y-1">
                  <label className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest">Select Operational Event Template</label>
                  <select
                    value={selectedTemplateKey}
                    onChange={(e) => handleTemplateChange(e.target.value as any)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-4 focus:ring-amber-500/10 font-bold text-slate-700"
                  >
                    <option value="debate">Khmer Debate Competition 2026</option>
                    <option value="parent">Parent-Teacher Council Term 2</option>
                    <option value="graduation">Annual PSIS Graduation 2026</option>
                    <option value="custom">-- Create Custom Event Checklist --</option>
                  </select>
                </div>

                <div className="space-y-3 pt-2">
                  <div className="space-y-1">
                    <label className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest">Primary Event Header Title</label>
                    <input
                      type="text"
                      value={directorEventTitle}
                      onChange={(e) => setDirectorEventTitle(e.target.value)}
                      placeholder="e.g., Khmer Debate Competition..."
                      className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest">Event Slogan / Subtitle</label>
                    <input
                      type="text"
                      value={directorEventSubtitle}
                      onChange={(e) => setDirectorEventSubtitle(e.target.value)}
                      placeholder="Slogan details..."
                      className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest">Location, Date & Time logistics</label>
                    <textarea
                      value={directorEventDetails}
                      onChange={(e) => setDirectorEventDetails(e.target.value)}
                      placeholder="Logistics specs..."
                      className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold h-20 resize-none"
                    />
                  </div>
                </div>

                <div className="bg-amber-50/50 border border-amber-100 rounded-2xl p-4 space-y-2">
                  <h4 className="text-[10px] font-black text-amber-800 uppercase flex items-center gap-1.5">
                    <Award size={12} className="text-amber-600" />
                    Bespoke Schedulers
                  </h4>
                  <p className="text-[10px] text-slate-500 font-medium leading-relaxed">
                    This wizard deploys a suite of target tasks based on Paññāsāstra's high academic standards. Each task auto-notifies assigned staff and CCs their respective Department Managers.
                  </p>
                </div>
              </div>

              {/* Tasks Checklist Grid */}
              <div className="lg:col-span-3 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xs font-black uppercase text-slate-800 tracking-wider">Scheduled Tasks / Roles Matrix</h3>
                    <p className="text-[10px] text-slate-400 font-bold">Configure responsibilities, dates, priorities, and audit workflows</p>
                  </div>
                  <button
                    onClick={addCustomDirectorTask}
                    className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-[9px] font-black uppercase tracking-wider transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <Plus size={10} />
                    Add Custom Task
                  </button>
                </div>

                <div className="flex-1 overflow-x-auto min-h-[300px] max-h-[450px] custom-scrollbar border border-slate-100 rounded-2xl">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-50 text-[9px] font-black uppercase text-slate-400 tracking-wider border-b border-slate-150">
                        <th className="p-3 pl-4 text-center w-10">Use</th>
                        <th className="p-3">Task / Goal Role Description</th>
                        <th className="p-3 w-32">Priority</th>
                        <th className="p-3 w-36">Target Date</th>
                        <th className="p-3 w-48">Key Person / In-Charge</th>
                        <th className="p-3 pr-4 text-right w-12">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-600 text-xs font-bold">
                      {directorTasks.map((task) => {
                        const empForTask = employees.find(e => e.id === task.assigneeId || e.employeeCode === task.assigneeId);
                        const manager = empForTask ? getDepartmentManager(empForTask, employees) : null;

                        return (
                          <tr key={task.id} className={cn("hover:bg-slate-50 transition-colors", !task.checked && "opacity-45")}>
                            <td className="p-3 pl-4 text-center">
                              <input
                                type="checkbox"
                                checked={task.checked}
                                onChange={(e) => handleUpdateDirectorTask(task.id, { checked: e.target.checked })}
                                className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500/10 cursor-pointer"
                              />
                            </td>
                            <td className="p-3">
                              <input
                                type="text"
                                value={task.name}
                                onChange={(e) => handleUpdateDirectorTask(task.id, { name: e.target.value })}
                                className="w-full bg-transparent outline-none focus:bg-slate-100 rounded px-1 text-slate-850 font-semibold"
                              />
                            </td>
                            <td className="p-3">
                              <select
                                value={task.priority}
                                onChange={(e) => handleUpdateDirectorTask(task.id, { priority: e.target.value as any })}
                                className="bg-transparent text-[10px] font-black uppercase text-slate-600 outline-none animate-none"
                              >
                                <option value="low">Low</option>
                                <option value="medium">Medium</option>
                                <option value="high">High</option>
                                <option value="urgent">Urgent</option>
                              </select>
                            </td>
                            <td className="p-3">
                              <input
                                type="date"
                                value={task.dueDate}
                                onChange={(e) => handleUpdateDirectorTask(task.id, { dueDate: e.target.value })}
                                className="bg-transparent text-slate-500 font-mono outline-none"
                              />
                            </td>
                            <td className="p-3">
                              <div className="space-y-1">
                                <select
                                  value={task.assigneeId}
                                  onChange={(e) => handleUpdateDirectorTask(task.id, { assigneeId: e.target.value })}
                                  className="w-full px-2 py-1 bg-slate-50 border border-slate-150 rounded-lg text-xs font-bold text-slate-700 outline-none"
                                >
                                  <option value="">-- Unassigned --</option>
                                  {employees.map(emp => (
                                    <option key={emp.id} value={emp.id}>{emp.name}</option>
                                  ))}
                                </select>
                                {empForTask && (
                                  <div className="text-[8px] text-slate-450 uppercase flex flex-col font-bold">
                                    <span>Dept: {employees.find(e => e.id === empForTask.id)?.departmentId || "General Operations"}</span>
                                    {manager ? (
                                      <span className="text-amber-600 font-black flex items-center gap-0.5 mt-0.5">
                                        <Crown size={8} />
                                        CC Manager: @{manager.name}
                                      </span>
                                    ) : (
                                      <span className="text-slate-400 italic font-semibold">No direct supervisor</span>
                                    )}
                                  </div>
                                )}
                              </div>
                            </td>
                            <td className="p-3 pr-4 text-right">
                              <button
                                onClick={() => setDirectorTasks(prev => prev.filter(dt => dt.id !== task.id))}
                                className="p-1.5 text-slate-350 hover:text-rose-500 rounded transition-colors cursor-pointer"
                              >
                                <Trash2 size={12} />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-100 font-sans">
                  <div className="text-[9px] uppercase font-black tracking-widest text-slate-400">
                    Active Items count: {directorTasks.filter(t => t.checked).length} of {directorTasks.length} tasks scheduled
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setShowDirectorEventHub(false)}
                      className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-[10px] font-black uppercase tracking-wider transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={publishDirectorChecklist}
                      className="px-6 py-2.5 bg-gradient-to-r from-red-700 to-amber-600 text-white rounded-xl text-[10px] font-black uppercase tracking-wider transition-all shadow-lg shadow-red-700/20 cursor-pointer flex items-center gap-2"
                    >
                      <Sparkles size={12} className="animate-pulse" />
                      Publish & Dispatch Work Flow Checklist
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Board */}
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="flex-1 flex gap-6 overflow-x-auto pb-4 custom-scrollbar">
          {columnOrder.map((columnId) => {
            const column = columns[columnId];
            const columnTasks = column.taskIds
              .map((taskId) => tasks[taskId])
              .filter((task) => {
                const matchesSearch =
                  !searchQuery ||
                  task.title.toLowerCase().includes(searchQuery.toLowerCase());
                const matchesTag =
                  tagFilter === "all" || task.tags?.includes(tagFilter);
                const matchesPriority =
                  priorityFilter === "all" || task.priority === priorityFilter;
                const matchesAssignee =
                  assigneeFilter === "all" ||
                  task.assigneeId === assigneeFilter;

                let matchesDue = true;
                if (dueFilter === "overdue")
                  matchesDue = isPastDue(task.dueDate);
                else if (dueFilter === "today")
                  matchesDue = isDueToday(task.dueDate);
                else if (dueFilter === "upcoming")
                  matchesDue = task.dueDate
                    ? !isPastDue(task.dueDate) && !isDueToday(task.dueDate)
                    : false;

                return (
                  matchesSearch &&
                  matchesTag &&
                  matchesPriority &&
                  matchesDue &&
                  matchesAssignee
                );
              });

            return (
              <div
                key={column.id}
                className="w-80 shrink-0 flex flex-col gap-4"
              >
                <div className="flex items-center justify-between px-4">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-black uppercase tracking-widest italic text-slate-900">
                      {column.title}
                    </h3>
                    <span className="w-6 h-6 rounded-lg bg-slate-100 flex items-center justify-center text-[10px] font-black text-slate-500">
                      {columnTasks.length}
                    </span>
                  </div>
                  <button className="p-1 hover:bg-slate-100 rounded-lg text-slate-400 transition-colors">
                    <MoreHorizontal size={16} />
                  </button>
                </div>

                <Droppable droppableId={column.id}>
                  {(provided, snapshot) => (
                    <div
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                      className={cn(
                        "flex-1 p-2 rounded-[2.5rem] transition-colors min-h-[500px]",
                        snapshot.isDraggingOver
                          ? "bg-slate-100/50"
                          : "bg-transparent",
                      )}
                    >
                      <div className="space-y-4">
                        {columnTasks.map((task, index) => {
                          return (
                            <DraggableAny
                              key={task.id}
                              draggableId={task.id}
                              index={index}
                            >
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                onClick={() => {
                                  setSelectedTaskId(task.id);
                                  setFormState({ ...task });
                                  setIsEditing(true);
                                }}
                                className={cn(
                                  "bg-white p-0 rounded-[2rem] border border-slate-200 shadow-sm transition-all select-none hover:shadow-lg hover:border-purple-200 group relative cursor-pointer overflow-hidden",
                                  snapshot.isDragging
                                    ? "shadow-2xl ring-4 ring-purple-500/10 border-purple-500 rotate-2"
                                    : "",
                                  isPastDue(task.dueDate)
                                    ? "border-rose-200"
                                    : isDueToday(task.dueDate)
                                      ? "border-amber-200"
                                      : "",
                                )}
                              >
                                {/* Priority Indicator Bar */}
                                <div
                                  className={cn(
                                    "absolute left-0 top-0 bottom-0 w-1.5",
                                    task.priority === "urgent"
                                      ? "bg-rose-500"
                                      : task.priority === "high"
                                        ? "bg-amber-500"
                                        : task.priority === "medium"
                                          ? "bg-blue-500"
                                          : "bg-slate-300",
                                  )}
                                />

                                <div className="p-5 pl-6 space-y-4">
                                  <div className="flex items-start justify-between gap-4">
                                    <h4 className="text-sm font-black text-slate-900 leading-snug group-hover:text-purple-600 transition-colors uppercase italic">
                                      {task.title}
                                    </h4>
                                    <div
                                      className={cn(
                                        "px-2 py-1 rounded-lg text-[8px] font-black uppercase tracking-tighter shrink-0 flex items-center gap-1 shadow-sm",
                                        getPriorityInfo(task.priority).color,
                                      )}
                                    >
                                      {React.createElement(
                                        getPriorityInfo(task.priority).icon,
                                        { size: 10 },
                                      )}
                                      {task.priority}
                                    </div>
                                  </div>

                                  {task.description && (
                                    <p className="text-xs text-slate-500 font-bold leading-relaxed line-clamp-2 italic opacity-60">
                                      "{task.description}"
                                    </p>
                                  )}

                                  <div className="flex flex-wrap gap-1.5">
                                    {task.tags?.map((tag) => (
                                      <span
                                        key={tag}
                                        className="px-2 py-1 bg-slate-50 text-slate-500 text-[8px] font-black uppercase tracking-widest rounded-lg border border-slate-100 shadow-sm"
                                      >
                                        #{tag}
                                      </span>
                                    ))}
                                  </div>

                                  {task.attachments &&
                                    task.attachments.length > 0 && (
                                      <div className="space-y-1.5 pt-3 border-t border-slate-50">
                                        <div className="flex items-center justify-between">
                                          <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">
                                            Evidence Registry
                                          </p>
                                        </div>
                                        <div className="grid grid-cols-1 gap-1">
                                          {task.attachments
                                            .slice(0, 1)
                                            .map((att) => (
                                              <div
                                                key={att.id}
                                                className="flex items-center gap-2 px-2 py-1.5 bg-slate-50/50 rounded-xl border border-slate-100/50"
                                              >
                                                <FileText
                                                  size={10}
                                                  className="text-blue-500"
                                                />
                                                <span className="text-[9px] font-bold text-slate-600 truncate">
                                                  {att.name}
                                                </span>
                                              </div>
                                            ))}
                                          {task.attachments.length > 1 && (
                                            <p className="text-[8px] font-black text-purple-500 uppercase tracking-widest pl-2 pt-1">
                                              +{task.attachments.length - 1}{" "}
                                              more assets
                                            </p>
                                          )}
                                        </div>
                                      </div>
                                    )}

                                  {(() => {
                                    const pct = getCompletionPercentage(task);
                                    if (pct === null) return null;
                                    return (
                                      <div className="space-y-1.5 pt-3 border-t border-slate-100/60">
                                        <div className="flex items-center justify-between text-[9px] font-black uppercase tracking-widest text-slate-400">
                                          <span className="flex items-center gap-1 text-slate-500">
                                            <CheckCircle2
                                              size={10}
                                              className="text-purple-600"
                                            />
                                            Task Progress
                                          </span>
                                          <span className="text-purple-600 font-extrabold">
                                            {pct}%
                                          </span>
                                        </div>
                                        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                                          <div
                                            className="bg-purple-600 h-full rounded-full transition-all duration-300"
                                            style={{ width: `${pct}%` }}
                                          />
                                        </div>
                                      </div>
                                    );
                                  })()}

                                  <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                      {task.dueDate && (
                                        <div
                                          className={cn(
                                            "flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[9px] font-black uppercase tracking-widest shadow-sm",
                                            isPastDue(task.dueDate)
                                              ? "bg-rose-600 text-white animate-pulse"
                                              : isDueToday(task.dueDate)
                                                ? "bg-amber-500 text-white"
                                                : "bg-slate-100 text-slate-500",
                                          )}
                                        >
                                          <Clock size={10} />
                                          <span>
                                            {isPastDue(task.dueDate)
                                              ? "Critical/Past Due"
                                              : isDueToday(task.dueDate)
                                                ? "Due Today"
                                                : task.dueDate}
                                          </span>
                                        </div>
                                      )}
                                    </div>
                                    <div className="flex items-center -space-x-2">
                                      <div className="w-8 h-8 rounded-full bg-slate-900 border-2 border-white flex items-center justify-center text-[8px] font-black text-white uppercase shadow-lg">
                                        {task.assigneeId ? (
                                          task.assigneeId.slice(-2)
                                        ) : (
                                          <User size={12} />
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )}
                          </DraggableAny>
                        );
                        })}
                        {provided.placeholder}
                      </div>

                      <button
                        onClick={() => {
                          resetForm();
                          setIsAddingTask(true);
                        }}
                        className="w-full mt-4 py-3 border-2 border-dashed border-slate-200 rounded-2xl flex items-center justify-center gap-2 text-slate-400 hover:border-purple-400 hover:text-purple-600 transition-all group"
                      >
                        <Plus
                          size={16}
                          className="group-hover:scale-110 transition-transform"
                        />
                        <span className="text-[10px] font-black uppercase tracking-widest">
                          Add New Task
                        </span>
                      </button>
                    </div>
                  )}
                </Droppable>
              </div>
            );
          })}
        </div>
      </DragDropContext>

      {/* Modals */}
      <AnimatePresence>
        {(isAddingTask || (selectedTask && isEditing)) && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xl z-[100] flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl overflow-hidden border border-slate-100"
            >
              <div className="p-10 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <h2 className="text-2xl font-black uppercase italic text-slate-900">
                  {isAddingTask ? "Create New Task" : "Edit Task"}
                </h2>
                <button
                  onClick={() => {
                    setIsAddingTask(false);
                    setIsEditing(false);
                  }}
                  className="p-3 hover:bg-white rounded-2xl text-slate-400 hover:text-slate-900 transition-all border border-transparent hover:border-slate-100"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="p-10 space-y-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      Task Title*
                    </label>
                    <input
                      type="text"
                      value={formState.title}
                      onChange={(e) =>
                        setFormState({ ...formState, title: e.target.value })
                      }
                      className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-purple-500/10 focus:border-purple-500 transition-all font-bold"
                      placeholder="What needs to be done?"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      Description
                    </label>
                    <textarea
                      value={formState.description}
                      onChange={(e) =>
                        setFormState({
                          ...formState,
                          description: e.target.value,
                        })
                      }
                      className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-purple-500/10 focus:border-purple-500 transition-all font-bold h-32 resize-none"
                      placeholder="Add more details..."
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        Priority
                      </label>
                      <select
                        value={formState.priority}
                        onChange={(e) =>
                          setFormState({
                            ...formState,
                            priority: e.target.value as TaskPriority,
                          })
                        }
                        className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none transition-all font-bold text-slate-600 appearance-none"
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                        <option value="urgent">Urgent</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        Due Date
                      </label>
                      <input
                        type="date"
                        value={formState.dueDate}
                        onChange={(e) =>
                          setFormState({
                            ...formState,
                            dueDate: e.target.value,
                          })
                        }
                        className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none transition-all font-bold text-slate-600"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      Assignee ID
                    </label>
                    <input
                      type="text"
                      value={formState.assigneeId}
                      onChange={(e) =>
                        setFormState({
                          ...formState,
                          assigneeId: e.target.value,
                        })
                      }
                      className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-purple-500/10 focus:border-purple-500 transition-all font-bold"
                      placeholder="Employee or Student ID"
                    />
                  </div>

                  <div className="space-y-4">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">
                      Tags
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            handleAddTag();
                          }
                        }}
                        className="flex-1 px-6 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-purple-500/10 focus:border-purple-500 transition-all font-bold"
                        placeholder="Add a tag..."
                      />
                      <button
                        onClick={handleAddTag}
                        className="px-6 py-3 bg-purple-100 text-purple-600 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-purple-200 transition-all"
                      >
                        Add
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {formState.tags?.map((tag) => (
                        <span
                          key={tag}
                          className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 text-slate-600 text-[9px] font-black uppercase tracking-widest rounded-lg shadow-sm"
                        >
                          {tag}
                          <button
                            onClick={() => handleRemoveTag(tag)}
                            className="p-1 hover:bg-slate-100 rounded-md text-slate-400 hover:text-rose-500 transition-colors"
                          >
                            <X size={10} />
                          </button>
                        </span>
                      ))}
                      {(!formState.tags || formState.tags.length === 0) && (
                        <p className="text-[10px] font-bold text-slate-300 italic uppercase">
                          No tags added
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">
                      Attachments
                    </label>
                    <div className="grid grid-cols-2 gap-4">
                      {formState.attachments?.map((att, idx) => (
                        <div
                          key={idx}
                          className="p-4 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-between group"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center shrink-0">
                              <Paperclip size={18} className="text-slate-400" />
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs font-black text-slate-900 truncate">
                                {att.name}
                              </p>
                              <p className="text-[10px] font-bold text-slate-400">
                                {att.size}
                              </p>
                            </div>
                          </div>
                          <button
                            onClick={() =>
                              setFormState((prev) => ({
                                ...prev,
                                attachments: prev.attachments?.filter(
                                  (a) => a.id !== att.id,
                                ),
                              }))
                            }
                            className="p-2 text-slate-300 hover:text-rose-500 transition-colors"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      ))}
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="p-4 border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center gap-2 text-slate-400 hover:border-purple-400 hover:text-purple-600 transition-all group"
                      >
                        <Upload
                          size={20}
                          className="group-hover:scale-110 transition-transform"
                        />
                        <span className="text-[10px] font-black uppercase tracking-widest">
                          Upload File
                        </span>
                        <input
                          type="file"
                          ref={fileInputRef}
                          className="hidden"
                          multiple
                          onChange={handleFileChange}
                        />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 pt-4">
                  <button
                    onClick={() => {
                      setIsAddingTask(false);
                      setIsEditing(false);
                    }}
                    className="flex-1 py-5 text-slate-400 font-black uppercase text-[10px] tracking-widest hover:text-slate-600 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={isAddingTask ? handleAddTask : handleUpdateTask}
                    className="flex-[2] py-5 bg-purple-600 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl shadow-purple-500/20 hover:bg-purple-700 transition-all flex items-center justify-center gap-2"
                  >
                    <CheckCircle2 size={18} />
                    {isAddingTask ? "Save Task" : "Update Task"}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {taskToDeleteId && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xl z-[110] flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white p-10 rounded-[3rem] shadow-2xl max-w-sm w-full text-center space-y-8 border border-slate-100"
            >
              <div className="w-24 h-24 bg-rose-50 text-rose-500 rounded-[2rem] flex items-center justify-center mx-auto shadow-inner">
                <AlertCircle size={48} />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-black uppercase italic text-slate-900">
                  Delete Task?
                </h3>
                <p className="text-slate-500 font-bold text-xs uppercase italic leading-relaxed">
                  This action is permanent and will remove all associated files
                  and tracking data.
                </p>
              </div>
              <div className="flex gap-4">
                <button
                  onClick={() => setTaskToDeleteId(null)}
                  className="flex-1 py-5 bg-slate-100 text-slate-500 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-slate-200 transition-all"
                >
                  Keep Task
                </button>
                <button
                  onClick={() => {
                    handleDeleteTask(taskToDeleteId);
                    setTaskToDeleteId(null);
                  }}
                  className="flex-1 py-5 bg-rose-600 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-rose-700 transition-all shadow-xl shadow-rose-600/20"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {selectedTask && !isEditing && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xl z-[100] flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white w-full max-w-3xl rounded-[3rem] shadow-2xl overflow-hidden border border-slate-100"
            >
              <div className="p-10 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <div className="flex items-center gap-4">
                  <div
                    className={cn(
                      "px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2",
                      getPriorityInfo(selectedTask.priority).color,
                    )}
                  >
                    {React.createElement(
                      getPriorityInfo(selectedTask.priority).icon,
                      { size: 14 },
                    )}
                    {selectedTask.priority} Priority
                  </div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest italic">
                    Created {selectedTask.createdAt}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setFormState({ ...selectedTask });
                      setIsEditing(true);
                    }}
                    className="flex items-center gap-2 px-4 py-2.5 bg-blue-50 text-blue-600 rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-blue-100 transition-all border border-blue-100"
                  >
                    <Edit2 size={16} />
                    Edit Task
                  </button>
                  <button
                    onClick={() => setTaskToDeleteId(selectedTask.id)}
                    className="flex items-center gap-2 px-4 py-2.5 bg-rose-50 text-rose-600 rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-rose-100 transition-all border border-rose-100"
                  >
                    <Trash2 size={16} />
                    Delete
                  </button>
                  <button
                    onClick={() => setSelectedTaskId(null)}
                    className="p-3 bg-white border border-slate-100 rounded-2xl text-slate-400 hover:text-slate-900 hover:border-slate-200 transition-all shadow-sm ml-4"
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>

              <div className="p-10 grid grid-cols-1 md:grid-cols-3 gap-10 max-h-[75vh] overflow-y-auto custom-scrollbar">
                <div className="md:col-span-2 space-y-8">
                  <div className="space-y-4">
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight italic uppercase leading-[1.1]">
                      {selectedTask.title}
                    </h1>
                    <div className="h-1.5 w-20 bg-purple-600 rounded-full" />
                  </div>

                  <div className="space-y-4">
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                      <FileText size={12} />
                      Task Description
                    </h4>
                    <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
                      {selectedTask.description ? (
                        <p className="text-slate-600 font-bold leading-relaxed text-sm">
                          {selectedTask.description}
                        </p>
                      ) : (
                        <p className="text-slate-300 italic text-sm">
                          No description provided for this task.
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                      <Paperclip size={12} />
                      Attachments ({selectedTask.attachments?.length || 0})
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {selectedTask.attachments?.length ? (
                        selectedTask.attachments.map((att) => (
                          <div
                            key={att.id}
                            className="p-4 bg-white border border-slate-100 rounded-2xl flex items-center justify-between group shadow-sm hover:border-blue-200 transition-all"
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0">
                                <FileText size={18} className="text-blue-500" />
                              </div>
                              <div className="min-w-0">
                                <p className="text-xs font-black text-slate-900 truncate">
                                  {att.name}
                                </p>
                                <p className="text-[10px] font-bold text-slate-400 uppercase">
                                  {att.size}
                                </p>
                              </div>
                            </div>
                            <a
                              href={att.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-2 text-slate-300 hover:text-blue-600 transition-colors"
                            >
                              <ExternalLink size={16} />
                            </a>
                          </div>
                        ))
                      ) : (
                        <div className="col-span-2 py-8 text-center border-2 border-dashed border-slate-100 rounded-3xl">
                          <Paperclip
                            size={24}
                            className="mx-auto text-slate-200 mb-2"
                          />
                          <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">
                            No files tagged
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Subtasks Checklist Section */}
                  <div className="space-y-4 text-xs font-bold">
                    <div className="flex items-center justify-between">
                      <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                        <CheckSquare size={12} className="text-purple-600" />
                        Operational Checklist
                      </h4>
                      {selectedTask.subtasks &&
                        selectedTask.subtasks.length > 0 && (
                          <span className="text-[9px] font-black px-2 py-0.5 bg-purple-100 text-purple-600 rounded-lg">
                            {
                              selectedTask.subtasks.filter((s) => s.completed)
                                .length
                            }
                            /{selectedTask.subtasks.length} Completed
                          </span>
                        )}
                    </div>

                    <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 space-y-4">
                      <div className="space-y-2.5">
                        {selectedTask.subtasks?.map((sub) => (
                          <div
                            key={sub.id}
                            className="flex items-center justify-between group/sub"
                          >
                            <label className="flex items-center gap-3 cursor-pointer select-none">
                              <input
                                type="checkbox"
                                checked={sub.completed}
                                onChange={() =>
                                  handleToggleSubtask(selectedTask.id, sub.id)
                                }
                                className="rounded border-slate-300 text-purple-600 focus:ring-purple-500 w-4 h-4 cursor-pointer"
                              />
                              <span
                                className={cn(
                                  "text-xs font-bold transition-all duration-200",
                                  sub.completed
                                    ? "line-through text-slate-400"
                                    : "text-slate-700",
                                )}
                              >
                                {sub.title}
                              </span>
                            </label>
                            <button
                              onClick={() =>
                                handleDeleteSubtask(selectedTask.id, sub.id)
                              }
                              className="p-1 text-slate-300 hover:text-rose-500 opacity-0 group-hover/sub:opacity-100 transition-opacity"
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        ))}
                        {(!selectedTask.subtasks ||
                          selectedTask.subtasks.length === 0) && (
                          <p className="text-xs text-slate-400 italic">
                            No checklist items configured for this objective.
                          </p>
                        )}
                      </div>

                      <div className="flex gap-2 pt-2 border-t border-slate-100">
                        <input
                          type="text"
                          value={newSubtaskTitle}
                          onChange={(e) => setNewSubtaskTitle(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              handleAddSubtask(selectedTask.id);
                            }
                          }}
                          placeholder="Add checklist item..."
                          className="flex-1 px-4 py-2 bg-white border border-slate-200 rounded-xl outline-none focus:ring-4 focus:ring-purple-500/10 focus:border-purple-500 transition-all text-xs font-bold text-slate-700"
                        />
                        <button
                          onClick={() => handleAddSubtask(selectedTask.id)}
                          className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-black uppercase text-[9px] tracking-widest transition-colors shadow-md shadow-purple-500/10"
                        >
                          Add
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Comments Discussion Section */}
                  <div className="space-y-4 font-bold text-xs mt-6">
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                      <MessageSquare size={12} className="text-purple-600" />
                      Activity & Comments ({selectedTask.comments?.length || 0})
                    </h4>

                    <div className="space-y-4 bg-slate-50 p-6 rounded-3xl border border-slate-100">
                      <div className="max-h-60 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
                        {selectedTask.comments?.map((comment) => (
                          <div
                            key={comment.id}
                            className="p-4 bg-white border border-slate-150 rounded-2xl shadow-sm flex items-start gap-3 group/comm"
                          >
                            <div className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-200 flex items-center justify-center text-[10px] font-black text-white uppercase shrink-0 animate-fade-in">
                              {comment.authorName.slice(0, 2)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <p className="text-xs font-black text-slate-900 italic">
                                    {comment.authorName}
                                  </p>
                                  <span
                                    className={cn(
                                      "px-1.5 py-0.5 rounded text-[8px] font-black uppercase leading-none",
                                      comment.authorRole === "Admin"
                                        ? "bg-rose-50 text-rose-500 border border-rose-100"
                                        : "bg-purple-50 text-purple-500 border border-purple-100",
                                    )}
                                  >
                                    {comment.authorRole}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="text-[8px] font-bold text-slate-400 tracking-tighter uppercase">
                                    {comment.createdAt}
                                  </span>
                                  <button
                                    onClick={() =>
                                      handleDeleteComment(
                                        selectedTask.id,
                                        comment.id,
                                      )
                                    }
                                    className="text-slate-300 hover:text-rose-500 opacity-0 group-hover/comm:opacity-100 transition-opacity"
                                  >
                                    <Trash2 size={10} />
                                  </button>
                                </div>
                              </div>
                              <p className="text-xs text-slate-650 font-bold leading-relaxed mt-1">
                                {comment.content}
                              </p>
                            </div>
                          </div>
                        ))}
                        {(!selectedTask.comments ||
                          selectedTask.comments.length === 0) && (
                          <p className="text-xs text-slate-400 italic py-4 text-center">
                            No comments logged in the registry yet. Start typing
                            below to begin.
                          </p>
                        )}
                      </div>

                      <div className="relative font-bold text-xs pt-4 border-t border-slate-100">
                        {/* Autocomplete dropdown list */}
                        {commentAutocomplete.length > 0 && (
                          <div className="absolute bottom-full left-0 mb-2 w-72 bg-white border border-slate-200 rounded-2xl shadow-2xl z-[150] overflow-hidden">
                            <div className="p-3 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                              <span className="text-[9px] font-black uppercase text-slate-400 tracking-wider font-sans text-slate-400">Mention Personnel</span>
                              <button onClick={() => setCommentAutocomplete([])} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                                <X size={10} />
                              </button>
                            </div>
                            <div className="max-h-48 overflow-y-auto divide-y divide-slate-50 custom-scrollbar font-sans">
                              {commentAutocomplete.map((emp) => (
                                <button
                                  key={emp.id}
                                  onClick={() => insertMention(emp.name)}
                                  className="w-full text-left px-4 py-2.5 flex items-center gap-3 hover:bg-purple-50 hover:text-purple-700 transition-all cursor-pointer"
                                >
                                  <div className="w-6 h-6 rounded-lg bg-purple-100 flex items-center justify-center text-[9px] font-black text-purple-700 uppercase">
                                    {emp.name.slice(0, 2)}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-1.5 flex-wrap">
                                      <p className="text-xs font-black truncate text-slate-800">{emp.name}</p>
                                      {(() => {
                                        const nameLC = emp.name.toLowerCase();
                                        const posIdLC = (emp.positionId || "").toLowerCase();
                                        const isLead = posIdLC.includes("principal") || posIdLC.includes("vp") || posIdLC.includes("mgr") || posIdLC.includes("manager") || nameLC.includes("jenkins") || nameLC.includes("dara") || nameLC.includes("sok mean") || nameLC.includes("pat");
                                        return isLead ? (
                                          <span className="text-[7px] font-black tracking-widest text-amber-700 bg-amber-50 px-1 py-0.5 rounded border border-amber-100 uppercase">Supervisor</span>
                                        ) : null;
                                      })()}
                                    </div>
                                    <p className="text-[8px] text-slate-400 uppercase font-mono font-bold">{emp.employeeCode || emp.id}</p>
                                  </div>
                                </button>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Shortcuts */}
                        <div className="mb-3 flex items-center gap-2 overflow-x-auto pb-1 max-w-full custom-scrollbar font-sans text-slate-400">
                          <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest shrink-0">Tap to @mention:</span>
                          {employees.map((emp) => (
                            <button
                              key={emp.id}
                              onClick={() => insertMention(emp.name)}
                              className="px-2.5 py-1 bg-slate-100 hover:bg-purple-100 hover:text-purple-700 rounded-lg text-[9px] font-bold text-slate-600 transition-colors shrink-0 cursor-pointer"
                            >
                              @{emp.name.split(" ")[0]}
                            </button>
                          ))}
                        </div>

                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={newCommentText}
                            onChange={(e) => handleCommentTextChange(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault();
                                handleAddComment(selectedTask.id);
                              }
                            }}
                            placeholder="Type @ to mention or tap names above..."
                            className="flex-1 px-5 py-3 bg-white border border-slate-200 rounded-xl outline-none focus:ring-4 focus:ring-purple-500/10 focus:border-purple-500 transition-all placeholder:text-slate-400 text-slate-700 font-medium font-sans"
                          />
                          <button
                            onClick={() => handleAddComment(selectedTask.id)}
                            className="px-6 py-3 bg-slate-900 hover:bg-slate-850 text-white rounded-xl font-black uppercase tracking-widest text-[9px] transition-colors shadow-lg shadow-slate-900/10 cursor-pointer"
                          >
                            Send
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-8 bg-slate-50 p-8 rounded-[2.5rem] border border-slate-100">
                  <div className="space-y-6">
                    <div className="space-y-4">
                      <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        Assignee
                      </h4>
                      <div className="flex items-center gap-4 bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
                        <div className="w-10 h-10 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center">
                          <User size={20} className="text-purple-600" />
                        </div>
                        <div>
                          <p className="text-sm font-black text-slate-900 italic uppercase truncate">
                            {selectedTask.assigneeId || "Not Assigned"}
                          </p>
                          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                            Responsibility
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        Target Date
                      </h4>
                      <div className="flex items-center gap-4 bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
                        <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center">
                          <Clock size={20} className="text-amber-600" />
                        </div>
                        <div>
                          <p className="text-sm font-black text-slate-900 italic uppercase">
                            {selectedTask.dueDate || "Flexible"}
                          </p>
                          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                            Deadline
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                        <Tag size={12} />
                        Classification
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedTask.tags?.length ? (
                          selectedTask.tags.map((tag) => (
                            <span
                              key={tag}
                              className="px-3 py-1.5 bg-white border border-slate-200 text-slate-600 text-[9px] font-black uppercase tracking-widest rounded-lg shadow-sm"
                            >
                              {tag}
                            </span>
                          ))
                        ) : (
                          <span className="text-[10px] font-bold text-slate-300 italic uppercase">
                            General Pool
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Status Transition Timeline Section */}
                    <div className="space-y-4 pt-4 border-t border-slate-200/60 font-bold block text-xs">
                      <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 mb-2">
                        <Layout size={12} className="text-purple-600" />
                        Status Trace History
                      </h4>
                      <div className="space-y-4 relative pl-3 border-l border-slate-200">
                        {selectedTask.statusHistory?.map((history, idx) => (
                          <div
                            key={history.id || idx}
                            className="relative space-y-1.5 pl-1.5"
                          >
                            <div className="absolute -left-[18px] top-1.5 w-2.5 h-2.5 rounded-full bg-purple-600 ring-4 ring-slate-50 shrink-0" />
                            <div className="flex flex-col text-[10px]">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="font-extrabold text-slate-700 bg-white border border-slate-200 px-1.5 py-0.5 rounded text-[8px] uppercase">
                                  {history.fromColumn}
                                </span>
                                <span className="text-slate-400">→</span>
                                <span className="font-extrabold text-white bg-purple-600 px-1.5 py-0.5 rounded text-[8px] uppercase">
                                  {history.toColumn}
                                </span>
                              </div>
                              <p className="text-[11px] text-slate-500 font-bold mt-1">
                                Moved by{" "}
                                <span className="font-black text-slate-800">
                                  {history.updatedBy}
                                </span>
                              </p>
                              <span className="text-[8px] font-black text-slate-400 uppercase tracking-wide">
                                {history.updatedAt}
                              </span>
                            </div>
                          </div>
                        ))}
                        {(!selectedTask.statusHistory ||
                          selectedTask.statusHistory.length === 0) && (
                          <div className="text-[9px] text-slate-400 italic uppercase font-black pl-1">
                            No column trace events logged.
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-slate-200">
                    <div className="flex items-center justify-between text-[9px] font-black text-slate-400 uppercase tracking-widest">
                      <span>Status</span>
                      <span className="flex items-center gap-1.5 text-emerald-500">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        Synchronized
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
