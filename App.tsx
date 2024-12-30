import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from './screens/HomeScreen';
import NearbyPlaces from './screens/NearbyPlaces';
import PlaceDetailsScreen from './screens/PlaceDetailsScreen';
import AddPlaceScreen from './screens/AddPlaceScreen';
import SignUpScreen from './screens/SignUpScreen';
import SignInScreen from './screens/SignInScreen';
import ProfileScreen from './screens/ProfileScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false
        }}
      >
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="NearbyPlaces" component={NearbyPlaces} />
        <Stack.Screen name="PlaceDetails" component={PlaceDetailsScreen} />
        <Stack.Screen 
          name="AddPlace" 
          component={AddPlaceScreen}
          options={{
            headerShown: true,
            title: 'Yeni Mekan Ekle',
            headerTintColor: '#8A2BE2'
          }}
        />
        <Stack.Screen 
          name="SignUp" 
          component={SignUpScreen}
          options={{
            headerShown: true,
            title: 'Üye Ol',
            headerTintColor: '#8A2BE2'
          }}
        />
        <Stack.Screen 
          name="SignIn" 
          component={SignInScreen}
          options={{
            headerShown: true,
            title: 'Giriş Yap',
            headerTintColor: '#8A2BE2'
          }}
        />
        <Stack.Screen 
          name="Profile" 
          component={ProfileScreen}
          options={{
            headerShown: true,
            title: 'Profil',
            headerTintColor: '#8A2BE2'
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
