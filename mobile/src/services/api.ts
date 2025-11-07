import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:8080/api";
const UPLOAD_BASE_URL = process.env.EXPO_PUBLIC_UPLOAD_URL ?? "http://localhost:8080";
const TOKEN_KEY = "MEDAPP_TOKEN";

export const api = axios.create({ baseURL: API_BASE_URL });

api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem(TOKEN_KEY);
  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const persistToken = async (token: string | null) => {
  if (token) {
    await AsyncStorage.setItem(TOKEN_KEY, token);
  } else {
    await AsyncStorage.removeItem(TOKEN_KEY);
  }
};

export const resolveAssetUrl = (path: string) =>
  path.startsWith("http") ? path : `${UPLOAD_BASE_URL}${path}`;


