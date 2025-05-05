import LoadingIndicator from "data-base64:/assets/ios-loading.gif"

export default function MessageBox(label: string = null) {
  return (
    <div className="fixed top-0 left-0 w-screen h-screen z-10">
      <div className="max-w-[250px] max-h-[150px] flex items-center justify-center rounded-lg bg-[#000000cc] left-[50%] translate-x-[-50%] top-[50%] translate-y-[-50%] fixed flex flex-col items-center justify-center gap-1 py-4 px-8">
        <img src={LoadingIndicator} className="size-[40px]" />
        {label ? <span>Loading...</span> : <span>{label}</span>}
      </div>
    </div>
  )
}
