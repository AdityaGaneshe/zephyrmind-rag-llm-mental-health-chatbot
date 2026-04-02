import { randomUUID } from "crypto";
import type {
  User, InsertUser,
  StressEntry, InsertStressEntry,
  ChatMessage, InsertChatMessage,
  Task, Video, UserTaskCompletion
} from "@shared/schema";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  getStressEntries(): Promise<StressEntry[]>;
  createStressEntry(entry: InsertStressEntry): Promise<StressEntry>;
  deleteStressEntry(id: string): Promise<void>;

  getChatMessages(sessionId: string): Promise<ChatMessage[]>;
  createChatMessage(msg: InsertChatMessage): Promise<ChatMessage>;
  clearChatSession(sessionId: string): Promise<void>;

  getTasks(): Promise<Task[]>;
  getTasksByStressLevel(level: number): Promise<Task[]>;

  getVideos(): Promise<Video[]>;
  getVideosByStressLevel(level: number): Promise<Video[]>;

  getTaskCompletions(): Promise<UserTaskCompletion[]>;
  completeTask(taskId: string): Promise<UserTaskCompletion>;
  uncompleteTask(taskId: string): Promise<void>;
}

const TASKS_SEED: Task[] = [
  {
    id: "t1",
    title: "4-7-8 Breathing Exercise",
    description: "Inhale for 4 counts, hold for 7 counts, exhale for 8 counts. Repeat 4 times to activate your parasympathetic nervous system.",
    category: "Breathing",
    minStressLevel: 1,
    maxStressLevel: 10,
    durationMinutes: 5,
    icon: "Wind",
  },
  {
    id: "t2",
    title: "5-Minute Body Scan",
    description: "Close your eyes and slowly scan your body from head to toe, noticing any tension and consciously releasing it.",
    category: "Mindfulness",
    minStressLevel: 1,
    maxStressLevel: 10,
    durationMinutes: 5,
    icon: "Eye",
  },
  {
    id: "t3",
    title: "Gratitude Journaling",
    description: "Write down 3 things you are grateful for today. Research shows this shifts your focus to the positive and reduces anxiety.",
    category: "Journaling",
    minStressLevel: 1,
    maxStressLevel: 5,
    durationMinutes: 10,
    icon: "BookOpen",
  },
  {
    id: "t4",
    title: "10-Minute Walk in Nature",
    description: "Step outside for a short walk. Nature exposure reduces cortisol levels and improves mood significantly.",
    category: "Movement",
    minStressLevel: 1,
    maxStressLevel: 6,
    durationMinutes: 10,
    icon: "Footprints",
  },
  {
    id: "t5",
    title: "Progressive Muscle Relaxation",
    description: "Tense and relax each muscle group from your toes to your head. This technique reduces physical tension held in the body.",
    category: "Relaxation",
    minStressLevel: 4,
    maxStressLevel: 10,
    durationMinutes: 15,
    icon: "Activity",
  },
  {
    id: "t6",
    title: "Cold Water Face Splash",
    description: "Splash cold water on your face or hold ice cubes. This activates the dive reflex, immediately slowing your heart rate.",
    category: "Grounding",
    minStressLevel: 6,
    maxStressLevel: 10,
    durationMinutes: 2,
    icon: "Droplets",
  },
  {
    id: "t7",
    title: "5-4-3-2-1 Grounding Technique",
    description: "Name 5 things you see, 4 you can touch, 3 you hear, 2 you smell, 1 you taste. This anchors you to the present moment.",
    category: "Grounding",
    minStressLevel: 5,
    maxStressLevel: 10,
    durationMinutes: 5,
    icon: "Target",
  },
  {
    id: "t8",
    title: "Call a Trusted Friend",
    description: "Reach out to someone who makes you feel safe. Social connection is one of the most powerful stress buffers available.",
    category: "Connection",
    minStressLevel: 3,
    maxStressLevel: 8,
    durationMinutes: 15,
    icon: "Phone",
  },
  {
    id: "t9",
    title: "Gentle Yoga Stretch",
    description: "Do gentle neck rolls, shoulder stretches, and forward folds to release stress stored in your muscles.",
    category: "Movement",
    minStressLevel: 2,
    maxStressLevel: 7,
    durationMinutes: 10,
    icon: "PersonStanding",
  },
  {
    id: "t10",
    title: "Write Your Worries Down",
    description: "Spend 10 minutes writing every worry on paper. Research shows externalizing anxiety reduces its psychological load.",
    category: "Journaling",
    minStressLevel: 5,
    maxStressLevel: 10,
    durationMinutes: 10,
    icon: "PenLine",
  },
  {
    id: "t11",
    title: "Listen to Calming Music",
    description: "Put on slow, instrumental music (60-80 BPM). Music at this tempo synchronizes with your heart rate to induce calm.",
    category: "Relaxation",
    minStressLevel: 1,
    maxStressLevel: 8,
    durationMinutes: 15,
    icon: "Music",
  },
  {
    id: "t12",
    title: "Emergency Calm Protocol",
    description: "Sit down, close eyes, press your feet flat on the floor, take 10 slow breaths, and say 'I am safe right now' with each exhale.",
    category: "Crisis",
    minStressLevel: 8,
    maxStressLevel: 10,
    durationMinutes: 5,
    icon: "ShieldAlert",
  },
];

const VIDEOS_SEED: Video[] = [
  {
    id: "v1",
    title: "5-Minute Meditation for Beginners",
    description: "A gentle guided meditation perfect for calming a busy mind. No experience required.",
    youtubeId: "inpok4MKVLM",
    thumbnail: "https://img.youtube.com/vi/inpok4MKVLM/mqdefault.jpg",
    category: "Meditation",
    minStressLevel: 1,
    maxStressLevel: 5,
    durationMinutes: 5,
  },
  {
    id: "v2",
    title: "10-Minute Deep Breathing for Stress Relief",
    description: "Follow along breathing exercises that activate your body's natural relaxation response.",
    youtubeId: "odADwWzHR24",
    thumbnail: "https://img.youtube.com/vi/odADwWzHR24/mqdefault.jpg",
    category: "Breathing",
    minStressLevel: 3,
    maxStressLevel: 8,
    durationMinutes: 10,
  },
  {
    id: "v3",
    title: "Yoga for Stress & Anxiety Relief",
    description: "Gentle yoga flow specifically designed to release tension and calm the nervous system.",
    youtubeId: "hJbRpHZr_d0",
    thumbnail: "https://img.youtube.com/vi/hJbRpHZr_d0/mqdefault.jpg",
    category: "Yoga",
    minStressLevel: 2,
    maxStressLevel: 7,
    durationMinutes: 20,
  },
  {
    id: "v4",
    title: "Progressive Muscle Relaxation Guided",
    description: "A full body progressive muscle relaxation session to release physical stress.",
    youtubeId: "1nZEdqcGVzo",
    thumbnail: "https://img.youtube.com/vi/1nZEdqcGVzo/mqdefault.jpg",
    category: "Relaxation",
    minStressLevel: 4,
    maxStressLevel: 10,
    durationMinutes: 15,
  },
  {
    id: "v5",
    title: "Nature Sounds for Deep Relaxation",
    description: "Forest rain and birdsong ambient sounds to create a peaceful mental retreat.",
    youtubeId: "q76bMs-NwRk",
    thumbnail: "https://img.youtube.com/vi/q76bMs-NwRk/mqdefault.jpg",
    category: "Ambient",
    minStressLevel: 1,
    maxStressLevel: 6,
    durationMinutes: 60,
  },
  {
    id: "v6",
    title: "How to Stop Overthinking",
    description: "Practical, science-backed strategies to quiet the anxious mind and break the worry cycle.",
    youtubeId: "c7Av_VVCxn8",
    thumbnail: "https://img.youtube.com/vi/c7Av_VVCxn8/mqdefault.jpg",
    category: "Education",
    minStressLevel: 5,
    maxStressLevel: 9,
    durationMinutes: 12,
  },
  {
    id: "v7",
    title: "Body Scan Meditation for Sleep",
    description: "A soothing body scan to release tension before sleep and end a stressful day peacefully.",
    youtubeId: "zd7dETVurTk",
    thumbnail: "https://img.youtube.com/vi/zd7dETVurTk/mqdefault.jpg",
    category: "Sleep",
    minStressLevel: 1,
    maxStressLevel: 8,
    durationMinutes: 20,
  },
  {
    id: "v8",
    title: "Emergency Anxiety Relief Techniques",
    description: "Quick techniques for when anxiety feels overwhelming — grounding, breathing, and self-talk.",
    youtubeId: "O-6f5wQXSu8",
    thumbnail: "https://img.youtube.com/vi/O-6f5wQXSu8/mqdefault.jpg",
    category: "Crisis Support",
    minStressLevel: 7,
    maxStressLevel: 10,
    durationMinutes: 8,
  },
  {
    id: "v9",
    title: "Mindful Morning Routine for Low Stress Days",
    description: "A gentle morning ritual to start your day with intention and calm energy.",
    youtubeId: "U9cGdRNMdT8",
    thumbnail: "https://img.youtube.com/vi/U9cGdRNMdT8/mqdefault.jpg",
    category: "Routine",
    minStressLevel: 1,
    maxStressLevel: 4,
    durationMinutes: 10,
  },
  {
    id: "v10",
    title: "ASMR Calm Rain & Soft Music",
    description: "Soothing ASMR sounds with gentle music to ease tension and promote relaxation.",
    youtubeId: "2XvzFuWh96Y",
    thumbnail: "https://img.youtube.com/vi/2XvzFuWh96Y/mqdefault.jpg",
    category: "ASMR",
    minStressLevel: 1,
    maxStressLevel: 5,
    durationMinutes: 45,
  },
];

export class MemStorage implements IStorage {
  private users: Map<string, User> = new Map();
  private stressEntries: Map<string, StressEntry> = new Map();
  private chatMessages: Map<string, ChatMessage> = new Map();
  private tasks: Map<string, Task> = new Map();
  private videos: Map<string, Video> = new Map();
  private taskCompletions: Map<string, UserTaskCompletion> = new Map();

  constructor() {
    TASKS_SEED.forEach(t => this.tasks.set(t.id, t));
    VIDEOS_SEED.forEach(v => this.videos.set(v.id, v));
    this.seedStressEntries();
  }

  private seedStressEntries() {
    const today = new Date();
    const sampleData = [
      { daysAgo: 6, level: 3, mood: "Calm", notes: "Good morning routine" },
      { daysAgo: 5, level: 5, mood: "Neutral", notes: "Busy day at work" },
      { daysAgo: 4, level: 7, mood: "Anxious", notes: "Deadline pressure" },
      { daysAgo: 3, level: 8, mood: "Stressed", notes: "Too many tasks at once" },
      { daysAgo: 2, level: 6, mood: "Tired", notes: "Starting to wind down" },
      { daysAgo: 1, level: 4, mood: "Hopeful", notes: "Meditation helped a lot" },
      { daysAgo: 0, level: 3, mood: "Peaceful", notes: "Feeling better today" },
    ];

    sampleData.forEach(({ daysAgo, level, mood, notes }) => {
      const date = new Date(today);
      date.setDate(date.getDate() - daysAgo);
      const dateStr = date.toISOString().split("T")[0];
      const id = randomUUID();
      const entry: StressEntry = {
        id,
        date: dateStr,
        level,
        mood,
        notes: notes ?? null,
        createdAt: date,
      };
      this.stressEntries.set(id, entry);
    });
  }

  async getUser(id: string) { return this.users.get(id); }
  async getUserByUsername(username: string) {
    return Array.from(this.users.values()).find(u => u.username === username);
  }
  async createUser(u: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...u, id };
    this.users.set(id, user);
    return user;
  }

  async getStressEntries(): Promise<StressEntry[]> {
    return Array.from(this.stressEntries.values()).sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );
  }

  async createStressEntry(entry: InsertStressEntry): Promise<StressEntry> {
    const id = randomUUID();
    const newEntry: StressEntry = { ...entry, id, notes: entry.notes ?? null, createdAt: new Date() };
    this.stressEntries.set(id, newEntry);
    return newEntry;
  }

  async deleteStressEntry(id: string): Promise<void> {
    this.stressEntries.delete(id);
  }

  async getChatMessages(sessionId: string): Promise<ChatMessage[]> {
    return Array.from(this.chatMessages.values())
      .filter(m => m.sessionId === sessionId)
      .sort((a, b) => new Date(a.timestamp!).getTime() - new Date(b.timestamp!).getTime());
  }

  async createChatMessage(msg: InsertChatMessage): Promise<ChatMessage> {
    const id = randomUUID();
    const newMsg: ChatMessage = { ...msg, id, timestamp: new Date() };
    this.chatMessages.set(id, newMsg);
    return newMsg;
  }

  async clearChatSession(sessionId: string): Promise<void> {
    Array.from(this.chatMessages.entries()).forEach(([id, msg]) => {
      if (msg.sessionId === sessionId) this.chatMessages.delete(id);
    });
  }

  async getTasks(): Promise<Task[]> {
    return Array.from(this.tasks.values());
  }

  async getTasksByStressLevel(level: number): Promise<Task[]> {
    return Array.from(this.tasks.values()).filter(
      t => level >= t.minStressLevel && level <= t.maxStressLevel
    );
  }

  async getVideos(): Promise<Video[]> {
    return Array.from(this.videos.values());
  }

  async getVideosByStressLevel(level: number): Promise<Video[]> {
    return Array.from(this.videos.values()).filter(
      v => level >= v.minStressLevel && level <= v.maxStressLevel
    );
  }

  async getTaskCompletions(): Promise<UserTaskCompletion[]> {
    return Array.from(this.taskCompletions.values());
  }

  async completeTask(taskId: string): Promise<UserTaskCompletion> {
    const id = randomUUID();
    const completion: UserTaskCompletion = { id, taskId, completedAt: new Date() };
    this.taskCompletions.set(taskId, completion);
    return completion;
  }

  async uncompleteTask(taskId: string): Promise<void> {
    this.taskCompletions.delete(taskId);
  }
}

export const storage = new MemStorage();
