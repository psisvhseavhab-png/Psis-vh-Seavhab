import { 
  collection, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  query, 
  orderBy, 
  onSnapshot 
} from 'firebase/firestore';
import { getDb, OperationType, handleFirestoreError } from '../lib/firebase';
import { WebsiteEvent, NewsPost } from '../types';

const EVENTS_COLLECTION = 'website_events';
const NEWS_COLLECTION = 'website_news';
const GALLERY_COLLECTION = 'website_gallery';

export interface GalleryItem {
  id?: string;
  url: string;
  description?: string;
  createdAt: string;
  isPublic: boolean;
  eventId?: string;
  authorName?: string;
  category?: string;
}

export const websiteService = {
  // Events
  async getEvents(): Promise<WebsiteEvent[]> {
    const db = await getDb();
    if (!db) return [];
    try {
      const q = query(collection(db, EVENTS_COLLECTION));
      const snapshot = await getDocs(q);
      const events = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as WebsiteEvent));
      return events.sort((a, b) => (a.date || '').localeCompare(b.date || ''));
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, EVENTS_COLLECTION);
      return [];
    }
  },

  subscribeToEvents(callback: (events: WebsiteEvent[]) => void) {
    let unsubscribe = () => {};
    getDb().then(db => {
      if (!db) return;
      const q = query(collection(db, EVENTS_COLLECTION));
      unsubscribe = onSnapshot(q, (snapshot) => {
        const events = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as WebsiteEvent));
        callback(events.sort((a, b) => (a.date || '').localeCompare(b.date || '')));
      }, (error) => {
        handleFirestoreError(error, OperationType.LIST, EVENTS_COLLECTION);
      });
    });
    return () => unsubscribe();
  },

  async addEvent(event: Omit<WebsiteEvent, 'id'>) {
    const db = await getDb();
    if (!db) return;
    try {
      return await addDoc(collection(db, EVENTS_COLLECTION), event);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, EVENTS_COLLECTION);
    }
  },

  async updateEvent(id: string, event: Partial<WebsiteEvent>) {
    const db = await getDb();
    if (!db) return;
    try {
      const docRef = doc(db, EVENTS_COLLECTION, id);
      return await updateDoc(docRef, event);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, EVENTS_COLLECTION);
    }
  },

  async deleteEvent(id: string) {
    const db = await getDb();
    if (!db) return;
    try {
      const docRef = doc(db, EVENTS_COLLECTION, id);
      return await deleteDoc(docRef);
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, EVENTS_COLLECTION);
    }
  },

  // News
  async getNews(): Promise<NewsPost[]> {
    const db = await getDb();
    if (!db) return [];
    try {
      const q = query(collection(db, NEWS_COLLECTION));
      const snapshot = await getDocs(q);
      const news = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as NewsPost));
      return news.sort((a, b) => (b.publishedAt || '').localeCompare(a.publishedAt || ''));
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, NEWS_COLLECTION);
      return [];
    }
  },

  subscribeToNews(callback: (news: NewsPost[]) => void) {
    let unsubscribe = () => {};
    getDb().then(db => {
      if (!db) return;
      const q = query(collection(db, NEWS_COLLECTION));
      unsubscribe = onSnapshot(q, (snapshot) => {
        const news = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as NewsPost));
        callback(news.sort((a, b) => (b.publishedAt || '').localeCompare(a.publishedAt || '')));
      }, (error) => {
        handleFirestoreError(error, OperationType.LIST, NEWS_COLLECTION);
      });
    });
    return () => unsubscribe();
  },

  async addNews(news: Omit<NewsPost, 'id'>) {
    const db = await getDb();
    if (!db) return;
    try {
      return await addDoc(collection(db, NEWS_COLLECTION), news);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, NEWS_COLLECTION);
    }
  },

  async deleteNews(id: string) {
    const db = await getDb();
    if (!db) return;
    try {
      const docRef = doc(db, NEWS_COLLECTION, id);
      return await deleteDoc(docRef);
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, NEWS_COLLECTION);
    }
  },

  // Gallery
  async getGallery(): Promise<GalleryItem[]> {
    const db = await getDb();
    if (!db) return [];
    try {
      const q = query(collection(db, GALLERY_COLLECTION));
      const snapshot = await getDocs(q);
      const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as GalleryItem));
      return items.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, GALLERY_COLLECTION);
      return [];
    }
  },

  async addGalleryItem(item: Omit<GalleryItem, 'id'>) {
    const db = await getDb();
    if (!db) return;
    try {
      return await addDoc(collection(db, GALLERY_COLLECTION), {
        ...item,
        isPublic: item.isPublic ?? false,
        category: item.category || 'General'
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, GALLERY_COLLECTION);
    }
  },

  async updateGalleryItem(id: string, item: Partial<GalleryItem>) {
    const db = await getDb();
    if (!db) return;
    try {
      const docRef = doc(db, GALLERY_COLLECTION, id);
      return await updateDoc(docRef, item);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, GALLERY_COLLECTION);
    }
  },

  async deleteGalleryItem(id: string) {
    const db = await getDb();
    if (!db) return;
    try {
      const docRef = doc(db, GALLERY_COLLECTION, id);
      return await deleteDoc(docRef);
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, GALLERY_COLLECTION);
    }
  }
};
