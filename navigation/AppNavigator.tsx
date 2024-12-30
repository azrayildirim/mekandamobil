import { createStackNavigator } from '@react-navigation/stack';
import HomeScreen from '../screens/HomeScreen';
import NearbyPlacesMap from '../screens/NearbyPlacesMap';
import LoginScreen from '../screens/LoginScreen';

const Stack = createStackNavigator();

const AppNavigator: React.FC = () => {
  return (
    <Stack.Navigator initialRouteName="Home">
    <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
  
      <Stack.Screen 
        name="NearbyPlaces" 
        component={NearbyPlacesMap}
        options={{ title: 'Yakındaki Mekanlar' }}
      />
    </Stack.Navigator>
  );
};

export default AppNavigator; 