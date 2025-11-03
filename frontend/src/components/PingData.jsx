// src/components/PingData.jsx
import { useData } from '../contexts/DataContext';

export default function PingData() {
  const ctx = useData();
  console.log('DataContext is visible here ✅', ctx);
  return null;
}
