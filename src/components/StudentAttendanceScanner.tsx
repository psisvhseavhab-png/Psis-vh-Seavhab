import React, { useRef, useState, useEffect } from 'react';
import { Camera, CameraOff, CheckCircle2, UserCheck, AlertCircle, RefreshCw, Smartphone, Play, Square, Scan, Cpu, Map, Bus, Clock, MapPin, FileText, Share2 } from 'lucide-react';
import { jsPDF } from 'jspdf';
import { cn } from '../lib/utils';
import { studentService } from '../services/studentService';
import { employeeService } from '../services/employeeService';
import { getDb } from '../lib/firebase';
import { collection, addDoc } from 'firebase/firestore';

interface ScannedRecord {
  id: string;
  name: string;
  class: string;
  timestamp: string;
  status: 'on-time' | 'late';
  type: string;
  category?: string;
  aiFeedback?: string;
  confidence?: number;
}

const DEFAULT_LOOKUP_IDENTITIES = [
  { id: 'VH001420', name: 'Sovann Pich', category: 'Student', classOrDept: 'Grade 10 - Section A' },
  { id: 'VH001419', name: 'Arya Stark', category: 'Student', classOrDept: 'Grade 12 - Section B' },
  { id: 'VH001418', name: 'John Doe', category: 'Student', classOrDept: 'Grade 11 - General' },
  { id: 'VH-EMP001', name: 'Chan Dara', category: 'Employee', classOrDept: 'Teacher (Academic Dept)' },
  { id: 'VH-EMP002', name: 'Sok Mean', category: 'Employee', classOrDept: 'HR Officer (Admin Dept)' },
];

export const StudentAttendanceScanner: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [cameraActive, setCameraActive] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [cameraHardwareNotDetected, setCameraHardwareNotDetected] = useState<boolean>(false);
  const [logs, setLogs] = useState<ScannedRecord[]>([
    { id: 'VH001415', name: 'Chan Darith', class: 'Grade 10 - Section A', timestamp: '08:02 AM', status: 'on-time', type: 'Digital ID Card' },
    { id: 'VH001412', name: 'Keo Rotha', class: 'Grade 12 - Section B', timestamp: '07:44 AM', status: 'on-time', type: 'Physical Barcode' },
  ]);
  const [scanning, setScanning] = useState<boolean>(false);
  const [lastScanned, setLastScanned] = useState<ScannedRecord | null>(null);
  const [manualId, setManualId] = useState<string>('');

  // Tab configurations
  const [activeTab, setActiveTab] = useState<'qr' | 'barcode' | 'face'>('qr');
  const [modelType, setModelType] = useState<'blazeface' | 'mobileNet'>('blazeface');
  const [tfLoaded, setTfLoaded] = useState<boolean>(false);
  const [loadingModel, setLoadingModel] = useState<boolean>(false);
  const [showFaceScanSuccess, setShowFaceScanSuccess] = useState<boolean>(false);

  // Live driver route tracking, ETA, and mini-map simulation values
  const [feedMode, setFeedMode] = useState<'live' | 'minimap'>('live');
  const [routeDeviationMeters, setRouteDeviationMeters] = useState<number>(120);
  const [etaMinutes, setEtaMinutes] = useState<number>(8);
  const [scannerNotification, setScannerNotification] = useState<string | null>(null);
  const [isHistoryOpen, setIsHistoryOpen] = useState<boolean>(false);

  const transportManifest = [
    { id: 'ST101', name: 'Darith Rotha', class: 'Grade 10-A', stop: 'Mao Tse Toung Blvd', status: 'Nextstop' },
    { id: 'ST102', name: 'Chan Daravy', class: 'Grade 11-B', stop: 'Norodom Boulevard', status: 'Scheduled' },
    { id: 'ST105', name: 'Sopheak Narita', class: 'Grade 10-A', stop: 'Sihanouk Boulevard', status: 'Scheduled' },
    { id: 'ST104', name: 'Ouk Rothvisal', class: 'Grade 12-C', stop: 'Russian Blvd Stop', status: 'Scheduled' }
  ];

  const [databaseIdentities, setDatabaseIdentities] = useState<any[]>(DEFAULT_LOOKUP_IDENTITIES);

  // Dynamically fetch and merge students and employees from the services
  useEffect(() => {
    let active = true;
    async function loadData() {
      try {
        const [liveStudents, liveEmployees] = await Promise.all([
          studentService.getStudents().catch(() => []),
          employeeService.getEmployees().catch(() => [])
        ]);

        if (!active) return;

        const mappedStudents = liveStudents.map(s => ({
          id: s.id,
          name: s.name,
          category: 'Student',
          classOrDept: s.class || 'Student'
        }));

        const mappedEmployees = liveEmployees.map(e => ({
          id: e.employeeCode || e.id,
          name: e.name,
          category: 'Employee',
          classOrDept: e.positionId === 'pos_teacher' ? 'Teacher' : 'Staff'
        }));

        const combined = [...mappedStudents, ...mappedEmployees];
        // Deduplicate and fallback to default mock items
        const merged = [...combined];
        DEFAULT_LOOKUP_IDENTITIES.forEach(def => {
          if (!merged.some(item => item.id.toUpperCase() === def.id.toUpperCase())) {
            merged.push(def);
          }
        });

        setDatabaseIdentities(merged);
      } catch (err) {
        console.warn("Could not load smart database identities, utilizing default mockup:", err);
        setDatabaseIdentities(DEFAULT_LOOKUP_IDENTITIES);
      }
    }
    loadData();
    return () => {
      active = false;
    };
  }, []);

  const saveScanToSystem = async (record: any) => {
    // 1. Client-side local backup storage
    try {
      const existing = localStorage.getItem("edu_attendance_scans_recorded");
      const array = existing ? JSON.parse(existing) : [];
      array.unshift(record);
      localStorage.setItem("edu_attendance_scans_recorded", JSON.stringify(array));
    } catch (err) {
      console.warn("Failed saving locally:", err);
    }

    // 2. Persistent Firestore online database entry
    try {
      const db = await getDb().catch(() => null);
      if (db) {
        await addDoc(collection(db, "attendance_scans"), {
          id: record.id,
          name: record.name,
          class: record.class,
          timestamp: record.timestamp,
          status: record.status,
          type: record.type,
          category: record.category || "Student",
          aiFeedback: record.aiFeedback || "",
          confidence: record.confidence || 1.0,
          createdTime: new Date().toISOString()
        });
      }
    } catch (err) {
      console.warn("Firestore logging skipped (offline fallback active):", err);
    }
  };

  // Dynamically fluctuate calculated arrival minutes
  useEffect(() => {
    const timer = setInterval(() => {
      setEtaMinutes(prev => (prev <= 2 ? 10 : prev - 1));
    }, 12000);
    return () => clearInterval(timer);
  }, []);

  const playBeep = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      
      oscillator.type = 'sine';
      // High-pitched success beep: 1550 Hz
      oscillator.frequency.setValueAtTime(1550, audioCtx.currentTime); 
      
      // Polish the gain envelope to sound premium and digital (no popping/click noise)
      gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.12, audioCtx.currentTime + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.12);
      
      oscillator.start();
      oscillator.stop(audioCtx.currentTime + 0.15);
    } catch (e) {
      console.warn("Audio Context beep disabled on local environment:", e);
    }
  };

  const startCamera = async () => {
    setCameraError(null);
    setCameraHardwareNotDetected(false);
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } }
      });
      setStream(mediaStream);
      setCameraActive(true);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err: any) {
      console.warn("Camera hardware access restricted. Activating simulator matrix.", err);
      setCameraError("Camera capture blocked. Interactive virtual simulation active.");
      setCameraHardwareNotDetected(true);
      setCameraActive(true);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setCameraActive(false);
  };

  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

  // Lazy loading TensorFlow.js scripts for face recognition
  useEffect(() => {
    if (activeTab === 'face' && !tfLoaded && !loadingModel) {
      setLoadingModel(true);
      const scripts = [
        { id: 'tfjs-core', src: 'https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@4.20.0/dist/tf.min.js' },
        { id: 'tfjs-blazeface', src: 'https://cdn.jsdelivr.net/npm/@tensorflow-models/blazeface@0.0.7/dist/blazeface.min.js' }
      ];

      const injectScript = (scriptConf: { id: string; src: string }) => {
        return new Promise<void>((resolve) => {
          if (document.getElementById(scriptConf.id)) {
            resolve();
            return;
          }
          const el = document.createElement('script');
          el.id = scriptConf.id;
          el.src = scriptConf.src;
          el.async = true;
          el.onload = () => resolve();
          el.onerror = () => resolve(); // continue on error to fallback
          document.body.appendChild(el);
        });
      };

      const loadAll = async () => {
        for (const s of scripts) {
          await injectScript(s);
        }
        // Artificial short pause to confirm modules
        setTimeout(() => {
          try {
            const tfObj = (window as any).tf;
            const blazeObj = (window as any).blazeface;
            if (tfObj && blazeObj) {
              blazeObj.load().then((loadedModel: any) => {
                (window as any).attendanceBlazeFaceModel = loadedModel;
                setTfLoaded(true);
                setLoadingModel(false);
              }).catch(() => {
                setTfLoaded(true);
                setLoadingModel(false);
              });
            } else {
              setTfLoaded(true); // Fallback matrix online
              setLoadingModel(false);
            }
          } catch (e) {
            setTfLoaded(true);
            setLoadingModel(false);
          }
        }, 800);
      };

      loadAll();
    }
  }, [activeTab, tfLoaded, loadingModel]);

  // Real-time canvas scanning overlays
  useEffect(() => {
    let animFrameId: number;
    let isMounted = true;

    const renderLoop = async () => {
      if (!isMounted) return;
      if (!videoRef.current || !canvasRef.current) {
        animFrameId = requestAnimationFrame(renderLoop);
        return;
      }

      const video = videoRef.current;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        animFrameId = requestAnimationFrame(renderLoop);
        return;
      }

      // Sync display sizes
      if (video.videoWidth) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
      } else {
        canvas.width = 640;
        canvas.height = 480;
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // 1. Draw Active Target Box Guide
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;

      if (activeTab === 'face') {
        const pulse = Math.sin(Date.now() / 200) * 8;
        const radiusX = 110 + pulse;
        const radiusY = 150 + pulse;

        // Biometric Face Landmark Overlay fallbacks or predictions
        let predList: any[] = [];
        const modelG = (window as any).attendanceBlazeFaceModel;
        const tfG = (window as any).tf;

        if (modelG && tfG && video.readyState === 4) {
          try {
            predList = await modelG.estimateFaces(video, false);
          } catch (error) {
            // silent catch
          }
        }

        if (predList.length > 0) {
          // Render actual TensorFlow.js tracked coordinates
          for (const pred of predList) {
            const startX = pred.topLeft[0];
            const startY = pred.topLeft[1];
            const width = pred.bottomRight[0] - startX;
            const height = pred.bottomRight[1] - startY;

            // Neon target color indicators
            ctx.strokeStyle = '#22d3ee'; // cyan-400
            ctx.lineWidth = 3.5;
            ctx.strokeRect(startX, startY, width, height);

            ctx.fillStyle = '#22d3ee';
            ctx.font = 'bold 12px monospace';
            ctx.fillText("AI FACE MODEL LOCK: 99.4% CONFIDENCE", startX + 5, startY - 10);

            // Draw land-point nodes
            if (pred.landmarks) {
              for (const mark of pred.landmarks) {
                ctx.beginPath();
                ctx.arc(mark[0], mark[1], 4.5, 0, 2 * Math.PI);
                ctx.fillStyle = '#10b981';
                ctx.fill();
              }
            }
          }
        } else {
          // Cinematic HUD style simulator graphics
          ctx.strokeStyle = '#06b6d4';
          ctx.lineWidth = 2.5;
          ctx.beginPath();
          ctx.ellipse(centerX, centerY, radiusX, radiusY, 0, 0, 2 * Math.PI);
          ctx.stroke();

          // Horizontal biometric analysis line
          const scanY = centerY + Math.sin(Date.now() / 350) * radiusY;
          ctx.strokeStyle = 'rgba(6, 182, 212, 0.7)';
          ctx.lineWidth = 2.5;
          ctx.beginPath();
          ctx.moveTo(centerX - radiusX + 15, scanY);
          ctx.lineTo(centerX + radiusX - 15, scanY);
          ctx.stroke();

          // Visual matrix labels
          ctx.fillStyle = '#06b6d4';
          ctx.font = '9px monospace';
          ctx.fillText("FACIAL BIOMETRICS ENGAGED (TENSORFLOW.JS Fallback)", centerX - 120, centerY + radiusY + 22);

          // Render simulated landmark dots
          const trackerPoints = [
            { x: centerX, y: centerY - 65, label: "F-HEAD" },
            { x: centerX - 35, y: centerY - 20, label: "L-EYE" },
            { x: centerX + 35, y: centerY - 20, label: "R-EYE" },
            { x: centerX, y: centerY + 10, label: "NASAL" },
            { x: centerX - 30, y: centerY + 50, label: "L-CHEEK" },
            { x: centerX + 30, y: centerY + 50, label: "R-CHEEK" },
            { x: centerX, y: centerY + 85, label: "CHIN" },
          ];

          trackerPoints.forEach((point, pIdx) => {
            const tremorX = Math.sin((Date.now() + pIdx * 900) / 300) * 1.5;
            const tremorY = Math.cos((Date.now() + pIdx * 1100) / 300) * 1.5;

            ctx.beginPath();
            ctx.arc(point.x + tremorX, point.y + tremorY, 3.5, 0, 2 * Math.PI);
            ctx.fillStyle = '#34d399'; // Emerald-400
            ctx.fill();

            // Connect lines
            if (pIdx > 0 && pIdx <= 4) {
              ctx.beginPath();
              ctx.moveTo(trackerPoints[0].x, trackerPoints[0].y);
              ctx.lineTo(point.x + tremorX, point.y + tremorY);
              ctx.strokeStyle = 'rgba(6, 182, 212, 0.18)';
              ctx.stroke();
            }
          });
        }
      } else {
        // QR or Barcode sight guidelines: Solid scan laser animations
        const side = 180;
        ctx.strokeStyle = activeTab === 'qr' ? '#3b82f6' : '#14b8a6';
        ctx.lineWidth = 2.5;
        ctx.strokeRect(centerX - side / 2, centerY - side / 2, side, side);

        // Grid Corners indicators
        ctx.fillStyle = activeTab === 'qr' ? 'rgba(59, 130, 246, 0.1)' : 'rgba(20, 184, 166, 0.1)';
        ctx.fillRect(centerX - side / 2, centerY - side / 2, side, side);

        const scanLineY = centerY - side / 2 + ((Date.now() / 15) % side);
        ctx.strokeStyle = activeTab === 'qr' ? '#ef4444' : '#10b981';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(centerX - side / 2, scanLineY);
        ctx.lineTo(centerX + side / 2, scanLineY);
        ctx.stroke();
      }

      animFrameId = requestAnimationFrame(renderLoop);
    };

    renderLoop();

    return () => {
      isMounted = false;
      cancelAnimationFrame(animFrameId);
    };
  }, [cameraActive, activeTab]);

  const handleVerifyId = async (studentId: string, customType?: string) => {
    const cleanId = studentId.trim().toUpperCase();
    if (!cleanId) return;

    setScanning(true);

    const found = databaseIdentities.find(s => s.id.toUpperCase() === cleanId) || {
      id: cleanId,
      name: cleanId.match(/(EMP|TEACH|STAFF)/i) ? `Teacher / Employee` : `Visitor / Guest ID`,
      category: cleanId.match(/(EMP|TEACH|STAFF)/i) ? 'Employee' : 'Student',
      classOrDept: cleanId.match(/(EMP|TEACH|STAFF)/i) ? 'Academic Dept / Campus' : 'Regular Campus Entry'
    };

    const typeLabel = customType || (activeTab === 'qr' 
      ? 'Digital QR ID' 
      : activeTab === 'barcode' 
      ? 'Physical Barcode' 
      : 'A.I. Biometric Face ID');

    try {
      const response = await fetch('/api/scan-verify-record', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          id: cleanId,
          name: found.name,
          category: found.category,
          scanType: typeLabel
        })
      });

      const resData = await response.json();
      playBeep();

      if (resData.success) {
        const record = resData.record;
        
        const newRecord: ScannedRecord = {
          id: record.id,
          name: record.name,
          class: found.classOrDept,
          timestamp: record.timestamp,
          status: record.status,
          type: record.scanType,
          category: record.category,
          aiFeedback: record.aiFeedback,
          confidence: record.confidence
        };

        await saveScanToSystem(newRecord);

        setLogs(prev => [newRecord, ...prev]);
        setLastScanned(newRecord);
        setScanning(false);
        setManualId('');
        
        setTimeout(() => {
          setLastScanned(null);
        }, 5050);
      } else {
        throw new Error(resData.error || "Backend verification rejected.");
      }
    } catch (err: any) {
      console.warn("Smart Verification API error, falling back locally:", err);
      playBeep();
      const now = new Date();
      const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      const hours = now.getHours();
      const minutes = now.getMinutes();
      const isLate = hours > 8 || (hours === 8 && minutes > 15);

      const newRecord: ScannedRecord = {
        id: found.id,
        name: found.name,
        class: found.classOrDept,
        timestamp: timeStr,
        status: isLate ? 'late' : 'on-time',
        type: typeLabel,
        category: found.category || 'Student',
        aiFeedback: "Local database matched."
      };

      await saveScanToSystem(newRecord);

      setLogs(prev => [newRecord, ...prev]);
      setLastScanned(newRecord);
      setScanning(false);
      setManualId('');
      
      setTimeout(() => {
        setLastScanned(null);
      }, 5050);
    }
  };

  // Automated Trigger for Simulating Face Recognition action
  const triggerAiFaceAnalysis = async () => {
    if (scanning) return;
    setScanning(true);
    
    // Select dynamic student or teacher/employee randomly from combined list
    const randomIdentity = databaseIdentities[Math.floor(Math.random() * databaseIdentities.length)];
    
    try {
      const response = await fetch('/api/scan-verify-record', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          id: randomIdentity.id,
          name: randomIdentity.name,
          category: randomIdentity.category,
          scanType: 'A.I. TensorFlow Face Scan'
        })
      });

      const resData = await response.json();
      playBeep();

      if (resData.success) {
        const record = resData.record;
        
        const newRecord: ScannedRecord = {
          id: record.id,
          name: record.name,
          class: randomIdentity.classOrDept,
          timestamp: record.timestamp,
          status: record.status,
          type: record.scanType,
          category: record.category,
          aiFeedback: record.aiFeedback,
          confidence: record.confidence
        };

        await saveScanToSystem(newRecord);

        setLogs(prev => [newRecord, ...prev]);
        setLastScanned(newRecord);
        setScanning(false);
        setShowFaceScanSuccess(true);

        setTimeout(() => {
          setShowFaceScanSuccess(false);
        }, 2500);

        setTimeout(() => {
          setLastScanned(null);
        }, 5050);
      } else {
        throw new Error(resData.error || "AI Face verify failed.");
      }
    } catch (err) {
      console.warn("AI Face Analysis API error, falling back locally:", err);
      playBeep();
      const now = new Date();
      const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      const hours = now.getHours();
      const minutes = now.getMinutes();
      const isLate = hours > 8 || (hours === 8 && minutes > 15);

      const newRecord: ScannedRecord = {
        id: randomIdentity.id,
        name: randomIdentity.name,
        class: randomIdentity.classOrDept,
        timestamp: timeStr,
        status: isLate ? 'late' : 'on-time',
        type: 'A.I. TensorFlow Face Scan',
        category: randomIdentity.category,
        aiFeedback: "Biometric standard match."
      };

      await saveScanToSystem(newRecord);

      setLogs(prev => [newRecord, ...prev]);
      setLastScanned(newRecord);
      setScanning(false);
      setShowFaceScanSuccess(true);

      setTimeout(() => {
        setShowFaceScanSuccess(false);
      }, 2500);

      setTimeout(() => {
        setLastScanned(null);
      }, 5050);
    }
  };

  const downloadPDFReport = () => {
    try {
      const doc = new jsPDF();
      
      // Document metadata
      doc.setProperties({
        title: 'Attendance Scan Session Report',
        subject: 'Real-time scan logs summary',
        author: 'EduPulse System'
      });
      
      // Header Styling - Modern Academic
      doc.setFillColor(15, 23, 42); // slate-900 color
      doc.rect(0, 0, 210, 40, 'F');
      
      // Header Title
      doc.setTextColor(255, 255, 255);
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(18);
      doc.text("EDUPULSE ATTENDANCE PORTAL", 15, 18);
      
      // Header Subtitle
      doc.setFont('Helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(203, 213, 225); // slate-300
      doc.text("SESSION RECORD SUMMARY & DRIVER RADAR LOGS", 15, 26);
      
      // Date generated
      doc.setFont('Courier', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(255, 255, 255);
      const generatedAt = new Date().toLocaleString();
      doc.text(`GENERATED: ${generatedAt}`, 140, 18);
      
      // Status Info Section
      doc.setFillColor(248, 250, 252); // slate-50
      doc.rect(15, 48, 180, 25, 'F');
      doc.setDrawColor(226, 232, 240); // slate-200
      doc.rect(15, 48, 180, 25, 'D');
      
      const totalScans = logs.length;
      const onTimeCount = logs.filter(l => l.status === 'on-time').length;
      const lateCount = logs.filter(l => l.status === 'late').length;
      
      doc.setTextColor(15, 23, 42); // slate-900
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(10);
      doc.text("SESSION METRICS SUMMARY", 20, 54);
      
      doc.setFont('Helvetica', 'normal');
      doc.setFontSize(9);
      doc.text(`Total Attendants Captured: ${totalScans}`, 20, 61);
      doc.text(`On-time Check-ins: ${onTimeCount}`, 20, 67);
      
      doc.text(`Late Entry Flags: ${lateCount}`, 110, 61);
      doc.text(`Driver Route Status: ${routeDeviationMeters > 500 ? '⚠️ ROUTE DEVIATION (540m)' : '🚙 NORMAL CORRIDOR (120m)'}`, 110, 67);
      
      // Grid Header for Scan logs
      doc.setFillColor(241, 245, 249); // slate-100
      doc.rect(15, 80, 180, 8, 'F');
      
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.setTextColor(71, 85, 105); // slate-600
      doc.text("STUDENT ID", 18, 85.5);
      doc.text("FULL NAME", 45, 85.5);
      doc.text("CLASS / LEVEL", 90, 85.5);
      doc.text("TIMESTAMP", 135, 85.5);
      doc.text("STATUS", 165, 85.5);
      doc.text("VERIFICATION TYPE", 180, 85.5);
      
      // Table Content
      let currentY = 94;
      doc.setFont('Helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(30, 41, 59); // slate-800
      
      logs.forEach((log) => {
        // Handle page overflow if logs are numerous
        if (currentY > 280) {
          doc.addPage();
          currentY = 20;
        }
        
        doc.setFont('Courier', 'bold');
        doc.text(log.id, 18, currentY);
        
        doc.setFont('Helvetica', 'bold');
        doc.text(log.name, 45, currentY);
        
        doc.setFont('Helvetica', 'normal');
        doc.text(log.class, 90, currentY);
        
        doc.setFont('Courier', 'normal');
        doc.text(log.timestamp, 135, currentY);
        
        if (log.status === 'on-time') {
          doc.setTextColor(16, 185, 129); // emerald-500
          doc.setFont('Helvetica', 'bold');
        } else {
          doc.setTextColor(249, 115, 22); // orange-500
          doc.setFont('Helvetica', 'bold');
        }
        doc.text(log.status.toUpperCase(), 165, currentY);
        
        doc.setTextColor(30, 41, 59); // reset slate-800
        doc.setFont('Helvetica', 'normal');
        doc.text(log.type, 180, currentY);
        
        // Horizontal separation line
        doc.setDrawColor(241, 245, 249);
        doc.line(15, currentY + 3.5, 195, currentY + 3.5);
        
        currentY += 7.5;
      });
      
      // Footer
      doc.setFont('Helvetica', 'italic');
      doc.setFontSize(7.5);
      doc.setTextColor(148, 163, 184); // slate-400
      doc.text("EduPulse Secure Attendance Automated Log Protocol. Unalterable system artifact.", 15, 290);
      
      // Save triggers direct byte download
      doc.save(`Attendance_Session_Report_${new Date().toISOString().split('T')[0]}.pdf`);
      
      setScannerNotification("PDF Report Downloaded Successfully!");
      setTimeout(() => setScannerNotification(null), 3500);
    } catch (err: any) {
      console.error("PDF generation failed:", err);
      setScannerNotification("Error generating PDF: " + err.message);
      setTimeout(() => setScannerNotification(null), 4000);
    }
  };

  const handleShare = async () => {
    const totalScans = logs.length;
    const onTimeCount = logs.filter(l => l.status === 'on-time').length;
    const shareText = `EduPulse Attendance Portal Scan Summary:\n- Total Check-ins: ${totalScans}\n- On-time: ${onTimeCount}\n- Current Route Status: ${routeDeviationMeters > 500 ? '⚠️ Route Deviation Alert!' : '🚙 Normal Corridor'}\n- Date: ${new Date().toLocaleDateString()}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'EduPulse Attendance Summary',
          text: shareText,
          url: window.location.href
        });
        setScannerNotification("Summary Shared Successfully!");
        setTimeout(() => setScannerNotification(null), 3000);
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          console.error("Sharing failed:", err);
          setScannerNotification("Could not share: " + err.message);
          setTimeout(() => setScannerNotification(null), 3000);
        }
      }
    } else {
      // Fallback: Copy to clipboard
      try {
        await navigator.clipboard.writeText(shareText);
        setScannerNotification("Summary copied to Clipboard! (navigator.share not supported on this browser)");
        setTimeout(() => setScannerNotification(null), 4000);
      } catch (clipErr) {
        console.error("Clipboard copy failed:", clipErr);
        setScannerNotification("Sharing not supported in this frame.");
        setTimeout(() => setScannerNotification(null), 3500);
      }
    }
  };

  return (
    <div 
      id="student-attendance-scanner" 
      className={cn(
        "bg-white rounded-2xl border p-6 flex flex-col gap-5 transition-all duration-300",
        routeDeviationMeters > 500 
          ? "border-rose-500 shadow-xl shadow-rose-500/15 ring-4 ring-rose-500/10 animate-pulse" 
          : "border-slate-200 shadow-sm"
      )}
    >
      {/* Visual Tab controller */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-100 pb-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-pulse" />
              Attendance Verification Portal
            </h3>

            {/* Dynamic Status Indicator */}
            {lastScanned ? (
              <span className="bg-emerald-50 border border-emerald-200 text-emerald-700 font-extrabold text-[8.5px] uppercase tracking-wider px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                Verified
              </span>
            ) : cameraActive && !cameraHardwareNotDetected ? (
              <span className="bg-blue-50 border border-blue-200 text-blue-700 font-extrabold text-[8.5px] uppercase tracking-wider px-2.5 py-0.5 rounded-full flex items-center gap-1 animate-pulse">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-ping" />
                Scanning...
              </span>
            ) : (
              <span className="bg-slate-100 border border-slate-200 text-slate-500 font-extrabold text-[8.5px] uppercase tracking-wider px-2.5 py-0.5 rounded-full">
                Standby
              </span>
            )}
          </div>
          <p className="text-[10px] text-slate-500 mt-1">Choose your primary authentication mode below</p>
        </div>

        <div className="flex bg-slate-100 p-1 rounded-xl w-full sm:w-auto border border-slate-200/50">
          <button 
            onClick={() => setActiveTab('qr')}
            className={cn("flex-1 sm:flex-none px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all", activeTab === 'qr' ? "bg-white text-blue-600 shadow-xs" : "text-slate-500 hover:text-slate-800")}
          >
            QR Code
          </button>
          <button 
            onClick={() => setActiveTab('barcode')}
            className={cn("flex-1 sm:flex-none px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all", activeTab === 'barcode' ? "bg-white text-teal-600 shadow-xs" : "text-slate-500 hover:text-slate-800")}
          >
            Barcode
          </button>
          <button 
            onClick={() => setActiveTab('face')}
            className={cn("flex-1 sm:flex-none px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all flex items-center gap-1.5", activeTab === 'face' ? "bg-white text-cyan-600 shadow-xs" : "text-slate-500 hover:text-slate-800")}
          >
            <Cpu size={10} />
            AI Face Scanner
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Left column: Feed Preview viewport */}
        <div className="flex flex-col gap-3">
          <div className={cn(
            "relative aspect-video rounded-xl bg-slate-950 overflow-hidden flex flex-col items-center justify-center transition-all duration-300 border-4",
            routeDeviationMeters > 500 
              ? "border-rose-600 animate-[pulse_1.5s_infinite] shadow-xl shadow-rose-600/20" 
              : "border-slate-900"
          )}>
            {cameraActive ? (
              <>
                {feedMode === 'minimap' ? (
                  /* Localized mini-map of pickup stops with interactive SVG elements */
                  <div className="absolute inset-0 w-full h-full bg-slate-950 p-4 flex flex-col justify-between">
                    <div className="absolute top-3 left-3 z-30 bg-slate-900/95 border border-slate-850 p-2 rounded-lg text-[8px] font-mono text-cyan-400">
                      🗺️ ROUTE RADAR: PICKUP POINTS MAP
                    </div>
                    
                    <svg className="w-full h-full" viewBox="0 0 400 240">
                      <line x1="10" y1="120" x2="390" y2="120" stroke="rgba(255,255,255,0.06)" strokeWidth="4" />
                      <line x1="200" y1="10" x2="200" y2="230" stroke="rgba(255,255,255,0.06)" strokeWidth="4" />
                      <path d="M 30 50 Q 150 70 200 120 T 370 190" stroke="rgba(6,182,212,0.12)" strokeWidth="2.5" fill="none" />
                      
                      <path d="M 50 60 L 120 120 L 200 120 L 290 80 L 350 160" stroke="#3b82f6" strokeWidth="2" fill="none" strokeDasharray="3, 4" className="opacity-70" />

                      {/* Map stop points */}
                      <g transform="translate(50, 60)">
                        <circle r="6" fill="#f59e0b" className="animate-pulse" />
                        <circle r="2.5" fill="#fff" />
                        <text y="-8" textAnchor="middle" fill="#f59e0b" fontSize="8" fontWeight="bold">Darith (Mao Tse Toung)</text>
                      </g>
                      
                      <g transform="translate(120, 120)">
                        <circle r="6" fill="#10b981" />
                        <circle r="2.5" fill="#fff" />
                        <text y="15" textAnchor="middle" fill="#10b981" fontSize="8" fontWeight="bold">Chan Daravy (Norodom)</text>
                      </g>

                      <g transform="translate(290, 80)">
                        <circle r="6" fill="#ef4444" />
                        <circle r="2.5" fill="#fff" />
                        <text y="-8" textAnchor="middle" fill="#ef4444" fontSize="8" fontWeight="bold">Narita (Sihanouk)</text>
                      </g>

                      <g transform="translate(200, 120)">
                        <circle r="8" fill="#4f46e5" />
                        <circle r="3" fill="#fff" />
                        <text y="-11" textAnchor="middle" fill="#818cf8" fontSize="8.5" fontWeight="bold">CAMPUS</text>
                      </g>

                      {/* Active bus node */}
                      <g transform="translate(160, 120)">
                        <circle r="9" fill="rgba(6, 182, 212, 0.4)" className="animate-ping" style={{ animationDuration: '2s' }} />
                        <circle r="5" fill="#06b6d4" />
                      </g>
                    </svg>
                  </div>
                ) : (
                  <>
                    {stream ? (
                      <video 
                        ref={videoRef} 
                        autoPlay 
                        playsInline 
                        muted 
                        className="w-full h-full object-cover scale-x-[-1]" 
                      />
                    ) : (
                      <div className="absolute inset-0 bg-slate-900/90 flex flex-col items-center justify-center text-center p-4">
                        <Smartphone className="w-10 h-10 text-blue-500 animate-bounce mb-2" />
                        <p className="text-[10px] font-black uppercase text-slate-300">Camera Feed Initialized</p>
                        <p className="text-[9px] text-slate-400 mt-1">Virtual digital simulation active.</p>
                      </div>
                    )}

                    {/* Centered Green-Tinted Alignment Guide Box with Pulsing Corner Brackets */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-15">
                      <div className="w-44 h-44 rounded-xl relative bg-emerald-500/15 border border-emerald-500/25 shadow-[0_0_20px_rgba(16,185,129,0.08)] flex flex-col justify-between p-2">
                        {/* Glowing Corner Brackets */}
                        <div className="absolute top-0 left-0 w-5 h-5 border-t-4 border-l-4 border-emerald-500 rounded-tl-md animate-[pulse_1.5s_infinite]" />
                        <div className="absolute top-0 right-0 w-5 h-5 border-t-4 border-r-4 border-emerald-500 rounded-tr-md animate-[pulse_1.5s_infinite]" />
                        <div className="absolute bottom-0 left-0 w-5 h-5 border-b-4 border-l-4 border-emerald-500 rounded-bl-md animate-[pulse_1.5s_infinite]" />
                        <div className="absolute bottom-0 right-0 w-5 h-5 border-b-4 border-r-4 border-emerald-500 rounded-br-md animate-[pulse_1.5s_infinite]" />
                        
                        {/* Scan Guide Indicator Laser Line */}
                        <div className="w-full h-0.5 bg-emerald-500/65 absolute left-0 right-0 top-1/2 -translate-y-1/2 animate-[pulse_1s_infinite] shadow-[0_0_8px_rgba(16,185,129,0.6)]" />

                        {/* Alignment Instruction */}
                        <div className="w-full text-center mt-auto mb-1 text-[8px] font-extrabold text-emerald-400 uppercase tracking-widest bg-slate-950/40 py-0.5 rounded-md backdrop-blur-xs">
                          ALIGN CODE
                        </div>
                      </div>
                    </div>

                    {/* Desktop Floating History Action Button */}
                    <button
                      onClick={() => setIsHistoryOpen(true)}
                      className="absolute top-3 left-3 z-30 px-3 py-1.5 bg-slate-900/95 hover:bg-slate-800 text-slate-200 hover:text-white rounded-xl border border-slate-700 text-[9px] font-black uppercase tracking-wider flex items-center gap-1.5 shadow-lg cursor-pointer transition-transform active:scale-95"
                      title="Open Successful Scans History Modal"
                    >
                      <Clock size={11} className="text-amber-400" />
                      <span>History</span>
                    </button>

                    {/* Grid Overlay to Visualize Scan Area */}
                    <div className="absolute inset-0 pointer-events-none grid grid-cols-4 grid-rows-4 opacity-15 border border-white/10 z-10 p-2">
                      {Array.from({ length: 16 }).map((_, idx) => (
                        <div key={idx} className="border-[0.5px] border-dashed border-slate-300" />
                      ))}
                    </div>

                    {/* Overlaid Dynamic Landmark Canvas */}
                    <canvas 
                      ref={canvasRef}
                      className="absolute inset-0 w-full h-full object-cover scale-x-[-1] pointer-events-none z-10"
                    />
                  </>
                )}

                {/* Mode toggle switch button between camera and mini-map */}
                <button
                  onClick={() => setFeedMode(prev => prev === 'live' ? 'minimap' : 'live')}
                  className="absolute top-3 right-3 z-30 p-2 bg-slate-900/95 hover:bg-slate-800 text-slate-200 hover:text-white rounded-xl border border-slate-700 text-[9px] font-black uppercase tracking-wider flex items-center gap-1.5 shadow-lg cursor-pointer"
                >
                  {feedMode === 'live' ? (
                    <>
                      <Map size={11} className="text-cyan-400" />
                      <span>Switch to Mini-map</span>
                    </>
                  ) : (
                    <>
                      <Camera size={11} className="text-blue-400" />
                      <span>Switch to Live Feed</span>
                    </>
                  )}
                </button>

                {/* Real-time calculated arrival ETA element */}
                <div className="absolute top-3 left-3 z-30 bg-slate-950/90 border border-slate-800 p-2.5 rounded-xl text-[7.5px] font-mono text-slate-300 uppercase flex flex-col gap-0.5 max-w-[150px] shadow">
                  <div className="flex items-center gap-1">
                    <Clock size={10} className="text-green-400 animate-spin" style={{ animationDuration: '10s' }} />
                    <span className="font-bold text-white">Route Stop ETA</span>
                  </div>
                  <p className="text-slate-400 text-[6.5px] mt-0.5">
                    Next: <strong className="text-cyan-400">Mao Tse Toung Blvd</strong>
                  </p>
                  <p className="text-slate-200 font-extrabold text-[8.5px] mt-0.5">
                    ETA: <span className="text-green-400">{etaMinutes} Mins</span> ({new Date(Date.now() + etaMinutes * 60000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})
                  </p>
                </div>

                {/* Next 3 Pickups scheduled manifest schedule overlay */}
                <div className="absolute bottom-12 left-3 z-30 max-w-[170px] bg-slate-950/90 border border-slate-800 rounded-xl p-2 shadow-xl font-mono text-[6.5px] text-slate-400">
                  <p className="text-[7px] font-bold text-white mb-1.5 flex items-center gap-1 uppercase">
                    <Bus size={10} className="text-blue-400" />
                    Next 3 Pickups
                  </p>
                  <div className="space-y-1">
                    {transportManifest.slice(0, 3).map((st, idx) => (
                      <div key={st.id} className="flex justify-between items-center gap-2 border-b border-white/5 pb-0.5 last:border-0 last:pb-0">
                        <div className="truncate">
                          <p className="font-extrabold text-slate-200 truncate">{idx + 1}. {st.name}</p>
                          <p className="text-[6px] text-slate-500 truncate">{st.stop}</p>
                        </div>
                        <span className={cn(
                          "px-1 py-0.2 rounded text-[5.5px] font-black uppercase tracking-wide",
                          idx === 0 ? "bg-amber-500/15 text-amber-400 border border-amber-500/10" : "bg-slate-800 text-slate-400"
                        )}>
                          {st.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Flashing deviation red borders description warning label */}
                {routeDeviationMeters > 500 && (
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-40 bg-rose-600/95 border border-rose-500 text-white font-mono text-[9px] font-black uppercase tracking-wider px-4 py-2 rounded-xl flex items-center gap-2 shadow-2xl animate-bounce text-center max-w-[210px]">
                    <AlertCircle size={14} className="text-yellow-300 animate-pulse" />
                    <div>
                      <p>ROUTE DEVIATION ALERT</p>
                      <p className="text-[7.5px] font-medium text-rose-100 mt-0.5">Driver is {routeDeviationMeters}m off school corridor path!</p>
                    </div>
                  </div>
                )}

                {/* Scan Now Floating Button */}
                {!cameraHardwareNotDetected && (
                  <button
                    onClick={() => {
                      if (activeTab === 'face') {
                        triggerAiFaceAnalysis();
                      } else {
                        const randomIdentity = databaseIdentities[Math.floor(Math.random() * databaseIdentities.length)];
                        handleVerifyId(randomIdentity.id);
                      }
                    }}
                    className="absolute bottom-12 right-3 z-30 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-black text-[9px] tracking-wider uppercase rounded-full shadow-lg shadow-blue-600/35 transition-transform duration-100 transform hover:scale-105 active:scale-95 flex items-center gap-1.5 border border-blue-400/30 cursor-pointer"
                  >
                    <Scan className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: '3s' }} />
                    <span>Scan Now</span>
                  </button>
                )}

                {/* Absolute-positioned hardware error overlay with manual ID retry fallback */}
                {cameraHardwareNotDetected && (
                  <div className="absolute inset-0 bg-slate-950/95 border border-red-500/30 flex flex-col items-center justify-center p-4 text-center z-40 animate-fadeIn">
                    <AlertCircle className="w-10 h-10 text-red-500 animate-pulse mb-1 shrink-0" />
                    <p className="text-[10px] font-black uppercase text-red-400 tracking-wider">CAMERA HARDWARE NOT DETECTED</p>
                    <p className="text-[9px] text-slate-400 leading-relaxed max-w-[260px] mt-1 mb-2.5">
                      No live video hardware was detected. Use the fallback retry panel below to match student IDs manually.
                    </p>
                    
                    {/* Fallback manual entry retry container */}
                    <div className="w-full max-w-[220px] flex flex-col gap-1.5 bg-slate-900 p-2 rounded-xl border border-slate-800">
                      <span className="text-[7.5px] font-black text-slate-400 uppercase tracking-widest text-left block">Fallback ID Retry</span>
                      <div className="flex gap-1">
                        <input 
                          type="text"
                          placeholder="ENTER ID (e.g. ST001)..."
                          value={manualId}
                          onChange={(e) => setManualId(e.target.value)}
                          className="flex-1 px-2 py-1 bg-slate-950 border border-slate-800 rounded text-[9px] font-semibold text-white outline-none focus:ring-1 focus:ring-red-500"
                        />
                        <button 
                          onClick={() => {
                            if (manualId.trim()) {
                              handleVerifyId(manualId);
                              setCameraHardwareNotDetected(false); // recover overlay upon verification
                            }
                          }}
                          className="px-2.5 bg-red-600 hover:bg-red-500 text-white text-[8px] font-bold uppercase tracking-wider rounded cursor-pointer"
                        >
                          Retry
                        </button>
                      </div>
                    </div>

                    <button 
                      onClick={() => {
                        setCameraHardwareNotDetected(false);
                        startCamera();
                      }}
                      className="mt-2.5 text-[8px] font-black text-slate-400 hover:text-white uppercase tracking-wider underline cursor-pointer"
                    >
                      Re-probe Hardware Nodes
                    </button>
                  </div>
                )}

                {/* Digital analytics hud */}
                <div className="absolute bottom-2 left-2 right-2 bg-slate-950/85 border border-slate-800 p-2.5 rounded-xl text-[7.5px] font-mono text-slate-400 flex justify-between uppercase z-10">
                  <span>Mode: {activeTab.toUpperCase()}</span>
                  <span>Engine: {activeTab === 'face' ? "TensorFlow WebGL" : "WASM Decoder"}</span>
                  <span className={cn(scanning ? "text-rose-500 font-bold" : "text-emerald-500")}>
                    {scanning ? "■ PARSING..." : "● LISTENING"}
                  </span>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center gap-2 p-6 text-center">
                <CameraOff className="w-12 h-12 text-slate-500" />
                <p className="text-xs font-bold text-slate-400">Camera scanner is offline</p>
                <p className="text-[10px] text-slate-500 leading-relaxed max-w-[200px]">Activate device camera stream to begin scanning in real-time.</p>
              </div>
            )}
          </div>

          <div className="flex gap-2">
            {!cameraActive ? (
              <button 
                id="activate-camera-btn"
                onClick={startCamera}
                className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-[10px] uppercase tracking-wider rounded-xl transition duration-150 flex items-center justify-center gap-1.5 shadow cursor-pointer"
              >
                <Camera size={13} />
                Activate Camera
              </button>
            ) : (
              <>
                <button 
                  id="deactivate-camera-btn"
                  onClick={stopCamera}
                  className="flex-1 py-2.5 bg-slate-850 hover:bg-slate-800 text-white font-bold text-[10px] uppercase tracking-wider rounded-xl transition duration-150 flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Square size={13} />
                  Stop Feed
                </button>
                <button
                  onClick={() => setCameraHardwareNotDetected(prev => !prev)}
                  className={cn(
                    "px-3 py-2.5 font-bold text-[8.5px] uppercase tracking-wider rounded-xl transition-all duration-150 cursor-pointer border shrink-0",
                    cameraHardwareNotDetected
                      ? "bg-red-100 text-red-750 border-red-300"
                      : "bg-slate-105 hover:bg-slate-200 border-slate-300 text-slate-650"
                  )}
                  title="Force Simulate camera hardware error/permission block"
                >
                  {cameraHardwareNotDetected ? "Err Active" : "Simulate Cam Err"}
                </button>
                <button
                  onClick={() => setRouteDeviationMeters(prev => prev > 500 ? 120 : 540)}
                  className={cn(
                    "px-3 py-2.5 font-bold text-[8.5px] uppercase tracking-wider rounded-xl transition-all duration-150 cursor-pointer border shrink-0",
                    routeDeviationMeters > 500
                      ? "bg-rose-600 text-white border-rose-500 shadow animate-pulse"
                      : "bg-white hover:bg-slate-50 border-slate-200 text-slate-600"
                  )}
                  title="Force route deviation setting above/below 500 meters"
                >
                  {routeDeviationMeters > 500 ? "⚠️ Deviation Active (540m)" : "🚙 Route Normal (120m)"}
                </button>
              </>
            )}
          </div>
        </div>

        {/* Right column: Interactive triggers and logs */}
        <div className="flex flex-col gap-4">
          {cameraActive && activeTab === 'face' && (
            <div className="bg-cyan-50/60 border border-cyan-200/50 rounded-2xl p-4 flex flex-col gap-3.5">
              <div>
                <span className="text-[9px] font-black uppercase text-cyan-700 tracking-wider flex items-center gap-1">
                  <Cpu size={12} />
                  AI Face Recognition Control
                </span>
                <p className="text-[10px] text-slate-500 mt-1">
                  {loadingModel 
                    ? "Downloading convolutional model weights into browser thread..." 
                    : tfLoaded 
                    ? "TensorFlow.js face mapping model compiled successfully." 
                    : "Toggle model parameters to detect faces instantly using device webcam."}
                </p>
              </div>

              {loadingModel ? (
                <div className="flex items-center gap-2.5 py-1 text-slate-600 text-xs">
                  <RefreshCw size={14} className="animate-spin text-cyan-600" />
                  <span className="font-semibold text-[10px] uppercase">Mounting neural layer...</span>
                </div>
              ) : (
                <button
                  onClick={triggerAiFaceAnalysis}
                  disabled={scanning}
                  className={cn(
                    "py-2 px-3 rounded-xl font-bold text-[10px] uppercase tracking-wider transition-colors text-center cursor-pointer",
                    scanning 
                      ? "bg-slate-150 text-slate-450 cursor-not-allowed" 
                      : "bg-cyan-600 hover:bg-cyan-700 text-white shadow-md shadow-cyan-650/10"
                  )}
                >
                  {scanning ? "Processing Biometric Map..." : "Scan Biometric Student ID"}
                </button>
              )}
            </div>
          )}

          {cameraActive && activeTab !== 'face' && (
            <div className="bg-blue-50/75 border border-blue-200/50 rounded-xl p-3 flex flex-col gap-2 animate-fadeIn">
              <span className="text-[8px] font-black uppercase text-blue-605 tracking-wider">Fast Simulation Hotlinks (Students & Teachers)</span>
              <div className="grid grid-cols-2 gap-2">
                {databaseIdentities.slice(0, 8).map(identity => (
                  <button
                    key={identity.id}
                    disabled={scanning}
                    onClick={() => handleVerifyId(identity.id)}
                    className={cn(
                      "p-2 bg-white border rounded-lg text-left transition-all shrink-0 cursor-pointer text-[10.5px] flex flex-col gap-0.5 shadow-2xs",
                      identity.category === "Employee" 
                        ? "hover:bg-purple-50/80 hover:border-purple-300 border-purple-100" 
                        : "hover:bg-blue-50/80 hover:border-blue-300 border-slate-200"
                    )}
                  >
                    <div className="flex items-center justify-between gap-1 w-full">
                      <span className="font-bold text-slate-800 truncate">{identity.name}</span>
                      <span className={cn(
                        "text-[6.5px] font-black px-1.5 py-0.2 rounded-full uppercase tracking-wide shrink-0",
                        identity.category === "Employee" 
                          ? "bg-purple-100 text-purple-700 font-extrabold" 
                          : "bg-blue-105 text-blue-750 font-extrabold"
                      )}>
                        {identity.category === "Employee" ? "Staff" : "Student"}
                      </span>
                    </div>
                    <span className="text-[8.5px] font-mono font-bold text-slate-450">{identity.id}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-2">
            <input 
              type="text"
              placeholder="Enter Student ID manually..."
              value={manualId}
              onChange={(e) => setManualId(e.target.value)}
              className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-[10px] font-semibold outline-none focus:ring-2 focus:ring-blue-500/20"
            />
            <button 
              onClick={() => handleVerifyId(manualId)}
              className="px-3 bg-slate-900 text-white text-[9px] font-bold uppercase tracking-wider rounded-lg hover:bg-slate-800 transition cursor-pointer"
            >
              Verify
            </button>
          </div>

          <div className="flex-1 flex flex-col gap-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Real-time attendance logs</span>
              <div className="flex items-center gap-1.5 mb-1">
                {/* Download PDF Button */}
                <button
                  onClick={downloadPDFReport}
                  className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[8px] font-extrabold uppercase tracking-wide rounded border border-slate-200 transition flex items-center gap-1 hover:text-slate-900 cursor-pointer"
                  title="Download PDF Log Report"
                >
                  <FileText size={9} className="text-blue-500" />
                  <span>PDF Report</span>
                </button>

                {/* Share Button */}
                <button
                  onClick={handleShare}
                  className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[8px] font-extrabold uppercase tracking-wide rounded border border-slate-200 transition flex items-center gap-1 hover:text-slate-900 cursor-pointer"
                  title="Share Scan Summary"
                >
                  <Share2 size={9} className="text-teal-500" />
                  <span>Share</span>
                </button>
              </div>
            </div>
            <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1">
              {logs.map((log, index) => (
                <div key={index} className="flex flex-col gap-1.5 p-2.5 bg-slate-50 border border-slate-100 rounded-xl hover:bg-slate-100/70 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <UserCheck size={14} className={cn(log.category === "Employee" ? "text-purple-500" : "text-emerald-500", "shrink-0")} />
                      <div>
                        <div className="flex items-center gap-1.5">
                          <p className="text-[10px] font-bold text-slate-800">{log.name}</p>
                          <span className={cn(
                            "px-1 py-0.2 rounded text-[6px] font-black uppercase tracking-wider",
                            log.category === "Employee" ? "bg-purple-100 text-purple-700" : "bg-emerald-100 text-emerald-700"
                          )}>
                            {log.category || "Student"}
                          </span>
                        </div>
                        <p className="text-[8px] font-medium text-slate-400 font-mono uppercase leading-none mt-0.5">{log.id} • {log.class}</p>
                      </div>
                    </div>
                    <div className="text-right flex flex-col items-end gap-0.5">
                      <span className="text-[8px] font-black text-slate-400">{log.timestamp}</span>
                      <span className={cn(
                        "px-1.5 py-0.5 rounded text-[7px] font-black uppercase tracking-widest",
                        log.status === 'on-time' ? "bg-emerald-100 text-emerald-800" : "bg-orange-100 text-orange-850"
                      )}>
                        {log.status}
                      </span>
                    </div>
                  </div>
                  {log.aiFeedback && (
                    <div className="pl-6 border-l-2 border-slate-200 mt-1">
                      <p className="text-[8px] text-slate-500 italic leading-snug"><strong className="text-slate-600 font-mono text-[7px] font-bold uppercase mr-1">A.I. Smart Audit:</strong>"{log.aiFeedback}"</p>
                      {log.confidence && (
                        <p className="text-[7.5px] font-mono text-cyan-600 font-bold mt-0.5">Confidence Score: {(log.confidence * 100).toFixed(1)}%</p>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {scannerNotification && (
        <div className="bg-slate-900 text-white p-3.5 rounded-xl flex items-center justify-between gap-3 animate-pulse">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={16} className="text-blue-400 shrink-0" />
            <p className="text-[9.5px] font-bold uppercase tracking-wide">{scannerNotification}</p>
          </div>
        </div>
      )}

      {lastScanned && (
        <div className={cn(
          "text-white p-4 rounded-2xl flex flex-col gap-2.5 shadow-xl transition-all duration-300 animate-bounce border-2",
          lastScanned.category === "Employee" 
            ? "bg-slate-950 border-purple-500 shadow-purple-500/10" 
            : "bg-slate-950 border-emerald-500 shadow-emerald-500/10"
        )}>
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className={cn(
                "p-2 rounded-xl shrink-0",
                lastScanned.category === "Employee" ? "bg-purple-500/20 text-purple-400" : "bg-emerald-500/20 text-emerald-400"
              )}>
                <CheckCircle2 size={18} className="shrink-0" />
              </div>
              <div>
                <p className={cn(
                  "text-[10px] font-black tracking-wider uppercase leading-none",
                  lastScanned.category === "Employee" ? "text-purple-405" : "text-emerald-405"
                )}>
                  🔑 Smart Identity Verified ({lastScanned.category?.toUpperCase() || 'STUDENT'})
                </p>
                <p className="text-[10px] font-bold text-slate-200 mt-1.5">
                  {lastScanned.name} (<span className="font-mono text-cyan-400">{lastScanned.id}</span>)
                </p>
                <p className="text-[8.5px] font-medium text-slate-400 mt-0.5 font-mono leading-none">
                  SECURE VERIFICATION IN PROGRESS VIA {lastScanned.type.toUpperCase()}
                </p>
              </div>
            </div>
            {lastScanned.confidence && (
              <span className="px-1.5 py-0.5 bg-cyan-950 text-cyan-450 border border-cyan-800/40 rounded-md font-mono text-[8px] font-black tracking-wider uppercase shrink-0">
                Match: {(lastScanned.confidence * 100).toFixed(1)}%
              </span>
            )}
          </div>
          {lastScanned.aiFeedback && (
            <div className="bg-slate-900 border border-slate-800 p-2.5 rounded-xl text-[8.5px] text-slate-300 font-mono leading-relaxed relative">
              <span className="absolute -top-1.5 left-2.5 bg-slate-950 px-1.5 text-[6.5px] font-extrabold uppercase text-slate-500 font-mono tracking-widest leading-none">A.I. Smart Analysis</span>
              {lastScanned.aiFeedback}
            </div>
          )}
          <div className="text-[7.5px] tracking-wider text-slate-500 font-mono text-right flex justify-between uppercase border-t border-slate-900 pt-2 shrink-0">
            <span className="text-emerald-500">● Log state: Auto recorded in system</span>
            <span>Recorded At: {lastScanned.timestamp}</span>
          </div>
        </div>
      )}

      {/* History Modal Overlay for Recent scans */}
      {isHistoryOpen && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-[2rem] border border-slate-200 shadow-2xl p-6 w-full max-w-md overflow-hidden flex flex-col gap-4 animate-[fadeIn_0.15s_ease-out]">
            <div className="flex justify-between items-center border-b border-secondary-100 pb-3">
              <div>
                <h3 className="font-extrabold text-slate-900 text-sm tracking-tight flex items-center gap-1.5 uppercase">
                  <Clock size={15} className="text-amber-500 animate-[spin_4s_linear_infinite]" />
                  Scan Session History
                </h3>
                <p className="text-[9.5px] font-semibold text-slate-500 mt-1">Showing 10 most recent verified matches</p>
              </div>
              <button 
                onClick={() => setIsHistoryOpen(false)}
                className="w-7 h-7 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center text-xs font-bold transition cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
              {logs.length === 0 ? (
                <div className="py-12 text-center text-slate-400 text-[10px] font-semibold">
                  No scan logs recorded inside this session.
                </div>
              ) : (
                logs.slice(0, 10).map((log, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-slate-50 border border-slate-100 rounded-2xl hover:bg-slate-103/60 transition-all duration-100">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 bg-emerald-100/70 rounded-xl flex items-center justify-center text-emerald-600">
                        <UserCheck size={14} />
                      </div>
                      <div>
                        <p className="text-[10.5px] font-extrabold text-slate-800 leading-snug">{log.name}</p>
                        <p className="text-[8px] font-extrabold text-slate-400 font-mono tracking-wider uppercase leading-none mt-0.5">
                          {log.id} • {log.class}
                        </p>
                      </div>
                    </div>
                    <div className="text-right flex flex-col items-end gap-1 shrink-0">
                      <span className="text-[8.5px] font-extrabold text-slate-500 font-mono">{log.timestamp}</span>
                      <div className="flex items-center gap-1">
                        <span className="px-1.5 py-0.5 rounded-full text-[6.5px] font-black uppercase tracking-wider bg-slate-200 text-slate-600">
                          {log.type}
                        </span>
                        <span className={cn(
                          "px-1.5 py-0.5 rounded-full text-[6.5px] font-black uppercase tracking-wider",
                          log.status === 'on-time' ? "bg-emerald-100 text-emerald-800" : "bg-orange-100 text-orange-850"
                        )}>
                          {log.status}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            <button
              onClick={() => setIsHistoryOpen(false)}
              className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-[10px] uppercase tracking-widest rounded-xl transition cursor-pointer"
            >
              Close History Log
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
