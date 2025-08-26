import { Suspense } from 'react';
import { SettingsForm } from './SettingsForm';
import { Loader2 } from 'lucide-react';

export default function SettingsPage() {
  return (
    <Suspense fallback={<div className="flex h-screen w-full items-center justify-center"><Loader2 className="animate-spin" /></div>}>
      <SettingsForm />
    </Suspense>
  );
}