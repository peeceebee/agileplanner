import { sprintItems, users, type SprintItem, type InsertSprintItem, type User, type InsertUser } from "@shared/schema";

export interface IStorage {
  // Sprint Items
  getSprintItems(): Promise<SprintItem[]>;
  getSprintItem(id: number): Promise<SprintItem | undefined>;
  createSprintItem(item: InsertSprintItem): Promise<SprintItem>;
  updateSprintItem(id: number, updates: Partial<InsertSprintItem>): Promise<SprintItem | undefined>;
  deleteSprintItem(id: number): Promise<boolean>;
  
  // Users
  getUsers(): Promise<User[]>;
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
}

export class MemStorage implements IStorage {
  private sprintItems: Map<number, SprintItem>;
  private users: Map<number, User>;
  private currentSprintItemId: number;
  private currentUserId: number;

  constructor() {
    this.sprintItems = new Map();
    this.users = new Map();
    this.currentSprintItemId = 1;
    this.currentUserId = 1;
    
    // Initialize with some default users
    this.initializeDefaultUsers();
  }

  private initializeDefaultUsers() {
    const defaultUsers: InsertUser[] = [
      { username: "john", name: "John Doe", initials: "JD" },
      { username: "jane", name: "Jane Smith", initials: "JS" },
      { username: "bob", name: "Bob Johnson", initials: "BJ" },
    ];

    for (const user of defaultUsers) {
      this.createUser(user);
    }
  }

  private generateItemId(): string {
    return `SI-${String(this.currentSprintItemId).padStart(3, '0')}`;
  }

  // Sprint Items
  async getSprintItems(): Promise<SprintItem[]> {
    return Array.from(this.sprintItems.values());
  }

  async getSprintItem(id: number): Promise<SprintItem | undefined> {
    return this.sprintItems.get(id);
  }

  async createSprintItem(insertItem: InsertSprintItem): Promise<SprintItem> {
    const id = this.currentSprintItemId++;
    const itemId = this.generateItemId();
    const now = new Date();
    
    const item: SprintItem = {
      id,
      itemId,
      createDate: now,
      ...insertItem,
    };

    this.sprintItems.set(id, item);
    return item;
  }

  async updateSprintItem(id: number, updates: Partial<InsertSprintItem>): Promise<SprintItem | undefined> {
    const existingItem = this.sprintItems.get(id);
    if (!existingItem) return undefined;

    const now = new Date();
    let updatedItem = { ...existingItem, ...updates };

    // Auto-update dates based on status changes
    if (updates.status) {
      if (updates.status === "complete" && existingItem.status !== "complete") {
        updatedItem.actualCompleteDate = now;
        updatedItem.doneDate = now;
      } else if (updates.status === "in-progress" && existingItem.status === "new") {
        updatedItem.startDate = now;
      }
    }

    // Auto-update ready date based on refinement status
    if (updates.refinementStatus === "refined" && existingItem.refinementStatus !== "refined") {
      updatedItem.readyDate = now;
    }

    this.sprintItems.set(id, updatedItem);
    return updatedItem;
  }

  async deleteSprintItem(id: number): Promise<boolean> {
    return this.sprintItems.delete(id);
  }

  // Users
  async getUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { id, ...insertUser };
    this.users.set(id, user);
    return user;
  }
}

export const storage = new MemStorage();
