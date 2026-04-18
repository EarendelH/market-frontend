export interface AuthUser {
  id: number;
  sustech_email: string;
  username: string;
  avatar_url?: string | null;
  personal_url?: string | null;
  bio?: string | null;
  role?: string;
  status?: string;
  reputation_trade?: number;
  reputation_skill?: number;
  trade_count?: number;
  skill_count?: number;
  created_at?: string;
  last_login_at?: string | null;
}
