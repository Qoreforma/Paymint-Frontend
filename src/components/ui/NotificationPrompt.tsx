import { useState, useEffect } from "react";
import { usePushNotifications } from "../../hooks/usePushNotifications";
import { useAuth } from "../../context/AuthContext";
import { Bell, X } from "lucide-react";

export const NotificationPrompt = () => {
  const { permission, requestPermissionAndGetToken, loading } = usePushNotifications();
  const { user } = useAuth();
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    // Only show if user is logged in, permission is strictly "default" (not asked yet),
    // and they haven't dismissed it this session.
    if (user && permission === "default" && !sessionStorage.getItem("pushPromptDismissed")) {
      // Delay prompt slightly so it's not too aggressive
      const timer = setTimeout(() => setShowPrompt(true), 3000);
      return () => clearTimeout(timer);
    }
  }, [user, permission]);

  if (!showPrompt) return null;

  const handleAllow = async () => {
    await requestPermissionAndGetToken();
    setShowPrompt(false);
  };

  const handleDismiss = () => {
    sessionStorage.setItem("pushPromptDismissed", "true");
    setShowPrompt(false);
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm w-full bg-white rounded-xl shadow-xl border border-gray-100 p-5 animate-in slide-in-from-bottom-5 fade-in duration-300">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-[#e6f4ff] p-2 rounded-full">
            <Bell className="w-5 h-5 text-[var(--aqua)]" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-900">Enable Push Notifications</h3>
            <p className="text-xs text-gray-500 mt-1">
              Get instant updates on your transactions and cashback rewards.
            </p>
          </div>
        </div>
        <button
          onClick={handleDismiss}
          className="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
      <div className="flex gap-2 mt-4 justify-end">
        <button
          onClick={handleDismiss}
          className="text-xs font-medium text-gray-600 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Not now
        </button>
        <button
          onClick={handleAllow}
          disabled={loading}
          className="text-xs font-medium text-white bg-[var(--aqua)] px-4 py-2 rounded-lg hover:bg-[#002f5e] transition-colors disabled:opacity-70 flex items-center gap-2"
        >
          {loading ? "Enabling..." : "Allow Notifications"}
        </button>
      </div>
    </div>
  );
};
