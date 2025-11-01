"use client";
import { useEffect, useState } from "react";

type Props = {
  address: string | null;
  onConnect: (address: string) => void;
  onDisconnect: () => void;
};

export default function MetaMaskConnect({ address, onConnect, onDisconnect }: Props) {
  const [hasProvider, setHasProvider] = useState(false);

  useEffect(() => {
    setHasProvider(typeof (window as any).ethereum !== "undefined");
  }, []);

  async function connect() {
    if (!hasProvider) return;
    try {
      const accounts = await (window as any).ethereum.request({ method: "eth_requestAccounts" });
      if (accounts && accounts[0]) onConnect(accounts[0]);
    } catch (err) {
      console.error("connect error", err);
    }
  }

  return (
    <div>
      {address ? (
        <div className="flex items-center gap-3">
          <div className="text-sm font-mono text-slate-700">{address.slice(0, 6)}...{address.slice(-4)}</div>
          <button onClick={onDisconnect} className="px-3 py-2 bg-red-50 text-red-600 border border-red-100 rounded-md hover:bg-red-100">Disconnect</button>
        </div>
      ) : (
        <div>
          {hasProvider ? (
            <button onClick={connect} className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-cyan-500 text-white rounded-md shadow hover:opacity-95">Connect MetaMask</button>
          ) : (
            <a className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-md text-sm hover:bg-slate-100" href="https://metamask.io/" target="_blank" rel="noreferrer">Install MetaMask</a>
          )}
        </div>
      )}
    </div>
  );
}
