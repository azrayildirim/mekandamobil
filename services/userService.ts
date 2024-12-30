import { doc, setDoc, updateDoc, collection, getDocs, writeBatch } from 'firebase/firestore';
import { db } from '../config/firebase';

interface UserData {
  id: string;
  email: string;
  name: string;
  photoURL: string;
  status: string;
  lastSeen: string;
  allowMessages: boolean;
  isOnline: boolean;
}

export const createUser = async (userData: UserData) => {
  try {
    await setDoc(doc(db, 'users', userData.id), userData);
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
};

export const updateUser = async (userId: string, userData: {
  name?: string;
  photoURL?: string;
  status?: string;
}) => {
  try {
    // Kullanıcı bilgilerini güncelle
    await updateDoc(doc(db, 'users', userId), userData);

    // Kullanıcının aktif olduğu tüm mekanları bul
    const placesRef = collection(db, 'places');
    const placesSnapshot = await getDocs(placesRef);

    // Her mekanı kontrol et ve kullanıcı bilgilerini güncelle
    const batch = writeBatch(db);
    
    placesSnapshot.forEach((doc) => {
      const place = doc.data();
      const activeUsers = place.activeUsers || [];
      const userIndex = activeUsers.findIndex((u: any) => u.id === userId);

      if (userIndex !== -1) {
        // Kullanıcı bu mekanda aktif, bilgilerini güncelle
        activeUsers[userIndex] = {
          ...activeUsers[userIndex],
          ...userData,
          lastSeen: new Date().toISOString()
        };

        batch.update(doc.ref, { activeUsers });
      }
    });

    await batch.commit();
  } catch (error) {
    console.error('Error updating user:', error);
    throw error;
  }
}; 