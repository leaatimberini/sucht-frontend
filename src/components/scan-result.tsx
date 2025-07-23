'use client';

// Definimos la estructura de una respuesta exitosa
interface SuccessResponse {
  message: string;
  status: 'used';
  userName: string;
  userEmail: string;
  eventName: string;
}

// Definimos la estructura de una respuesta de error
interface ErrorResponse {
  message: string;
  error: string;
  statusCode: number;
}

type ScanResultType = {
  type: 'success',
  data: SuccessResponse
} | {
  type: 'error',
  data: ErrorResponse
};

export function ScanResult({
  result,
  onScanNext,
}: {
  result: ScanResultType;
  onScanNext: () => void;
}) {
  const isSuccess = result.type === 'success';
  const bgColor = isSuccess ? 'bg-green-500' : 'bg-red-500';
  const title = isSuccess ? 'Acceso Autorizado' : 'Acceso Denegado';
  const message = result.data.message;

  return (
    <div className="w-full max-w-md mx-auto text-center border border-zinc-700 rounded-lg p-6">
      <div className={`${bgColor} text-white font-bold text-3xl py-4 rounded-md mb-6`}>
        {title}
      </div>
      <p className="text-zinc-300 text-lg mb-6">{message}</p>

      {isSuccess && (
        <div className="text-left space-y-2 bg-zinc-800 p-4 rounded-md">
          <p><span className="font-semibold text-zinc-400">Nombre:</span> {result.data.userName}</p>
          <p><span className="font-semibold text-zinc-400">Email:</span> {result.data.userEmail}</p>
          <p><span className="font-semibold text-zinc-400">Evento:</span> {result.data.eventName}</p>
        </div>
      )}

      <button
        onClick={onScanNext}
        className="mt-8 w-full bg-pink-600 hover:bg-pink-700 text-white font-bold py-3 rounded-lg"
      >
        Escanear Siguiente
      </button>
    </div>
  );
}