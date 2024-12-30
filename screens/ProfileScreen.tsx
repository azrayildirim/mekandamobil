import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, TextInput, Alert } from 'react-native';
import { auth } from '../config/firebase';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { updateProfile } from 'firebase/auth';
import { uploadImage } from '../services/storageService';
import { updateUser } from '../services/userService';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { updateActivePlaceUsers, ACTIVE_PLACE_KEY, LAST_CONFIRM_KEY } from '../services/placesService';

type RootStackParamList = {
  NearbyPlaces: undefined;
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function ProfileScreen() {
  const navigation = useNavigation<NavigationProp>();
  const user = auth.currentUser;
  const [isEditing, setIsEditing] = useState(false);
  const [userData, setUserData] = useState({
    displayName: user?.displayName || '',
    status: 'Merhaba! Mekanda kullanıyorum.',
    photoURL: user?.photoURL || ''
  });

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert('Hata', 'Fotoğraf erişim izni gerekli');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (!result.canceled) {
      setUserData(prev => ({ ...prev, photoURL: result.assets[0].uri }));
    }
  };

  const handleSave = async () => {
    try {
      let photoURL = userData.photoURL;
      
      // Eğer yeni fotoğraf seçildiyse yükle
      if (userData.photoURL && userData.photoURL !== user?.photoURL) {
        photoURL = await uploadImage(userData.photoURL, 'profile-photos');
      }

      // Firebase Auth profilini güncelle
      await updateProfile(auth.currentUser!, {
        displayName: userData.displayName,
        photoURL
      });

      // Firestore'daki kullanıcı bilgilerini güncelle
      await updateUser(user!.uid, {
        name: userData.displayName,
        photoURL,
        status: userData.status
      });

      setIsEditing(false);
      Alert.alert('Başarılı', 'Profil bilgileriniz güncellendi');
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert('Hata', 'Profil güncellenirken bir hata oluştu');
    }
  };

  const handleSignOut = async () => {
    try {
      // Aktif mekan varsa çıkış yap
      const activePlaceId = await AsyncStorage.getItem(ACTIVE_PLACE_KEY);
      if (activePlaceId && auth.currentUser) {
        await updateActivePlaceUsers(activePlaceId, auth.currentUser.uid, false);
        await AsyncStorage.removeItem(ACTIVE_PLACE_KEY);
        await AsyncStorage.removeItem(LAST_CONFIRM_KEY);
      }

      // Firebase'den çıkış yap
      await auth.signOut();
      navigation.navigate('NearbyPlaces');
    } catch (error) {
      console.error('Error signing out:', error);
      Alert.alert('Hata', 'Çıkış yapılırken bir hata oluştu');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.profileHeader}>
        <TouchableOpacity onPress={pickImage} disabled={!isEditing}>
          {userData.photoURL ? (
            <Image source={{ uri: userData.photoURL }} style={styles.profilePhoto} />
          ) : (
            <View style={styles.photoPlaceholder}>
              <Text style={styles.initials}>
                {userData.displayName?.charAt(0) || 'U'}
              </Text>
            </View>
          )}
          {isEditing && (
            <View style={styles.editPhotoOverlay}>
              <Ionicons name="camera" size={24} color="white" />
            </View>
          )}
        </TouchableOpacity>

        {isEditing ? (
          <TextInput
            style={styles.nameInput}
            value={userData.displayName}
            onChangeText={(text) => setUserData(prev => ({ ...prev, displayName: text }))}
            placeholder="İsminizi girin"
          />
        ) : (
          <Text style={styles.name}>{userData.displayName || 'Kullanıcı'}</Text>
        )}
        
        <Text style={styles.email}>{user?.email}</Text>

        {isEditing && (
          <TextInput
            style={styles.statusInput}
            value={userData.status}
            onChangeText={(text) => setUserData(prev => ({ ...prev, status: text }))}
            placeholder="Durumunuzu yazın"
            multiline
          />
        )}
      </View>

      {isEditing ? (
        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={[styles.button, styles.cancelButton]} 
            onPress={() => setIsEditing(false)}
          >
            <Text style={styles.buttonText}>İptal</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.button, styles.saveButton]} 
            onPress={handleSave}
          >
            <Text style={styles.buttonText}>Kaydet</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity 
          style={styles.editButton} 
          onPress={() => setIsEditing(true)}
        >
          <Ionicons name="pencil" size={24} color="white" />
          <Text style={styles.editButtonText}>Profili Düzenle</Text>
        </TouchableOpacity>
      )}

      <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
        <Ionicons name="log-out-outline" size={24} color="white" />
        <Text style={styles.signOutText}>Çıkış Yap</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    padding: 20,
  },
  profileHeader: {
    alignItems: 'center',
    marginTop: 20,
  },
  profilePhoto: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 16,
  },
  photoPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#8A2BE2',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  editPhotoOverlay: {
    position: 'absolute',
    bottom: 16,
    right: 0,
    backgroundColor: '#8A2BE2',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  initials: {
    fontSize: 48,
    color: 'white',
    fontWeight: 'bold',
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  nameInput: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 8,
    width: '80%',
  },
  email: {
    fontSize: 16,
    color: '#666',
    marginBottom: 16,
  },
  statusInput: {
    width: '80%',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    textAlignVertical: 'top',
    minHeight: 80,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  button: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 8,
  },
  cancelButton: {
    backgroundColor: '#666',
  },
  saveButton: {
    backgroundColor: '#8A2BE2',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  editButton: {
    flexDirection: 'row',
    backgroundColor: '#8A2BE2',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  editButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
  },
  signOutButton: {
    flexDirection: 'row',
    backgroundColor: '#FF4444',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 'auto',
    marginBottom: 20,
  },
  signOutText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
  },
}); 