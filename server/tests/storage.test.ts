import { describe, it, expect, beforeEach } from 'vitest';
import { MemStorage } from '../storage';
import type { InsertSprintItem, InsertUser } from '@shared/schema';

describe('MemStorage', () => {
  let storage: MemStorage;

  beforeEach(() => {
    storage = new MemStorage();
  });

  describe('Sprint Items', () => {
    describe('getSprintItems', () => {
      it('should return empty array initially', async () => {
        const items = await storage.getSprintItems();
        expect(items).toEqual([]);
      });

      it('should return all created sprint items', async () => {
        const insertItem1: InsertSprintItem = {
          title: 'Test Item 1',
          description: 'Description 1',
          status: 'new'
        };
        const insertItem2: InsertSprintItem = {
          title: 'Test Item 2',
          description: 'Description 2', 
          status: 'in-progress'
        };

        await storage.createSprintItem(insertItem1);
        await storage.createSprintItem(insertItem2);

        const items = await storage.getSprintItems();
        expect(items).toHaveLength(2);
        expect(items[0].title).toBe('Test Item 1');
        expect(items[1].title).toBe('Test Item 2');
      });
    });

    describe('getSprintItem', () => {
      it('should return undefined for non-existent item', async () => {
        const item = await storage.getSprintItem(999);
        expect(item).toBeUndefined();
      });

      it('should return the correct item by id', async () => {
        const insertItem: InsertSprintItem = {
          title: 'Test Item',
          description: 'Test Description',
          status: 'new'
        };

        const createdItem = await storage.createSprintItem(insertItem);
        const retrievedItem = await storage.getSprintItem(createdItem.id);

        expect(retrievedItem).toBeDefined();
        expect(retrievedItem?.title).toBe('Test Item');
        expect(retrievedItem?.id).toBe(createdItem.id);
      });
    });

    describe('createSprintItem', () => {
      it('should create a sprint item with all required fields', async () => {
        const insertItem: InsertSprintItem = {
          title: 'New Sprint Item',
          description: 'Item description',
          status: 'new',
          refinementStatus: 'none',
          assignedUser: 'john',
          sprintNumber: 1,
          hoursOfEffort: 8,
          points: 3
        };

        const createdItem = await storage.createSprintItem(insertItem);

        expect(createdItem.id).toBeGreaterThan(0);
        expect(createdItem.itemId).toMatch(/^SI-\d{3}$/);
        expect(createdItem.title).toBe('New Sprint Item');
        expect(createdItem.description).toBe('Item description');
        expect(createdItem.status).toBe('new');
        expect(createdItem.refinementStatus).toBe('none');
        expect(createdItem.assignedUser).toBe('john');
        expect(createdItem.sprintNumber).toBe(1);
        expect(createdItem.hoursOfEffort).toBe(8);
        expect(createdItem.points).toBe(3);
        expect(createdItem.createDate).toBeInstanceOf(Date);
      });

      it('should generate sequential item IDs', async () => {
        const insertItem: InsertSprintItem = {
          title: 'Test Item',
          status: 'new'
        };

        const item1 = await storage.createSprintItem(insertItem);
        const item2 = await storage.createSprintItem(insertItem);
        const item3 = await storage.createSprintItem(insertItem);

        expect(item1.itemId).toMatch(/^SI-\d{3}$/);
        expect(item2.itemId).toMatch(/^SI-\d{3}$/);
        expect(item3.itemId).toMatch(/^SI-\d{3}$/);
        expect(item2.id).toBe(item1.id + 1);
        expect(item3.id).toBe(item2.id + 1);
        
        // Ensure itemIds are sequential
        const item1Num = parseInt(item1.itemId.split('-')[1]);
        const item2Num = parseInt(item2.itemId.split('-')[1]);
        const item3Num = parseInt(item3.itemId.split('-')[1]);
        expect(item2Num).toBe(item1Num + 1);
        expect(item3Num).toBe(item2Num + 1);
      });

      it('should create item with minimal required fields', async () => {
        const insertItem: InsertSprintItem = {
          title: 'Minimal Item',
          status: 'new'
        };

        const createdItem = await storage.createSprintItem(insertItem);

        expect(createdItem.title).toBe('Minimal Item');
        expect(createdItem.status).toBe('new');
        expect(createdItem.id).toBeGreaterThan(0);
        expect(createdItem.itemId).toMatch(/^SI-\d{3}$/);
        expect(createdItem.createDate).toBeInstanceOf(Date);
      });
    });

    describe('updateSprintItem', () => {
      it('should return undefined for non-existent item', async () => {
        const updatedItem = await storage.updateSprintItem(999, { title: 'Updated' });
        expect(updatedItem).toBeUndefined();
      });

      it('should update existing item fields', async () => {
        const insertItem: InsertSprintItem = {
          title: 'Original Title',
          description: 'Original Description',
          status: 'new',
          points: 2
        };

        const createdItem = await storage.createSprintItem(insertItem);
        const updates = {
          title: 'Updated Title',
          description: 'Updated Description',
          points: 5
        };

        const updatedItem = await storage.updateSprintItem(createdItem.id, updates);

        expect(updatedItem).toBeDefined();
        expect(updatedItem?.title).toBe('Updated Title');
        expect(updatedItem?.description).toBe('Updated Description');
        expect(updatedItem?.points).toBe(5);
        expect(updatedItem?.status).toBe('new'); // unchanged
      });

      it('should auto-update actualCompleteDate and doneDate when status changes to complete', async () => {
        const insertItem: InsertSprintItem = {
          title: 'Test Item',
          status: 'in-progress'
        };

        const createdItem = await storage.createSprintItem(insertItem);
        const beforeUpdate = new Date();
        
        const updatedItem = await storage.updateSprintItem(createdItem.id, { status: 'complete' });
        const afterUpdate = new Date();

        expect(updatedItem).toBeDefined();
        expect(updatedItem?.status).toBe('complete');
        expect(updatedItem?.actualCompleteDate).toBeInstanceOf(Date);
        expect(updatedItem?.doneDate).toBeInstanceOf(Date);
        expect(updatedItem?.actualCompleteDate!.getTime()).toBeGreaterThanOrEqual(beforeUpdate.getTime());
        expect(updatedItem?.actualCompleteDate!.getTime()).toBeLessThanOrEqual(afterUpdate.getTime());
        expect(updatedItem?.doneDate).toEqual(updatedItem?.actualCompleteDate);
      });

      it('should not update completion dates if already complete', async () => {
        const insertItem: InsertSprintItem = {
          title: 'Test Item',
          status: 'complete'
        };

        const createdItem = await storage.createSprintItem(insertItem);
        const originalCompleteDate = new Date('2023-01-01');
        const originalDoneDate = new Date('2023-01-02');
        
        // Manually set dates to test they don't get overwritten
        await storage.updateSprintItem(createdItem.id, { 
          actualCompleteDate: originalCompleteDate,
          doneDate: originalDoneDate 
        });

        const updatedItem = await storage.updateSprintItem(createdItem.id, { status: 'complete' });

        expect(updatedItem?.actualCompleteDate).toEqual(originalCompleteDate);
        expect(updatedItem?.doneDate).toEqual(originalDoneDate);
      });

      it('should auto-update startDate when status changes from new to in-progress', async () => {
        const insertItem: InsertSprintItem = {
          title: 'Test Item',
          status: 'new'
        };

        const createdItem = await storage.createSprintItem(insertItem);
        const beforeUpdate = new Date();
        
        const updatedItem = await storage.updateSprintItem(createdItem.id, { status: 'in-progress' });
        const afterUpdate = new Date();

        expect(updatedItem).toBeDefined();
        expect(updatedItem?.status).toBe('in-progress');
        expect(updatedItem?.startDate).toBeInstanceOf(Date);
        expect(updatedItem?.startDate!.getTime()).toBeGreaterThanOrEqual(beforeUpdate.getTime());
        expect(updatedItem?.startDate!.getTime()).toBeLessThanOrEqual(afterUpdate.getTime());
      });

      it('should not update startDate if not changing from new to in-progress', async () => {
        const insertItem: InsertSprintItem = {
          title: 'Test Item',
          status: 'in-progress'
        };

        const createdItem = await storage.createSprintItem(insertItem);
        const updatedItem = await storage.updateSprintItem(createdItem.id, { status: 'complete' });

        expect(updatedItem?.startDate).toBeUndefined();
      });

      it('should auto-update readyDate when refinementStatus changes to refined', async () => {
        const insertItem: InsertSprintItem = {
          title: 'Test Item',
          status: 'new',
          refinementStatus: 'drafting'
        };

        const createdItem = await storage.createSprintItem(insertItem);
        const beforeUpdate = new Date();
        
        const updatedItem = await storage.updateSprintItem(createdItem.id, { refinementStatus: 'refined' });
        const afterUpdate = new Date();

        expect(updatedItem).toBeDefined();
        expect(updatedItem?.refinementStatus).toBe('refined');
        expect(updatedItem?.readyDate).toBeInstanceOf(Date);
        expect(updatedItem?.readyDate!.getTime()).toBeGreaterThanOrEqual(beforeUpdate.getTime());
        expect(updatedItem?.readyDate!.getTime()).toBeLessThanOrEqual(afterUpdate.getTime());
      });

      it('should not update readyDate if already refined', async () => {
        const insertItem: InsertSprintItem = {
          title: 'Test Item',
          status: 'new',
          refinementStatus: 'refined'
        };

        const createdItem = await storage.createSprintItem(insertItem);
        const originalReadyDate = new Date('2023-01-01');
        
        // Manually set ready date
        await storage.updateSprintItem(createdItem.id, { readyDate: originalReadyDate });
        
        const updatedItem = await storage.updateSprintItem(createdItem.id, { refinementStatus: 'refined' });

        expect(updatedItem?.readyDate).toEqual(originalReadyDate);
      });
    });

    describe('deleteSprintItem', () => {
      it('should return false for non-existent item', async () => {
        const deleted = await storage.deleteSprintItem(999);
        expect(deleted).toBe(false);
      });

      it('should delete existing item and return true', async () => {
        const insertItem: InsertSprintItem = {
          title: 'Test Item',
          status: 'new'
        };

        const createdItem = await storage.createSprintItem(insertItem);
        const deleted = await storage.deleteSprintItem(createdItem.id);

        expect(deleted).toBe(true);
        
        const retrievedItem = await storage.getSprintItem(createdItem.id);
        expect(retrievedItem).toBeUndefined();
      });

      it('should not affect other items when deleting one', async () => {
        const insertItem1: InsertSprintItem = { title: 'Item 1', status: 'new' };
        const insertItem2: InsertSprintItem = { title: 'Item 2', status: 'new' };

        const item1 = await storage.createSprintItem(insertItem1);
        const item2 = await storage.createSprintItem(insertItem2);

        await storage.deleteSprintItem(item1.id);

        const remainingItems = await storage.getSprintItems();
        expect(remainingItems).toHaveLength(1);
        expect(remainingItems[0].id).toBe(item2.id);
      });
    });
  });

  describe('Users', () => {
    describe('getUsers', () => {
      it('should return default users initially', async () => {
        const users = await storage.getUsers();
        expect(users).toHaveLength(3);
        
        const usernames = users.map(u => u.username);
        expect(usernames).toContain('john');
        expect(usernames).toContain('jane');
        expect(usernames).toContain('bob');
      });

      it('should return all users including newly created ones', async () => {
        const newUser: InsertUser = {
          username: 'alice',
          name: 'Alice Cooper',
          initials: 'AC'
        };

        await storage.createUser(newUser);
        const users = await storage.getUsers();
        
        expect(users).toHaveLength(4);
        const alice = users.find(u => u.username === 'alice');
        expect(alice).toBeDefined();
        expect(alice?.name).toBe('Alice Cooper');
      });
    });

    describe('getUser', () => {
      it('should return undefined for non-existent user', async () => {
        const user = await storage.getUser(999);
        expect(user).toBeUndefined();
      });

      it('should return correct user by id', async () => {
        const users = await storage.getUsers();
        const johnUser = users.find(u => u.username === 'john');
        
        expect(johnUser).toBeDefined();
        const retrievedUser = await storage.getUser(johnUser!.id);
        
        expect(retrievedUser).toBeDefined();
        expect(retrievedUser?.username).toBe('john');
        expect(retrievedUser?.name).toBe('John Doe');
        expect(retrievedUser?.initials).toBe('JD');
      });
    });

    describe('getUserByUsername', () => {
      it('should return undefined for non-existent username', async () => {
        const user = await storage.getUserByUsername('nonexistent');
        expect(user).toBeUndefined();
      });

      it('should return correct user by username', async () => {
        const user = await storage.getUserByUsername('jane');
        
        expect(user).toBeDefined();
        expect(user?.username).toBe('jane');
        expect(user?.name).toBe('Jane Smith');
        expect(user?.initials).toBe('JS');
      });

      it('should return newly created user by username', async () => {
        const newUser: InsertUser = {
          username: 'charlie',
          name: 'Charlie Brown',
          initials: 'CB'
        };

        await storage.createUser(newUser);
        const user = await storage.getUserByUsername('charlie');
        
        expect(user).toBeDefined();
        expect(user?.name).toBe('Charlie Brown');
        expect(user?.initials).toBe('CB');
      });
    });

    describe('createUser', () => {
      it('should create user with all fields', async () => {
        const insertUser: InsertUser = {
          username: 'david',
          name: 'David Wilson',
          initials: 'DW'
        };

        const createdUser = await storage.createUser(insertUser);

        expect(createdUser.id).toBeDefined();
        expect(createdUser.username).toBe('david');
        expect(createdUser.name).toBe('David Wilson');
        expect(createdUser.initials).toBe('DW');
      });

      it('should generate sequential user IDs', async () => {
        const user1 = await storage.createUser({ username: 'user1', name: 'User One', initials: 'U1' });
        const user2 = await storage.createUser({ username: 'user2', name: 'User Two', initials: 'U2' });

        // IDs should be sequential
        expect(user2.id).toBe(user1.id + 1);
      });

      it('should store created user in storage', async () => {
        const insertUser: InsertUser = {
          username: 'emma',
          name: 'Emma Davis',
          initials: 'ED'
        };

        const createdUser = await storage.createUser(insertUser);
        const retrievedUser = await storage.getUser(createdUser.id);

        expect(retrievedUser).toEqual(createdUser);
      });
    });
  });

  describe('Integration Tests', () => {
    it('should handle multiple operations correctly', async () => {
      // Create users
      const user1 = await storage.createUser({ username: 'dev1', name: 'Developer One', initials: 'D1' });
      const user2 = await storage.createUser({ username: 'dev2', name: 'Developer Two', initials: 'D2' });

      // Create sprint items
      const item1 = await storage.createSprintItem({
        title: 'Feature A',
        description: 'Implement feature A',
        status: 'new',
        assignedUser: user1.username,
        sprintNumber: 1,
        points: 5
      });

      const item2 = await storage.createSprintItem({
        title: 'Bug Fix B',
        description: 'Fix critical bug B',
        status: 'new',
        assignedUser: user2.username,
        sprintNumber: 1,
        points: 3
      });

      // Update items through workflow
      await storage.updateSprintItem(item1.id, { refinementStatus: 'refined' });
      await storage.updateSprintItem(item1.id, { status: 'in-progress' });
      await storage.updateSprintItem(item1.id, { status: 'complete' });

      // Verify final state
      const finalItem = await storage.getSprintItem(item1.id);
      expect(finalItem?.status).toBe('complete');
      expect(finalItem?.refinementStatus).toBe('refined');
      expect(finalItem?.readyDate).toBeInstanceOf(Date);
      expect(finalItem?.startDate).toBeInstanceOf(Date);
      expect(finalItem?.actualCompleteDate).toBeInstanceOf(Date);
      expect(finalItem?.doneDate).toBeInstanceOf(Date);

      // Verify counts
      const allItems = await storage.getSprintItems();
      const allUsers = await storage.getUsers();
      expect(allItems).toHaveLength(2);
      expect(allUsers).toHaveLength(5); // 3 default + 2 created
    });
  });
});