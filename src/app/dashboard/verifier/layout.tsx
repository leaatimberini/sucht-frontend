import { AuthCheck } from "@/components/auth-check";
import { UserRole } from "@/types/user.types";

export default function VerifierLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // Protegemos esta sección para Admins y Verificadores
    <AuthCheck allowedRoles={[UserRole.ADMIN, UserRole.VERIFIER]}>
      {children}
    </AuthCheck>
  );
}