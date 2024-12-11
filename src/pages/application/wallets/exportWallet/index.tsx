import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import React from "react"

const IndexExportWallet = ({ selectedWallet, handleCallbacks }) => {
  return (
    <>
      <div className="p-6">
        <div className="mb-8">
          <Label className="font-bold pb-2">Enter your password:</Label>
          <Input type="password" placeholder="********" />
        </div>
        <div className="mt-3 mb-3">
          <Button type="button" variant="violet">
            EXPORT
          </Button>
        </div>
      </div>
    </>
  )
}

export default IndexExportWallet
