import LoadingIndicator from "data-base64:/assets/ios-loading.gif"

export default function Loader() {
  return (
    <div className="fixed top-0 left-0 w-screen h-screen z-10">
      <div className="w-[250px] h-[150px] flex items-center justify-center rounded-lg bg-[#000000cc] left-[50%] translate-x-[-50%] top-[50%] translate-y-[-50%] fixed">
        <img src={LoadingIndicator} className="size-[40px]" />
      </div>
    </div>
  )
}
