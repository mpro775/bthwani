// src/middleware/verifyTokenSocket.ts
import { Socket } from 'socket.io';
import admin from 'firebase-admin';

export async function verifyTokenSocket(socket: Socket, next: (err?: any) => void) {
  try {
    const token = socket.handshake.auth.token as string;
    if (!token) throw new Error('No Firebase token');

    // هذا يعيد الـUID وبيانات المستخدم من Firebase
    const decoded = await admin.auth().verifyIdToken(token);
    socket.data.uid = decoded.uid;
    return next();
  } catch (err) {
    return next(new Error('Unauthorized'));
  }
}
