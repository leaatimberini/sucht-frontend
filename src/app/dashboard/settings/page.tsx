import { SettingsManager } from "@/components/settings-manager";

export default function SettingsPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold text-white mb-2">Configuración</h1>
      <p className="text-zinc-400 mb-8">
        Administra las configuraciones globales de la plataforma y tus integraciones de pago.
      </p>
      <SettingsManager />
    </div>
  );
}
