import cropsData from "@/lib/cultivos.json";

interface Cultivo {
  nombre: string;
  temperatura_ideal_minima_kelvin: number;
  temperatura_ideal_maxima_kelvin: number;
  precipitaciones_ideales_minimas_mm_anuales: number;
  precipitaciones_ideales_maximas_mm_anuales: number;
  descripción: string;
}

export const getCultivosList = (): Cultivo[] => {
  return cropsData.cultivos;
};