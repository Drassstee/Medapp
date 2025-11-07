import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { MD3LightTheme, PaperProvider } from "react-native-paper";
import { StatusBar } from "expo-status-bar";
import { ActivityIndicator, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import LandingScreen from "./screens/LandingScreen";
import LoginScreen from "./screens/LoginScreen";
import RegisterScreen from "./screens/RegisterScreen";
import DoctorDashboardScreen from "./screens/DoctorDashboardScreen";
import PatientDashboardScreen from "./screens/PatientDashboardScreen";
import VideoLibraryScreen from "./screens/VideoLibraryScreen";
import { AuthProvider, useAuth } from "./context/AuthContext";

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const theme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: "#3566FF",
    secondary: "#15C1C1",
  },
};

const LoadingView = () => (
  <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
    <ActivityIndicator size="large" />
  </View>
);

const DoctorTabs = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      headerShown: false,
      tabBarIcon: ({ color, size }) => {
        const iconMap: Record<string, string> = {
          DoctorHome: "stethoscope",
          DoctorVideos: "video",
        };
        const iconName = iconMap[route.name] ?? "dots-horizontal";
        return <MaterialCommunityIcons name={iconName as any} color={color} size={size} />;
      },
    })}
  >
    <Tab.Screen name="DoctorHome" component={DoctorDashboardScreen} options={{ title: "Overview" }} />
    <Tab.Screen name="DoctorVideos" component={VideoLibraryScreen} options={{ title: "Videos" }} />
  </Tab.Navigator>
);

const PatientTabs = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      headerShown: false,
      tabBarIcon: ({ color, size }) => {
        const iconMap: Record<string, string> = {
          PatientHome: "home-heart",
          PatientVideos: "video",
        };
        const iconName = iconMap[route.name] ?? "dots-horizontal";
        return <MaterialCommunityIcons name={iconName as any} color={color} size={size} />;
      },
    })}
  >
    <Tab.Screen name="PatientHome" component={PatientDashboardScreen} options={{ title: "Home" }} />
    <Tab.Screen name="PatientVideos" component={VideoLibraryScreen} options={{ title: "Videos" }} />
  </Tab.Navigator>
);

const RootNavigator = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingView />;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {user ? (
          user.role === "doctor" ? (
            <Stack.Screen name="Doctor" component={DoctorTabs} />
          ) : (
            <Stack.Screen name="Patient" component={PatientTabs} />
          )
        ) : (
          <>
            <Stack.Screen name="Landing" component={LandingScreen} />
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const App = () => (
  <SafeAreaProvider>
    <PaperProvider theme={theme}>
      <AuthProvider>
        <StatusBar style="dark" />
        <RootNavigator />
      </AuthProvider>
    </PaperProvider>
  </SafeAreaProvider>
);

export default App;

