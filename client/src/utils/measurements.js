export const MEASUREMENT_LABELS = {
  chest: 'Chest',
  waist: 'Waist',
  hip: 'Hip',
  shoulder: 'Shoulder',
  shoulders: 'Shoulders',
  sleeveLength: 'Sleeve Length',
  sleeve: 'Sleeve Length',
  armLength: 'Arm Length',
  neck: 'Neck',
  upperBodyLength: 'Body Length',
  inseam: 'Inseam',
  outseam: 'Outseam',
  thigh: 'Thigh',
  rise: 'Rise',
  fullLength: 'Full Length',
};

export const getMeasurementLabel = (key) => {
  if (MEASUREMENT_LABELS[key]) {
    return MEASUREMENT_LABELS[key];
  }

  return key
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

export const getFilledMeasurements = (measurements) => {
  if (!measurements || typeof measurements !== 'object') {
    return [];
  }

  return Object.entries(measurements).filter(([key, value]) => {
    if (key === '_id' || key === 'custom') {
      return false;
    }

    return value !== null && value !== undefined && value !== '';
  });
};
