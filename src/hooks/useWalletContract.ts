import { useEffect, useState } from "react";
import { WalletContract } from "../contracts/WalletContract";
import { useTonClient } from "./useTonClient";
import { useAsyncInitialize } from "./useAsyncInitialize";
import { Address, OpenedContract } from 'ton-core';
import { toNano } from "ton-core";
import { useTonConnect } from "./useTonConnect";

export function useWalletContract(UserAddress: Address) {
  const client = useTonClient();
  const { sender } = useTonConnect();
  
  const [contractData, setContractData] = useState<null | {
    ch_number: number;
    owner_address: Address;
    master_address: Address;
    referal_address: Address;
    eggs_number: number;
    last_calc: number;
    first_buy: number;
  }>(null);
  
  const [balance, setBalance] = useState<null | number>(null);
  
  // Initialize wallet contract
  const walletContract = useAsyncInitialize(async () => {
    if (!client || !UserAddress) return null; // Ensure UserAddress is provided
    const contract = new WalletContract(UserAddress);
    return client.open(contract) as OpenedContract<WalletContract>;
  }, [client, UserAddress]); // Add UserAddress as a dependency

  // Fetch contract data whenever walletContract or UserAddress changes.
  useEffect(() => {
    async function getValue() {
      if (!walletContract) return;

      // Clear previous state
      setContractData(null);
      setBalance(null);

      try {
        const val = await walletContract.getData();
        const balance = await walletContract.getBalance();

        setContractData({
          ch_number: val.chicken_number,
          owner_address: val.owner_address,
          master_address: val.master_address,
          referal_address: val.referal_address,
          eggs_number: val.eggs_number,
          last_calc: val.last_calc,
          first_buy: val.first_buy,
        });
        setBalance(balance.number);
      } catch (error) {
        console.error("Error fetching wallet contract data:", error);
      }
    }
    
    getValue();
  }, [walletContract]); // Re-run when walletContract changes

  return {
    wallet_contract_address: walletContract?.address.toString({ bounceable: false, testOnly: true }),
    wallet_contract_balance: balance,
    wallet_owner_address: contractData?.owner_address?.toString({ bounceable: false, testOnly: true }),
    wallet_referal_address: contractData?.referal_address?.toString({ bounceable: false, testOnly: true }),
    wallet_master_address: contractData?.master_address?.toString({ bounceable: false, testOnly: true }),
    ...contractData,
    send_buy_chicken_order: (chicken_to_buy: number) => {
      return walletContract?.send_buy_chicken_order(sender, toNano(0.1), chicken_to_buy);
    },
    send_sell_chicken_order: (chicken_to_sell: number) => {
      return walletContract?.send_sell_chicken_order(sender, toNano(0.01), chicken_to_sell);
    },
    send_recive_eggs_order: () => {
      return walletContract?.send_recive_eggs_order(sender, toNano(0.01));
    }
  };
}