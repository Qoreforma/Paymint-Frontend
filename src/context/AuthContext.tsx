import { createContext, useContext, useEffect, useState } from "react";

// interface Wallet {
//   type: string;
//   balance: number;
// }

// interface CountryData {
//   id: number;
//   name: string;
//   code: string;
//   iso2: string;
//   iso3: string;
//   phone_code: string;
//   region: string;
//   emoji: string;
//   emoji_code: string;
//   capital: string;
//   currency: string;
//   currency_name: string;
//   currency_symbol: string;
//   longitude: string;
//   latitude: string;
//   flag_url: string;
//   can_do_airtime: boolean;
//   airtime_activated_at: string | null;
//   created_at: string;
// }

export type User = {
  id: string;
  firstname: string;
  lastname: string;
  username: string;
  email: string;

  authType: "password" | "google" | "apple";
  avatar: string | null;

  phone: string;
  phoneCode: string;
  country: string;
  state: string;

  gender: "male" | "female" | "other";
  dateOfBirth: string | null;

  status: "active" | "inactive" | "suspended";

  refCode: string;
  referredBy: string | null;

  bvnValidated: boolean;
  bvnVerified: boolean;

  emailVerifiedAt: string | null;
  phoneVerifiedAt: string | null;

  twofactorEnabled: boolean;
  twoFactorEnabledAt: string | null;

  loginBiometricEnabled: boolean;
  transactionBiometricEnabled: boolean;
  pinActivatedAt: string | null;

  lastLoginAt: string | null;

  fcmTokens: string[];

  virtualAccount: unknown | null;

  createdAt: string;
  updatedAt: string;
}



interface TAuthContext {
  accessToken: string | null;
  refreshToken: string | null;
  user: User | null,
  loading: boolean;
  setAuthData: (user: User, accessToken: string, refreshToken: string) => void;
  clearAuthData: () => void;
};

const AuthContext = createContext<TAuthContext | undefined>(undefined)

export const AuthContextProvider = ({children}: {children: React.ReactNode}) => {
    const [user, setUser] = useState<User | null>(null);
    const [accessToken, setAccessToken] =useState<string | null>(null);
    const [refreshToken, setRefreshToken] =useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const storedUser = localStorage.getItem("user");
        const storedAccessToken = localStorage.getItem("accessToken");
        const storedRefreshToken = localStorage.getItem("refreshToken");

        console.log({user: JSON.parse(storedUser!), accessToken, refreshToken})

        if(storedUser && storedAccessToken && storedRefreshToken){
            setUser(JSON.parse(storedUser));
            setAccessToken(storedAccessToken)
            setRefreshToken(storedRefreshToken)
        }

        setLoading(false);
    }, [])

    const setAuthData = (user: User, accessToken: string, refreshToken: string) => {
        setUser(user);
        setAccessToken(accessToken);
        setRefreshToken(refreshToken);
        localStorage.setItem("user", JSON.stringify(user));
        localStorage.setItem("accessToken", accessToken);
        localStorage.setItem("refreshToken", refreshToken);
    };

    const clearAuthData = () => {
        setUser(null);
        setAccessToken(null);
        setRefreshToken(null);
        localStorage.removeItem("user");
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
    };

    if(loading) return null

    return (
        <AuthContext.Provider value={{accessToken, refreshToken, user, loading, setAuthData, clearAuthData}}>{children}</AuthContext.Provider>
    )
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};