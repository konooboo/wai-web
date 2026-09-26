import { buildNzDots } from './nzDots'
import { buildPointCloud } from './pointCloud'
import { ALERT_SENSOR_ID, FARM_SENSORS } from './sensors'
import { getHeightmap, HEIGHTMAP_SIZE } from './terrain'

self.onmessage = () => {
  const t0 = performance.now()
  const map = getHeightmap(HEIGHTMAP_SIZE, FARM_SENSORS)
  const t1 = performance.now()
  const cloud = buildPointCloud(
    FARM_SENSORS,
    FARM_SENSORS.findIndex((s) => s.id === ALERT_SENSOR_ID),
    map,
  )
  if (import.meta.env.DEV)
    console.info(
      `farm: heightmap ${Math.round(t1 - t0)} ms, cloud ${Math.round(performance.now() - t1)} ms, ${cloud.count} points`,
    )
  const nz = buildNzDots()
  self.postMessage(
    { cloud, nz },
    {
      transfer: [
        cloud.position.buffer,
        cloud.data.buffer,
        cloud.paddockLine.buffer,
        nz.position.buffer,
        nz.data.buffer,
      ],
    },
  )
}
