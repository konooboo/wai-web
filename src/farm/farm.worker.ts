import { buildNzDots } from './nzDots'
import { buildPointCloud } from './pointCloud'
import { ALERT_SENSOR_ID, FARM_SENSORS } from './sensors'
import { getHeightmap, HEIGHTMAP_SIZE } from './terrain'

self.onmessage = () => {
  const cloud = buildPointCloud(
    FARM_SENSORS,
    FARM_SENSORS.findIndex((s) => s.id === ALERT_SENSOR_ID),
    getHeightmap(HEIGHTMAP_SIZE, FARM_SENSORS),
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
