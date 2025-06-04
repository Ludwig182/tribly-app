// app/(tabs)/family.tsx
import { useLocalSearchParams } from 'expo-router';
import FamilyScreen from '@/components/family/FamilyScreen';

export default function FamilyTab() {
  const params = useLocalSearchParams();
  
  return (
    <FamilyScreen 
      initialMode={params.initialMode as 'view' | 'edit'}
      memberId={params.memberId as string}
    />
  );
}
