import { SENSORS } from '../content'
import { POND, streamPoint, type Point } from './terrain'

type SensorKind = (typeof SENSORS)[number]['id']

export type FarmSensor = Point & {
  id: string
  kind: SensorKind
  place: string
  value: number
  decimals: number
  alertValue?: number
}

// Example readings for the map story. TODO(data): replace with real values.
export const FARM_SENSORS: FarmSensor[] = [
  {
    id: 'S1',
    kind: 'ph',
    place: 'Stream',
    value: 7.2,
    decimals: 1,
    ...streamPoint(0.12),
  },
  {
    id: 'S2',
    kind: 'nitrate',
    place: 'Pond',
    value: 0.8,
    decimals: 1,
    x: POND.x - 0.03,
    y: POND.y + 0.012,
  },
  {
    id: 'S3',
    kind: 'turbidity',
    place: 'Stream',
    value: 4.2,
    decimals: 1,
    alertValue: 48,
    ...streamPoint(0.52),
  },
  {
    id: 'S4',
    kind: 'water-temp',
    place: 'Stream',
    value: 13.4,
    decimals: 1,
    ...streamPoint(0.78),
  },
  {
    id: 'S5',
    kind: 'soil-moisture',
    place: 'Paddock 3',
    value: 32,
    decimals: 0,
    x: 0.17,
    y: 0.52,
  },
  {
    id: 'S6',
    kind: 'soil-temp',
    place: 'Paddock 9',
    value: 11.8,
    decimals: 1,
    x: 0.64,
    y: 0.66,
  },
]

export const ALERT_SENSOR_ID = 'S3'
export const ALERT_SENSOR = FARM_SENSORS.find((s) => s.id === ALERT_SENSOR_ID)!

export const sensorInfo = (kind: SensorKind) =>
  SENSORS.find((s) => s.id === kind)!
