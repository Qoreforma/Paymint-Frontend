import { isToday, isYesterday, isThisWeek, isThisMonth, parseISO, isSameMonth, subMonths } from "date-fns";
import { Transaction } from "./api/dashboard-apis/txnHistoryApis";
import { clsx, type ClassValue } from "clsx"
import { toast } from "sonner";
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const copyToClipboard = async (text: string, customMessage?: string): Promise<void> => {
  try {
    await navigator.clipboard.writeText(text);
    toast.success(customMessage || "Copied to clipboard");
  } catch (err) {
    console.error("Failed to copy text: ", err);
    toast.error("Failed to copy text");
  }
};

export function formatAmount(amount: number): string {
  if (typeof amount !== "number") return "0.00";

  return amount.toLocaleString("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 2,
  });
}

export function formatDateTime(dateString: string): string {
  const date = new Date(dateString);

  const datePart = date.toLocaleDateString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  });

  const timePart = date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  }).replace(" ", "");

  return `${datePart} | ${timePart}`;
}

export function convertToLocalPhoneNumber(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (digits.startsWith("234")) {
    return "0" + digits.slice(3);
  } else if (digits.startsWith("0")) {
    return digits;
  }
  // Fallback
  return digits;
}

export function detectNigerianNetwork(phone: string): string | null {
  const localPhone = convertToLocalPhoneNumber(phone);
  
  // Return null if length isn't enough to determine or invalid
  if (localPhone.length < 4 || localPhone.length > 11) return null;

  const prefix4 = localPhone.substring(0, 4);
  const prefix5 = localPhone.substring(0, 5);

  const mtnPrefixes = ["0803", "0806", "0814", "0810", "0813", "0816", "0903", "0906", "0703", "0706", "0704", "0913", "0916"];
  const mtnPrefixes5 = ["07025", "07026"];
  const gloPrefixes = ["0805", "0807", "0815", "0811", "0905", "0705", "0915"];
  const airtelPrefixes = ["0802", "0808", "0812", "0902", "0907", "0901", "0904", "0708", "0701", "0912", "0911"];
  const etisalatPrefixes = ["0809", "0817", "0818", "0909", "0908"];

  if (mtnPrefixes.includes(prefix4) || mtnPrefixes5.includes(prefix5)) return "mtn";
  if (gloPrefixes.includes(prefix4)) return "glo";
  if (airtelPrefixes.includes(prefix4)) return "airtel";
  if (etisalatPrefixes.includes(prefix4)) return "9mobile";

  return null;
}

export const formatDate = (dateString: string): string => {
    const date = new Date(dateString);

    const day = date.getDate();
    const month = date.toLocaleString('en-US', { month: 'short' }).toUpperCase();
    const year = date.getFullYear();

    const getOrdinalSuffix = (n: number): string => {
        if (n >= 11 && n <= 13) return `${n}TH`;
        switch (n % 10) {
            case 1: return `${n}ST`;
            case 2: return `${n}ND`;
            case 3: return `${n}RD`;
            default: return `${n}TH`;
        }
    };

    return `${getOrdinalSuffix(day)} ${month}. ${year}`;
};


type GroupedTransactions = {
  dateGroup: string;
  transactions: Transaction[];
};

export const getTxnTime = (txnDate: Date) => {
    let time = "Earlier";

    if (isToday(txnDate)) {
      time = "Today";
    } else if (isYesterday(txnDate)) {
      time = "Yesterday";
    } else if (isThisWeek(txnDate, {weekStartsOn: 1})) {
      time = "This Week";
    } else if (isThisMonth(txnDate)) {
      time = "This Month";
    } else if (isSameMonth(txnDate, subMonths(new Date(), 1))) {
      return "Last Month";
    } else if (isSameMonth(txnDate, subMonths(new Date(), 2))) {
      return "2 Months Ago";
    } else if (isSameMonth(txnDate, subMonths(new Date(), 3))) {
      return "3 Months Ago";
    }

    return time;
}

export const groupTransactionsByDate = (transactions: Transaction[]): GroupedTransactions[] => {
  const groups: { [key: string]: Transaction[] } = {};

  transactions.forEach((txn) => {
    const txnDate = parseISO(txn.createdAt);

    const group = getTxnTime(txnDate);

    if (!groups[group]) {
      groups[group] = [];
    }

    groups[group].push(txn);
  });

  // Convert to array format
  const groupedArray: GroupedTransactions[] = Object.entries(groups).map(([dateGroup, transactions]) => ({
    dateGroup,
    transactions,
  }));

  return groupedArray;
};

export const formatISODuration = (duration: string): string => {
  const regex = /PT(?:(\d+)H)?(?:(\d+)M)?/;
  const match = duration.match(regex);

  if (!match) return "0h 0m";

  const hours = match[1] ? parseInt(match[1], 10) : 0;
  const minutes = match[2] ? parseInt(match[2], 10) : 0;

  return `${hours}h ${minutes}m`;
}

export function getTimeOfDay(): "morning" | "afternoon" | "evening" {
  const hour = new Date().getHours();

  if (hour >= 5 && hour < 12) {
    return "morning";
  } else if (hour >= 12 && hour < 17) {
    return "afternoon";
  } else {
    return "evening";
  }
}
