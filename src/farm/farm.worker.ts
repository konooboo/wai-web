import { hillshadePixels } from './hillshade'
import { buildPointCloud } from './pointCloud'
import { ALERT_SENSOR_ID, FARM_SENSORS } from './sensors'
import { getHeightmap } from './terrain'

self.onmessage = () => {
  const map = getHeightmap()
  const pixels = hillshadePixels(map)
  const cloud = buildPointCloud(
    FARM_SENSORS,
    FARM_SENSORS.findIndex((s) => s.id === ALERT_SENSOR_ID),
    map,
  )
  const transfer = [
    pixels.buffer,
    cloud.x.buffer,
    cloud.y.buffer,
    cloud.d.buffer,
  ]
  transfer.push(cloud.alertIndex.buffer, cloud.alertD.buffer)
  self.postMessage({ size: map.size, pixels, cloud }, { transfer })
}
