import "./App.css";
import { TonConnectButton, useTonAddress } from "@tonconnect/ui-react";
import { useMasterContract } from "./hooks/useMasterContract";
import { useWalletContract } from "./hooks/useWalletContract";
import { useTonConnect } from "./hooks/useTonConnect";
import { fromNano, address, Address } from "ton-core";
import { useState, useEffect } from 'react';
import WebApp from "@twa-dev/sdk";

declare global {
  interface Window {
    Telegram: any;
  }
}

function App() {
  const [page_n, setPageN] = useState(0);
  const { connected } = useTonConnect();
  const owner_address = useTonAddress();
  const [referal_address, setReferal_address] = useState("EQDkzMK31Gn9nad9m1jnhEXXl8nKHJCf4006iyP6lSNyGs2C");
  const [walletContractAddress, setWalletContractAddress] = useState("kQCC8qWDzWBLEP-qpQEWSZvNp_I8fm9IVnedG_9T-n-9D-W6");

  useEffect(() => {
    const walletAddressFromUrl = window.Telegram.WebApp.initDataUnsafe.start_param;
    if (walletAddressFromUrl) {
      setReferal_address(walletAddressFromUrl);
    }
  }, []);

  const { master_contract_address, sendDeployByMaster, master_contract_balance, wc_addressss } = useMasterContract(
    Address.parse("0QDbP6nFnSSS1dk9EHL5G_bYG0cIqPBwv1eje7uOGiVZcno8"),
    Address.parse(referal_address),
  );

  useEffect(() => {
    if (wc_addressss) {
      setWalletContractAddress(wc_addressss.toString());
    }
  }, [wc_addressss]);

  const { ch_number, eggs_number, wallet_contract_balance, wallet_contract_address, send_buy_chicken_order, wallet_owner_address, wallet_referal_address, wallet_master_address, send_sell_chicken_order, send_recive_eggs_order } = useWalletContract(Address.parse(walletContractAddress));

  return (
    <div>
      <div className="header">
        <div className="left">
          <TonConnectButton />
        </div>
        <div className="right">
          <img src="./logo.png" alt="Logo" className="logo" />
        </div>
      </div>
      <nav className="menu">
        <ul>
          <li><button onClick={() => setPageN(0)}>Home</button></li>
          <li><button onClick={() => setPageN(1)}>Master Contract</button></li>
          <li><button onClick={() => setPageN(2)}>Wallet Contract</button></li>
        </ul>
      </nav>
      {page_n === 0 && (
        <>
          <h1>Welcome to Chicken Farm</h1>
          {!connected && <p>Please Log in To Continue</p>}
          {connected && (
            <>
              <label>Referral address: {referal_address}</label><br /><br />
              <button className='button' onClick={() => { sendDeployByMaster(address(referal_address))}}>Create Wallet Contract</button><br />
              <div>
                <label>Deployed contract at: <a>{wc_addressss && <div>{wc_addressss.toString()}</div>}</a></label>
              </div>
              <button onClick={() => {
                
                setPageN(2);
              }}>Open Wallet Contract</button>
              <button onClick={() => {
              WebApp.showAlert((wc_addressss + ' ---- ' + walletContractAddress))

               }}>show alert</button>
              <p>owner : {owner_address}</p>
            </>
          )}
        </>
      )}
      {page_n === 1 && (
        <div>
          <h1>Master Contract</h1>
          <b>Master contract Address</b>
          <div className='Hint'>{master_contract_address}</div>
          <b>Master contract Balance</b>
          {master_contract_balance && <div className='Hint'>{fromNano(master_contract_balance)} ton</div>}
        </div>
      )}
      {page_n === 2 && (
        <div>
          <h1>Wallet Contract</h1>
          <button onClick={() => { }} >catch data</button>
          <div className='Card'>
            <div><b>Wallet contract balance</b></div>
            {wallet_contract_balance && <div className='Hint'>{fromNano(wallet_contract_balance)} ton</div>}
            <div><b>Wallet contract Address</b></div>
            <div className='Hint'>{wallet_contract_address}</div>
            <div><b>Wallet owner Address</b></div>
            <div className='Hint'>{wallet_owner_address}</div>
            <div><b>Wallet referral Address</b></div>
            <div className='Hint'>{wallet_referal_address}</div>
            <div><b>Wallet master Address</b></div>
            <div className='Hint'>{wallet_master_address}</div>
            <div><b>Wallet eggs number</b></div>
            {eggs_number && <div className='Hint'>{fromNano(eggs_number)} ton</div>}
            <div><b>Wallet chicken number</b></div>
            <div className='Hint'>{ch_number}</div>
            {connected && page_n === 2 && (
              <a onClick={() => { send_buy_chicken_order(1); }}>buy 1 chicken</a>
            )}<br />
            {connected && (
              <a onClick={() => { send_sell_chicken_order(1); }}>sell 1 chicken</a>
            )}<br />
            {connected && (
              <a onClick={() => { send_recive_eggs_order(); }}>get earned eggs</a>
            )}
          </div>
          <div>
            <button onClick={() => {
              const telegramShareUrl = `https://t.me/Ch_farm_bot/ChickenFarm?startapp=${wallet_contract_address}`;
              navigator.share({
                title: 'Chicken Farm Wallet Contract',
                text: 'Check out this wallet contract address!',
                url: telegramShareUrl,
              });
            }}>Share Wallet Address</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
