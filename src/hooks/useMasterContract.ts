import { useEffect, useState } from "react";
import { Master } from "../contracts/Master";
import { useTonClient } from "./useTonClient";
import { useAsyncInitialize } from "./useAsyncInitialize";
import { Address, OpenedContract } from 'ton-core';
import { toNano } from "ton-core";
import { useTonConnect } from "./useTonConnect";
// export const referal_address : Address = Address.parse ("EQAtl3w8VMCTDG1_acX4DoDOXSP1mdvWpIWHsvGigtfShx9n");

export function useMasterContract() {

  const wallet_owner_address1 = Address.parse("0QDbP6nFnSSS1dk9EHL5G_bYG0cIqPBwv1eje7uOGiVZcno8")
  const wallet_referal_address1 = Address.parse("EQDkzMK31Gn9nad9m1jnhEXXl8nKHJCf4006iyP6lSNyGs2C")

  const [future_user_wallet_address, setFuture_user_wallet_address] = useState<null | { wc_addressss: Address; }>();

  const client = useTonClient();
  const { sender } = useTonConnect();
  const [contractData, setContractData] = useState<null | { owner_address: Address; }>();
  const [balance, setBalance] = useState<null | number>(0);
  // const [referal_address ,setReferal_address] = useState<null |{wallet_contract_referal : Address}>();
  const masterContract = useAsyncInitialize(async () => {
    if (!client) return;
    const contract = new Master(
      Address.parse("0QDkzMK31Gn9nad9m1jnhEXXl8nKHJCf4006iyP6lSNyGivN") // replace with your master address 
    );
    return client.open(contract) as OpenedContract<Master>;
  }, [client]);

  useEffect(() => {
    async function getValue() {
      if (!masterContract) return;
      setContractData(null);
      setFuture_user_wallet_address(null);
      const val = await masterContract.getData();
      const balance = await masterContract.getBalance();
      const wc = await masterContract.getWalletAddress(wallet_owner_address1, wallet_referal_address1);
      setContractData({ owner_address: val.owner_sender });
      setBalance(balance.number);
      setFuture_user_wallet_address({ wc_addressss: wc.wallet_contract_address });
    }
    getValue();
  }, [masterContract]);
  
  return {
    master_contract_address: masterContract?.address.toString({bounceable: false, testOnly: true}),
    master_contract_balance: balance,
    ...future_user_wallet_address,
    ...contractData,
    sendDeploy: () => {
      return masterContract?.sendDeploy(sender, toNano(0.02));
    },
    sendDeployByMaster: (wc_referal: Address) => {
      return masterContract?.sendDeployByMaster(sender, toNano(0.02), wc_referal);
    },
    get_user_wallet_address: (wc_owner: Address, wc_referal: Address) => {
      return masterContract?.getWalletAddress(wc_owner, wc_referal);
    },

  };
}
