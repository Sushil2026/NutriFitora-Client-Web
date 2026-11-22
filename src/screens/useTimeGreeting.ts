import { useEffect, useState } from 'react';
import { AppState } from 'react-native';

/** Uses the device's local time; no API or location permission required. */
export function getTimeSalutation(date: Date = new Date()): string {
  const hour = date.getHours();
  if (hour >= 5 && hour < 12) return 'Good Morning';
  if (hour >= 12 && hour < 17) return 'Good Afternoon';
  if (hour >= 17 && hour < 21) return 'Good Evening';
  return 'Good Night';
}

export default function useTimeGreeting(): string {
  const [salutation, setSalutation] = useState(() => getTimeSalutation());
  useEffect(() => {
    const refresh = () => setSalutation(getTimeSalutation());
    refresh();
    const timer = setInterval(refresh, 60_000);
    const subscription = AppState.addEventListener('change', state => {
      if (state === 'active') refresh();
    });
    return () => {
      clearInterval(timer);
      subscription.remove();
    };
  }, []);
  return salutation;
}
