import { createContext, ReactNode, useContext } from "react";
import {
  useQuery,
  useMutation,
  UseMutationResult,
} from "@tanstack/react-query";
import { User, insertUserSchema } from "@shared/schema";
import { queryClient } from "../lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { z } from 'zod';
import axios from "axios";

type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  error: Error | null;
  loginMutation: UseMutationResult<User, Error, LoginData>;
  logoutMutation: UseMutationResult<void, Error, void>;
  registerMutation: UseMutationResult<User, Error, RegisterData>;
};

// Create specific types for login and registration
export type LoginData = {
  username: string; // Can be either username or email
  password: string;
};

export type RegisterData = z.infer<typeof RegisterSchema>;

// Create a simplified schema for registration that includes password confirmation
export const RegisterSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  displayName: z.string().optional(),
  theme: z.string().optional(),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

export const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const {
    data: user,
    error,
    isLoading,
  } = useQuery<User | null, Error>({
    queryKey: ["/api/user"],
    queryFn: async ({ queryKey }) => {
      try {
        const res = await axios.get(queryKey[0] as string);
        return res.data;
      } catch (error) {
        if (axios.isAxiosError(error) && error.response?.status === 401) {
          return null;
        }
        throw error;
      }
    },
    retry: false,
  });

  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginData) => {
      try {
        // Ensure credentials are properly formatted
        const formattedCredentials = {
          username: credentials.username || "", // Can be either username or email
          password: credentials.password || ""
        };
        
        console.log('Sending login credentials:', { username: formattedCredentials.username });
        
        const res = await axios.post("/api/login", formattedCredentials);
        return res.data;
      } catch (error) {
        console.error('Full login error:', error);
        if (axios.isAxiosError(error)) {
          throw new Error(error.response?.data?.message || "Login failed");
        }
        throw error;
      }
    },
    onSuccess: (user: User) => {
      queryClient.setQueryData(["/api/user"], user);
      toast({
        title: "Login successful",
        description: `Welcome back, ${user.firstName || user.username}!`,
      });
    },
    onError: (error: Error) => {
      console.error("Login error:", error);
      toast({
        title: "Login failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (userData: RegisterData) => {
      try {
        // Include confirmPassword in the request
        const formattedData = {
          username: userData.username || '',
          email: userData.email || '',
          password: userData.password || '',
          confirmPassword: userData.confirmPassword || '', // Keep this for validation
          firstName: userData.firstName || undefined,
          lastName: userData.lastName || undefined,
          displayName: userData.displayName || userData.username || '',
          theme: userData.theme || 'blue'
        };
        
        // Log the data being sent to help debug
        console.log('Sending registration data:', formattedData);
        
        const res = await axios.post("/api/register", formattedData);
        return res.data;
      } catch (error) {
        console.error('Full registration error:', error);
        if (axios.isAxiosError(error)) {
          if (error.response?.data?.errors && Array.isArray(error.response.data.errors)) {
            // If we get a list of validation errors, show the first one
            const errorMessage = error.response.data.errors[0]?.message || error.response.data.message || "Registration failed";
            throw new Error(errorMessage);
          } else {
            throw new Error(error.response?.data?.message || "Registration failed");
          }
        }
        throw error;
      }
    },
    onSuccess: (user: User) => {
      queryClient.setQueryData(["/api/user"], user);
      toast({
        title: "Registration successful",
        description: `Welcome to Fitness Tracker, ${user.firstName || user.username}!`,
      });
    },
    onError: (error: Error) => {
      console.error("Registration error:", error);
      
      // Make the error message more user-friendly
      let errorMessage = error.message;
      if (errorMessage.includes("Passwords do not match")) {
        errorMessage = "Passwords do not match. Please check both password fields.";
      } else if (errorMessage.includes("Email already in use")) {
        errorMessage = "This email is already registered. Please login or use a different email.";
      } else if (errorMessage.includes("Username already in use")) {
        errorMessage = "This username is already taken. Please choose a different one.";
      }
      
      toast({
        title: "Registration failed",
        description: errorMessage,
        variant: "destructive",
      });
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      try {
        await axios.post("/api/logout");
      } catch (error) {
        if (axios.isAxiosError(error)) {
          throw new Error(error.response?.data?.message || "Logout failed");
        }
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.setQueryData(["/api/user"], null);
      toast({
        title: "Logged out",
        description: "You have been logged out successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Logout failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return (
    <AuthContext.Provider
      value={{
        user: user || null,
        isLoading,
        error,
        loginMutation,
        logoutMutation,
        registerMutation,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}