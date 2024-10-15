export function getTotalVolume(poolData?: any) {
  if (!poolData) return '尚未設定總容量';
  const { area, high } = poolData;
  if (!area) return '尚未設定容器面積';
  else if (!high) return '尚未設定容器高度';
  return area * high;
}
export function getLegalVolume(poolData?: any) {
  if (!poolData) return '尚未設定總容量';
  const { legal, invalid } = poolData;
  if (!legal) return '尚未設定法定水量';
  else if (!invalid) return '尚未設定無效水量';
  return legal + invalid;
}
export function getCurrentVolume(status: number, poolData?: any) {
  if (!poolData) return 0;
  const totalVolume = getTotalVolume(poolData);
  if (status && typeof totalVolume === 'number') {
    return (status / 100) * totalVolume;
  }
  return 0;
}

export function toPercentage(value: number, poolData: any | null) {
  if (!poolData) return 0;

  const { area, high, legal, invalid, total, zero } = poolData;
  if (!area || !high || !legal || !invalid || !total || !zero) return 0;
  const hundredPercentVal = total - zero; // 100% (水位計回傳計算值)
  const trueValue = value - zero; // 真正的水位計計算值
  const totalWaterVolume = area * high; // 總水量(噸數)
  const totalWaterTonnageRatio = totalWaterVolume / hundredPercentVal; // 總水量之 (噸數/水位計回傳值)
  const legalWaterReturnValue = (legal + invalid) / totalWaterTonnageRatio; // 法定水量之回傳值
  const invalidWaterReturnValue = invalid / totalWaterTonnageRatio; // 無效水量之回傳值

  if (trueValue <= invalidWaterReturnValue) return 0; // 小於無效水量之回傳值，回傳 0
  const currentVolumeDelta = trueValue - invalidWaterReturnValue;
  const waterVolumeDelta = hundredPercentVal - invalidWaterReturnValue;
  const valuePercentage = (currentVolumeDelta / waterVolumeDelta) * 100;

  if (valuePercentage <= 0) return 0;
  else if (valuePercentage >= 100) return 100;
  return valuePercentage.toFixed(2);
}
