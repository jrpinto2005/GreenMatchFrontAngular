export interface CarePlan {
  id: number;
  plant_id: number;
  created_at: string; // ISO
  environment_json?: Record<string, any> | null;
  plan_json: {
    riego: { frecuencia: string; detalle: string };
    luz:   { tipo: string; detalle: string };
    temperatura: string;
    humedad: string;
    fertilizacion: { frecuencia: string; detalle: string };
    poda: string;
    plagas: string;
    alertas: string[];
  };
}