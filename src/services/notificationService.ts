import { getDoc, doc } from 'firebase/firestore';
import { getDb } from '../lib/firebase';

export async function sendTelegramNotification(chatId: string, message: string) {
  try {
    const db = await getDb();
    if (!db) throw new Error("Firestore not initialized");

    // Attempt to get the bot token from Firestore first (admin updateable)
    let botToken = null;
    try {
      const settingsDoc = await getDoc(doc(db, 'settings', 'global'));
      if (settingsDoc.exists()) {
        botToken = settingsDoc.data().telegramBotToken;
      }
    } catch (e) {
      console.warn("Could not fetch telegram bot token from firestore settings", e);
    }

    const response = await fetch('/api/telegram/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chatId,
        message,
        botToken
      }),
    });

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error sending telegram notification:', error);
    return { success: false, error: 'Failed to send notification' };
  }
}

export const NOTIFICATION_TEMPLATES = {
  PARENT_MEETING: (name: string, date: string, time: string) => 
    `📢 <b>Parent-Teacher Meeting Invitation</b>\n\nDear Parent,\n\nYou are invited to a meeting regarding <b>${name}</b>.\n🗓 Date: ${date}\n⏰ Time: ${time}\n\nPlease confirm your attendance via the school app.`,
  
  STUDENT_WARNING: (name: string, reason: string) =>
    `⚠️ <b>Official Warning</b>\n\nStudent: <b>${name}</b>\nReason: ${reason}\n\nPlease discuss this with your child and contact the office if needed.`,
  
  ATTENDANCE_LATE: (name: string, time: string) =>
    `⏰ <b>Late Arrival Notification</b>\n\nStudent: <b>${name}</b> arrived late today at ${time}.`,
  
  ATTENDANCE_ABSENT: (name: string) =>
    `🚨 <b>Absence Notification</b>\n\nStudent: <b>${name}</b> is marked <b>ABSENT</b> today. Please provide a reason via the school app.`,
  
  UNPAID_FEES: (name: string, amount: string) =>
    `💳 <b>Unpaid Invoice Notification</b>\n\nA payment of <b>${amount}</b> is pending for student: <b>${name}</b>. Please settle this soon to avoid service disruptions.`,
  
  NON_PAYMENT_WARNING: (name: string, deadline: string) =>
    `🚨 <b>Final Payment Notice</b>\n\nDear Parent, student <b>${name}</b> has outstanding fees. Final deadline is <b>${deadline}</b>. Failure to settle may lead to temporary suspension of auxiliary services.`,

  RULE_VIOLATION: (name: string, violation: string) =>
    `🚩 <b>Disciplinary Alert</b>\n\nStudent: <b>${name}</b>\nIncident: ${violation}\n\nThe student has been informed of the school rules. Continuous violations may lead to formal suspension.`,

  EXAM_SCHEDULE: (subject: string, date: string, room: string) =>
    `📅 <b>Upcoming Exam Schedule</b>\n\nSubject: <b>${subject}</b>\nDate: ${date}\nRoom: ${room}\n\nPlease ensure the student arrives 15 minutes early with necessary stationery.`,

  EVENT_CONFIRMATION: (event: string, studentName: string) =>
    `🎉 <b>Event Registration Confirmed</b>\n\nStudent: <b>${studentName}</b> is now registered for: <b>${event}</b>.\nWe look forward to seeing you there!`,

  EXAM_RESULT: (name: string, subject: string, score: number) =>
    `📊 <b>Monthly Exam Result</b>\n\nStudent: <b>${name}</b>\nSubject: <b>${subject}</b>\nScore: <b>${score}</b>\n\nKeep up the hard work!`,
};
