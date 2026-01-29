export interface User {
  id: string;
  email: string;
  created_at: string;
}

export interface Profile {
  id: string;
  user_id: string;
  username: string | null;
  display_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  created_at: string;
  updated_at: string;
}

export interface AuthState {
  user: User | null;
  profile: Profile | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

export interface SignUpInput {
  email: string;
  password: string;
  username?: string;
}

export interface SignInInput {
  email: string;
  password: string;
}

export interface UpdateProfileInput {
  username?: string;
  display_name?: string;
  avatar_url?: string;
  bio?: string;
}
