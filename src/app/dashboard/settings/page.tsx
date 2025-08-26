import { Suspense } from 'react';
import { SettingsForm } from '@/components/forms/SettingsForm';
import { Loader2 } from 'lucide-react';
import { AuthCheck } from '@/components/auth-check';
import { UserRole } from '@/types/user.types';

// Esta página ahora solo envuelve el formulario principal en un Suspense
// para solucionar el error de compilación de Next.js.
export default function SettingsPage() {
  return (
    <AuthCheck allowedRoles={[UserRole.ADMIN, UserRole.OWNER]}>
        <Suspense fallback={<div className="flex h-screen w-full items-center justify-center"><Loader2 className="animate-spin" /></div>}>
            <SettingsForm />
        </Suspense>
    </AuthCheck>
  );
}