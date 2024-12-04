import dynamic from 'next/dynamic'

const Map = dynamic(() => import('../components/map'), {
  ssr: false,
})
const CesiumViewer = dynamic(() => import('../components/CesiumViewer'), {
  ssr: false,
})

export default () => {
  return <CesiumViewer />
}
