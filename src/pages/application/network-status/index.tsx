import { Banknote, Blocks, Hourglass, Wallet } from "lucide-react"
import { useTheme } from "next-themes"
import React, { useEffect, useState } from "react"

const IndexNetworkStatus = () => {
  const { theme } = useTheme()

  return (
    <>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <div
            className={
              theme == "light"
                ? "aspect-video w-full rounded-lg bg-muted/50 text-center"
                : "aspect-video w-full rounded-lg bg-[#405887] text-center text-white"
            }>
            <div className="flex items-center justify-center pt-4">
              <Blocks size="70" />
            </div>
            <div className="mt-4">
              <span className="text-base">Total Blocks</span>
              <br />
              <span className="text-lg font-bold">1,028,123</span>
            </div>
            <br />
          </div>
        </div>
        <div>
          <div
            className={
              theme == "light"
                ? "aspect-video w-full rounded-lg bg-muted/50 text-center"
                : "aspect-video w-full rounded-lg bg-[#405887] text-center text-white"
            }>
            <div className="flex items-center justify-center pt-4">
              <Wallet size="70" />
            </div>
            <div className="mt-4">
              <span className="text-base">Total Addresses</span>
              <br />
              <span className="text-lg font-bold">1,028,123</span>
            </div>
            <br />
          </div>
        </div>
        <div>
          <div
            className={
              theme == "light"
                ? "aspect-video w-full rounded-lg bg-muted/50 text-center"
                : "aspect-video w-full rounded-lg bg-[#405887] text-center text-white"
            }>
            <div className="flex items-center justify-center pt-4">
              <Hourglass size="70" />
            </div>
            <div className="mt-4">
              <span className="text-base">VG Block Intervals</span>
              <br />
              <span className="text-lg font-bold">1,028,123</span>
            </div>
            <br />
          </div>
        </div>
        <div>
          <div
            className={
              theme == "light"
                ? "aspect-video w-full rounded-lg bg-muted/50 text-center"
                : "aspect-video w-full rounded-lg bg-[#405887] text-center text-white"
            }>
            <div className="flex items-center justify-center pt-4">
              <Banknote size="70" />
            </div>
            <div className="mt-4">
              <span className="text-base">Last Gas Fee</span>
              <br />
              <span className="text-lg font-bold">1,028,123</span>
            </div>
            <br />
          </div>
        </div>
      </div>
    </>
  )
}

export default IndexNetworkStatus
