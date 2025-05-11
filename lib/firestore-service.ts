import {
  collection,
  addDoc,
  updateDoc,
  doc,
  getDocs,
  query,
  where,
  orderBy,
  deleteDoc,
} from 'firebase/firestore';
import { clientDb } from './firebase';
import { ChatSession, Message } from './types';

// Chat Sessions
export async function createChatSession(
  userId: string,
  title: string = 'New Chat'
): Promise<string> {
  const sessionData = {
    userId,
    title,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  const docRef = await addDoc(
    collection(clientDb, 'chatSessions'),
    sessionData
  );
  return docRef.id;
}

export async function updateChatSession(
  sessionId: string,
  data: Partial<ChatSession>
): Promise<void> {
  const sessionRef = doc(clientDb, 'chatSessions', sessionId);
  await updateDoc(sessionRef, { ...data, updatedAt: Date.now() });
}

export async function getUserChatSessions(
  userId: string
): Promise<ChatSession[]> {
  const sessionsQuery = query(
    collection(clientDb, 'chatSessions'),
    where('userId', '==', userId),
    orderBy('updatedAt', 'desc')
  );

  const snapshot = await getDocs(sessionsQuery);
  return snapshot.docs.map(
    (doc) => ({ id: doc.id, ...doc.data() } as ChatSession)
  );
}

export async function deleteChatSession(sessionId: string): Promise<void> {
  await deleteDoc(doc(clientDb, 'chatSessions', sessionId));

  // Also delete all messages for this session
  const messagesQuery = query(
    collection(clientDb, 'messages'),
    where('sessionId', '==', sessionId)
  );

  const snapshot = await getDocs(messagesQuery);
  const deletePromises = snapshot.docs.map((doc) => deleteDoc(doc.ref));
  await Promise.all(deletePromises);
}

// Messages
export async function addMessageToSession(
  sessionId: string,
  message: Omit<Message, 'id'>
): Promise<string> {
  const messageData = {
    ...message,
    sessionId,
  };

  const docRef = await addDoc(collection(clientDb, 'messages'), messageData);

  // Update the session's updatedAt timestamp
  await updateChatSession(sessionId, { updatedAt: Date.now() });

  return docRef.id;
}

export async function getSessionMessages(
  sessionId: string
): Promise<Message[]> {
  const messagesQuery = query(
    collection(clientDb, 'messages'),
    where('sessionId', '==', sessionId),
    orderBy('timestamp', 'asc')
  );

  const snapshot = await getDocs(messagesQuery);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Message));
}
