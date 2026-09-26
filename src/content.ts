// Shared product facts. Several sections use these, so keep them in one place.
// TODO(data) marks values that the team must confirm.

export const SENSORS = [
  { id: 'ph', label: 'pH', unit: '', where: 'water' },
  { id: 'turbidity', label: 'Turbidity', unit: 'NTU', where: 'water' },
  { id: 'nitrate', label: 'Nitrate', unit: 'mg/L', where: 'water' },
  { id: 'water-temp', label: 'Water temperature', unit: '°C', where: 'water' },
  { id: 'soil-moisture', label: 'Soil moisture', unit: '%', where: 'soil' },
  { id: 'soil-temp', label: 'Soil temperature', unit: '°C', where: 'soil' },
] as const // TODO(data): confirm the measurements the hardware takes

export const ALERT_EXAMPLE = {
  sensor: 'Stream sensor S3',
  reading: 'Turbidity 48 NTU',
  normal: 'Normal: below 10 NTU',
  cause:
    'Turbidity rose 5× after 22 mm of rain. Likely run-off from Paddock 7.',
  action: 'Hold fertiliser for 48 h. Check the riparian fence on Paddock 7.',
  time: '5 min ago',
} // TODO(data): replace with a real example from the team

export const READING_INTERVAL_MIN = 15 // TODO(data): confirm interval

export const CONTACT_EMAIL = '[hello@wai.nz]' // TODO(data)
