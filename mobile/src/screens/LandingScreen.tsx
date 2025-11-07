import { LinearGradient } from "expo-linear-gradient";
import { StyleSheet } from "react-native";
import { Button, Text } from "react-native-paper";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";

type Props = NativeStackScreenProps<any>;

const LandingScreen = ({ navigation }: Props) => (
  <LinearGradient colors={["#3566FF", "#15C1C1"]} style={styles.container}>
    <Text variant="headlineLarge" style={styles.headline}>
      MedApp Mobile
    </Text>
    <Text variant="bodyMedium" style={styles.subtitle}>
      Video education, smart triage, and doctor appointments in your pocket.
    </Text>
    <Button mode="contained" onPress={() => navigation.navigate("Login") } style={styles.button}>
      Sign in
    </Button>
    <Button mode="outlined" onPress={() => navigation.navigate("Register") } textColor="#fff">
      Create account
    </Button>
  </LinearGradient>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  headline: {
    color: "#fff",
    textAlign: "center",
    marginBottom: 12,
    fontWeight: "700",
  },
  subtitle: {
    color: "#f2f6ff",
    textAlign: "center",
    marginBottom: 32,
  },
  button: {
    width: "100%",
    marginBottom: 12,
  },
});

export default LandingScreen;


