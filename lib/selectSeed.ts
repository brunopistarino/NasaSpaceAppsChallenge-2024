import { APIData } from "./types";
import { getCultivosList } from "@/lib/cultivos";

export const getSeedsForClimate = (climateConditions: APIData) => {
  if (!climateConditions) {
    console.error(`No climate data available for zone`);
    return [];
  }

  const cultivosList = getCultivosList();

  // Calcula el promedio mensual de la temperatura
  const monthlyTempAvg = calculateMonthlyAverage(climateConditions.dataTemperature, 'kelvin');

  // Calcula el promedio mensual de las precipitaciones
  const monthlyPrecipAvg = calculateMonthlyAverage(climateConditions.dataPrecipitation, 'raw_value');

  // Calcula la compatibilidad para cada semilla
  const seedsCompatibility = cultivosList.map(cultivo => {
    const monthlyCompatibility = monthlyTempAvg.map((temp, index) => {
      const precipCompatibility = calculateCompatibilityPercentage(
        monthlyPrecipAvg[index],
        cultivo.precipitaciones_ideales_minimas_mm_anuales / 12,
        cultivo.precipitaciones_ideales_maximas_mm_anuales / 12
      );

      const tempCompatibility = calculateCompatibilityPercentage(
        temp,
        cultivo.temperatura_ideal_minima_kelvin,
        cultivo.temperatura_ideal_maxima_kelvin
      );

      // Promedio de compatibilidad de temperatura y precipitaciones
      return (precipCompatibility + tempCompatibility) / 2;
    });

    return {
      ...cultivo,
      monthlyCompatibility,
      averageCompatibility: monthlyCompatibility.reduce((a, b) => a + b, 0) / monthlyCompatibility.length
    };
  });

  // Ordena las semillas por compatibilidad promedio descendente
  seedsCompatibility.sort((a, b) => b.averageCompatibility - a.averageCompatibility);

  console.log('temperatura promedio: ' + monthlyTempAvg); 
  console.log('precipitaciones promedio: ' + monthlyPrecipAvg);
  console.log('compatibilidad de semillas:', seedsCompatibility);

  return seedsCompatibility;
};

function calculateMonthlyAverage(data: any[], valueKey: string) {
  const monthlySum = new Array(12).fill(0);
  const monthlyCount = new Array(12).fill(0);

  data.forEach((day) => {
    const month = new Date(day.date).getMonth();
    monthlySum[month] += day[valueKey];
    monthlyCount[month] += 1;
  });

  return monthlySum.map((sum, index) => 
    monthlyCount[index] > 0 ? sum / monthlyCount[index] : null
  ).filter((avg) => avg !== null);
}

function calculateCompatibilityPercentage(value, min, max) {
  if (value < min) {
    return Math.max(0, 100 - ((min - value) / min) * 100);
  } else if (value > max) {
    return Math.max(0, 100 - ((value - max) / max) * 100);
  }
  return 100; // Valor dentro del rango ideal
}