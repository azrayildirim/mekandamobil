import { collection, getDocs, query, where, GeoPoint, DocumentData, addDoc, onSnapshot, doc, getDoc, updateDoc } from 'firebase/firestore';
import { ref, get, set, serverTimestamp } from 'firebase/database';
import { db, database } from '../config/firebase';
import { Place, Review, User } from '../types';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Sabitleri export et
export const PLACES_COLLECTION = 'places';
export const LAST_CONFIRM_KEY = 'lastPlaceConfirm';
export const ACTIVE_PLACE_KEY = 'activePlaceId';
export const CONFIRM_COOLDOWN = 30 * 60 * 1000; // 30 dakika

export const getNearbyPlaces = async (userLocation: { latitude: number; longitude: number }) => {
  try {
    const placesRef = collection(db, PLACES_COLLECTION);
    const placesSnapshot = await getDocs(placesRef);
    
    const places: Place[] = [];
    
    placesSnapshot.forEach((doc) => {
      const data = doc.data();
      const location = data.location as GeoPoint;
      
      places.push({
        id: doc.id,
        name: data.name,
        coordinate: {
          latitude: location.latitude,
          longitude: location.longitude
        },
        description: data.description,
        rating: data.rating,
        address: data.address,
        openingHours: data.openingHours,
        photos: data.photos || [],
        reviews: data.reviews || [],
        users: data.activeUsers || []
      });
    });

    return places;
  } catch (error) {
    console.error('Error fetching nearby places:', error);
    throw error;
  }
};

// Gerçek zamanlı mekan güncellemeleri için
export const subscribePlaces = (
  onPlacesUpdate: (places: Place[]) => void,
  onError: (error: Error) => void
) => {
  const placesRef = collection(db, PLACES_COLLECTION);
  
  return onSnapshot(
    placesRef,
    (snapshot) => {
      const places: Place[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        const location = data.location as GeoPoint;
        
        places.push({
          id: doc.id,
          name: data.name,
          coordinate: {
            latitude: location.latitude,
            longitude: location.longitude
          },
          description: data.description,
          rating: data.rating,
          address: data.address,
          openingHours: data.openingHours,
          photos: data.photos || [],
          reviews: data.reviews || [],
          users: data.activeUsers || []
        });
      });
      onPlacesUpdate(places);
    },
    onError
  );
};

export const getPlaceDetails = async (placeId: string) => {
  try {
    const placeDoc = await getDoc(doc(db, 'places', placeId));
    if (!placeDoc.exists()) throw new Error('Place not found');

    // Aktif kullanıcıları RTDB'den al
    const activeUsersSnapshot = await get(ref(database, `places/${placeId}/activeUsers`));
    const activeUsers = activeUsersSnapshot.val() || {};

    return {
      id: placeDoc.id,
      ...placeDoc.data(),
      activeUsers: Object.values(activeUsers)
    };
  } catch (error) {
    console.error('Error fetching place details:', error);
    throw error;
  }
};

export const updateActivePlaceUsers = async (placeId: string, userId: string, isEntering: boolean) => {
  try {
    const userStatusRef = ref(database, `places/${placeId}/activeUsers/${userId}`);
    
    if (isEntering) {
      await set(userStatusRef, {
        id: userId,
        timestamp: serverTimestamp()
      });
    } else {
      await set(userStatusRef, null);
    }
  } catch (error) {
    console.error('Error updating active users:', error);
    throw error;
  }
};

export const addPlace = async (placeData: Omit<Place, 'id'>) => {
  try {
    const docRef = await addDoc(collection(db, PLACES_COLLECTION), {
      ...placeData,
      location: new GeoPoint(
        placeData.coordinate.latitude,
        placeData.coordinate.longitude
      ),
      createdAt: new Date(),
    });
    
    return docRef.id;
  } catch (error) {
    console.error('Error adding place:', error);
    throw error;
  }
};

// Mesafe hesaplama fonksiyonu (Haversine formülü)
const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 6371e3; // Dünya'nın yarıçapı (metre)
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // metre cinsinden mesafe
};

// Kullanıcıları kontrol eden ve güncelleyen fonksiyon
export const updateUserLocation = async (
  userId: string,
  userLocation: { latitude: number; longitude: number }
) => {
  try {
    const lastConfirmStr = await AsyncStorage.getItem(LAST_CONFIRM_KEY);
    const activePlaceId = await AsyncStorage.getItem(ACTIVE_PLACE_KEY);
    const lastConfirmTime = lastConfirmStr ? parseInt(lastConfirmStr) : 0;
    const now = Date.now();

    // Eğer son teyitten bu yana 30 dakika geçmediyse teyit isteme
    if (activePlaceId && (now - lastConfirmTime) < CONFIRM_COOLDOWN) {
      return [];
    }

    const placesRef = collection(db, PLACES_COLLECTION);
    const placesSnapshot = await getDocs(placesRef);
    
    const nearbyPlaces: { id: string; name: string }[] = [];
    const userPlaces: string[] = [];
    
    placesSnapshot.forEach((doc) => {
      const place = doc.data();
      const placeLocation = place.location as GeoPoint;
      
      const distance = calculateDistance(
        userLocation.latitude,
        userLocation.longitude,
        placeLocation.latitude,
        placeLocation.longitude
      );

      if (distance <= 100) {
        nearbyPlaces.push({ 
          id: doc.id, 
          name: place.name 
        });
        userPlaces.push(doc.id);
      }
    });

    // Kullanıcı aktif mekandan çıktıysa
    if (activePlaceId && !userPlaces.includes(activePlaceId)) {
      await updateActivePlaceUsers(activePlaceId, userId, false);
      await AsyncStorage.removeItem(ACTIVE_PLACE_KEY);
      await AsyncStorage.removeItem(LAST_CONFIRM_KEY);
    }

    return nearbyPlaces;
  } catch (error) {
    console.error('Error checking nearby places:', error);
    throw error;
  }
}; 