import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  Image, 
  TouchableOpacity, 
  Dimensions 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';

type RootStackParamList = {
  PlaceDetails: {
    place: Place;
  };
};

type PlaceDetailsRouteProp = RouteProp<RootStackParamList, 'PlaceDetails'>;
type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface Review {
  id: string;
  userId: string;
  userName: string;
  userPhoto: string;
  rating: number;
  comment: string;
  date: string;
}

interface Place {
  id: string;
  name: string;
  description?: string;
  rating?: number;
  address?: string;
  openingHours?: string;
  photos: string[];
  reviews: Review[];
  users: Array<{
    id: string;
    name: string;
    photoURL: string;
  }>;
}

export default function PlaceDetailsScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<PlaceDetailsRouteProp>();
  const { place } = route.params;

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Fotoğraf Galerisi */}
        <ScrollView 
          horizontal 
          pagingEnabled 
          showsHorizontalScrollIndicator={false}
          style={styles.photoGallery}
        >
          {place.photos.map((photo, index) => (
            <Image
              key={index}
              source={{ uri: photo }}
              style={styles.galleryImage}
            />
          ))}
        </ScrollView>

        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>

        <View style={styles.content}>
          <Text style={styles.title}>{place.name}</Text>
          
          {place.rating && (
            <View style={styles.ratingContainer}>
              <Ionicons name="star" size={24} color="#FFD700" />
              <Text style={styles.rating}>{place.rating}</Text>
            </View>
          )}

          {place.description && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Hakkında</Text>
              <Text style={styles.description}>{place.description}</Text>
            </View>
          )}

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Bilgiler</Text>
            
            {place.address && (
              <View style={styles.infoRow}>
                <Ionicons name="location" size={24} color="#8A2BE2" />
                <Text style={styles.infoText}>{place.address}</Text>
              </View>
            )}

            {place.openingHours && (
              <View style={styles.infoRow}>
                <Ionicons name="time" size={24} color="#8A2BE2" />
                <Text style={styles.infoText}>{place.openingHours}</Text>
              </View>
            )}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              Şu anda Mekanda ({place.users.length})
            </Text>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              style={styles.usersScroll}
            >
              {place.users.map(user => (
                <View key={user.id} style={styles.userCard}>
                  <Image 
                    source={{ uri: user.photoURL }} 
                    style={styles.userPhoto}
                  />
                  <Text style={styles.userName}>{user.name}</Text>
                </View>
              ))}
            </ScrollView>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Fotoğraflar</Text>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              style={styles.photoPreviewScroll}
            >
              {place.photos.map((photo, index) => (
                <TouchableOpacity 
                  key={index}
                  style={styles.photoPreview}
                >
                  <Image
                    source={{ uri: photo }}
                    style={styles.previewImage}
                  />
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              Yorumlar ({place.reviews?.length || 0})
            </Text>
            {place.reviews?.map(review => (
              <View key={review.id} style={styles.reviewCard}>
                <View style={styles.reviewHeader}>
                  <Image 
                    source={{ uri: review.userPhoto }} 
                    style={styles.reviewerPhoto}
                  />
                  <View style={styles.reviewerInfo}>
                    <Text style={styles.reviewerName}>{review.userName}</Text>
                    <Text style={styles.reviewDate}>{review.date}</Text>
                  </View>
                  <View style={styles.reviewRating}>
                    <Ionicons name="star" size={16} color="#FFD700" />
                    <Text style={styles.reviewRatingText}>{review.rating}</Text>
                  </View>
                </View>
                <Text style={styles.reviewComment}>{review.comment}</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    height: 250,
    position: 'relative',
  },
  headerImage: {
    width: '100%',
    height: '100%',
  },
  backButton: {
    position: 'absolute',
    top: 40,
    left: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  rating: {
    fontSize: 20,
    fontWeight: '600',
    marginLeft: 8,
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
    color: '#333',
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: '#666',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  infoText: {
    fontSize: 16,
    marginLeft: 12,
    color: '#444',
    flex: 1,
  },
  usersScroll: {
    marginTop: 10,
  },
  userCard: {
    alignItems: 'center',
    marginRight: 20,
  },
  userPhoto: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginBottom: 8,
  },
  userName: {
    fontSize: 14,
    color: '#666',
  },
  photoGallery: {
    height: 250,
  },
  galleryImage: {
    width: Dimensions.get('window').width,
    height: 250,
    resizeMode: 'cover',
  },
  photoPreviewScroll: {
    marginTop: 10,
  },
  photoPreview: {
    width: 100,
    height: 100,
    marginRight: 10,
    borderRadius: 10,
    overflow: 'hidden',
  },
  previewImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  reviewCard: {
    backgroundColor: '#f8f8f8',
    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
  },
  reviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  reviewerPhoto: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  reviewerInfo: {
    flex: 1,
    marginLeft: 12,
  },
  reviewerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  reviewDate: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  reviewRating: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 15,
  },
  reviewRatingText: {
    marginLeft: 4,
    fontWeight: '600',
    color: '#333',
  },
  reviewComment: {
    fontSize: 15,
    color: '#444',
    lineHeight: 22,
  },
}); 