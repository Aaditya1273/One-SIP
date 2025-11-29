"use client"

import { ConnectButton } from "@mysten/dapp-kit"

export function WalletButton() {
  return (
    <ConnectButton className="!bg-[#00D382] hover:!bg-[#00BD74] !text-white !font-semibold !px-8 !py-3 !rounded-xl !shadow-sm hover:!shadow-md !transition-all" />
  )
}
