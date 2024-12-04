import { createWorldTerrain, Viewer } from 'cesium'
import { useEffect } from 'react'
export default () => {
  useEffect(() => {
    const viewer = new Viewer('cesiumContainer', {
      terrainProvider: undefined,//createWorldTerrain(),
    })
  }, [])
  return <div id="cesiumContainer" style={{height: '100vh', width: '100vw'}} />
} 