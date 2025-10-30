// controllers/streak.controller.js
import { z } from "zod";
import User from "../models/User.js";
import StreakEvent from "../models/StreakEvent.js";

const logEventSchema = z.object({
  type: z.enum(['note', 'review', 'quiz', 'ai_session', 'revision', 'freeze']),
  occurredAt: z.string().optional(), // ISO date string, for backfill
  metadata: z.object({
    noteId: z.string().optional(),
    flashcardsReviewed: z.number().optional(),
    quizQuestions: z.number().optional(),
    editLength: z.number().optional(),
    revisionScheduled: z.boolean().optional()
  }).optional()
});

// Helper: Get user's local date (considering timezone)
function getUserLocalDate(userTimezone, date = new Date()) {
  try {
    // Validate timezone first
    if (!userTimezone || typeof userTimezone !== 'string') {
      throw new Error('Invalid timezone');
    }
    // Create date string in user's timezone
    const dateStr = date.toLocaleDateString("en-CA", { timeZone: userTimezone }); // YYYY-MM-DD format
    // Validate the result is a valid date string
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
      throw new Error('Invalid date string generated');
    }
    return dateStr;
  } catch (e) {
    // Fallback to UTC if timezone is invalid
    console.warn('Invalid timezone, falling back to UTC:', userTimezone);
    // Ensure date is valid before calling toISOString
    if (isNaN(date.getTime())) {
      console.error('Invalid date object passed to getUserLocalDate');
      return new Date().toISOString().split('T')[0];
    }
    return date.toISOString().split('T')[0];
  }
}

// Helper: Get timezone offset in minutes
function getTimezoneOffset(timezone) {
  try {
    // Use a more reliable method to get timezone offset
    const now = new Date();
    const utcDate = new Date(now.toLocaleString("en-US", {timeZone: "UTC"}));
    const targetDate = new Date(now.toLocaleString("en-US", {timeZone: timezone}));
    const offset = (targetDate - utcDate) / (1000 * 60); // in minutes
    return offset;
  } catch {
    return 0; // Default to UTC
  }
}

// Helper: Check if event qualifies for streak
function qualifiesForStreak(event) {
  switch (event.type) {
    case 'note':
      return event.metadata?.editLength >= 20; // Meaningful edit
    case 'review':
      return event.metadata?.flashcardsReviewed >= 10;
    case 'quiz':
      return event.metadata?.quizQuestions >= 1;
    case 'ai_session':
    case 'revision':
    case 'freeze':
      return true; // Always count
    default:
      return false;
  }
}

// Helper: Calculate streak for user
async function calculateStreak(userId) {
  const user = await User.findById(userId);
  if (!user) return { currentStreak: 0, longestStreak: 0 };

  const events = await StreakEvent.find({ user: userId })
    .sort({ occurredAt: -1 })
    .limit(365); // Last year should be enough

  if (!events.length) return { currentStreak: 0, longestStreak: user.longestStreak || 0 };

  // Group events by local date
  const eventsByDate = {};
  events.forEach(event => {
    if (!qualifiesForStreak(event)) return;
    const localDate = getUserLocalDate(user.timezone, new Date(event.occurredAt));
    if (!eventsByDate[localDate]) eventsByDate[localDate] = [];
    eventsByDate[localDate].push(event);
  });

  const dates = Object.keys(eventsByDate).sort().reverse(); // Most recent first
  let currentStreak = 0;
  let longestStreak = user.longestStreak || 0;

  // Calculate current streak
  const today = getUserLocalDate(user.timezone);
  const yesterday = getUserLocalDate(user.timezone, new Date(Date.now() - 24 * 60 * 60 * 1000));

  // Check today and yesterday (grace period)
  if (eventsByDate[today] || eventsByDate[yesterday]) {
    currentStreak = 1;
    let checkDate = new Date(today + 'T00:00:00'); // Parse as date
    checkDate.setDate(checkDate.getDate() - 1);

    while (true) {
      const dateStr = checkDate.toISOString().split('T')[0];
      if (eventsByDate[dateStr]) {
        currentStreak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }
  }

  // Update longest streak
  if (currentStreak > longestStreak) {
    longestStreak = currentStreak;
  }

  return { currentStreak, longestStreak };
}

// LOG EVENT
export const logEvent = async (req, res, next) => {
  try {
    const data = logEventSchema.parse(req.body);
    const userId = req.user.id;

    // Anti-cheating: server timestamp > client time
    const clientTime = data.occurredAt ? new Date(data.occurredAt) : new Date();
    const serverTime = new Date();
    if (serverTime.getTime() - clientTime.getTime() > 1000 * 60 * 5) { // 5 min tolerance
      return res.status(400).json({ error: "Invalid timestamp" });
    }

    // Backfill safeguard: up to 24h
    if (data.occurredAt && serverTime.getTime() - clientTime.getTime() > 1000 * 60 * 60 * 24) {
      return res.status(400).json({ error: "Cannot backfill events older than 24h" });
    }

    const event = await StreakEvent.create({
      user: userId,
      type: data.type,
      occurredAt: data.occurredAt ? new Date(data.occurredAt) : new Date(),
      metadata: data.metadata || {}
    });

    // Update user's streak
    const { currentStreak, longestStreak } = await calculateStreak(userId);
    await User.findByIdAndUpdate(userId, {
      currentStreak,
      longestStreak,
      lastActiveDate: getUserLocalDate((await User.findById(userId)).timezone)
    });

    res.status(201).json({ event, currentStreak, longestStreak });
  } catch (e) { next(e); }
};

// GET STREAK
export const getStreak = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId).select('currentStreak longestStreak lastActiveDate timezone freezeTokens');

    if (!user) return res.status(404).json({ error: "User not found" });

    // Recalculate to ensure accuracy
    const { currentStreak, longestStreak } = await calculateStreak(userId);

    res.json({
      currentStreak,
      longestStreak,
      lastActiveDate: user.lastActiveDate,
      timezone: user.timezone,
      freezeTokens: user.freezeTokens
    });
  } catch (e) { next(e); }
};

// USE FREEZE TOKEN
export const useFreezeToken = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);

    if (!user || user.freezeTokens <= 0) {
      return res.status(400).json({ error: "No freeze tokens available" });
    }

    // Record a 'freeze' event for today so streak is preserved
    await StreakEvent.create({
      user: userId,
      type: 'freeze',
      occurredAt: new Date(),
      metadata: {}
    });

    // Decrement freeze token
    await User.findByIdAndUpdate(userId, { freezeTokens: user.freezeTokens - 1 });

    // Recalculate streak with the freeze event counting for today
    const { currentStreak, longestStreak } = await calculateStreak(userId);
    await User.findByIdAndUpdate(userId, { currentStreak, longestStreak, lastActiveDate: getUserLocalDate(user.timezone) });

    res.json({ message: "Freeze token used", freezeTokens: user.freezeTokens - 1, currentStreak, longestStreak });
  } catch (e) { next(e); }
};

// SET TIMEZONE (only if not locked)
export const setTimezone = async (req, res, next) => {
  try {
    const { timezone } = z.object({ timezone: z.string() }).parse(req.body);
    const userId = req.user.id;

    const user = await User.findById(userId);
    if (user.tz_locked_at) {
      return res.status(400).json({ error: "Timezone is locked" });
    }

    await User.findByIdAndUpdate(userId, {
      timezone,
      tz_locked_at: new Date()
    });

    res.json({ message: "Timezone set", timezone });
  } catch (e) { next(e); }
};
