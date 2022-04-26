import './App.css';
import { useState } from 'react';
import { Connection, PublicKey } from '@solana/web3.js';
import {
  Program, getProvider, web3
} from '@project-serum/anchor';
import idl from './cpipda.json';
import proxy from './proxy.json'
import * as anchor from '@project-serum/anchor';
import { PhantomWalletAdapter } from '@solana/wallet-adapter-wallets';
import { useWallet, WalletProvider, ConnectionProvider } from '@solana/wallet-adapter-react';
import { WalletModalProvider, WalletMultiButton } from '@solana/wallet-adapter-react-ui';
require('@solana/wallet-adapter-react-ui/styles.css');

const wallets = [
  /* view list of available wallets at https://github.com/solana-labs/wallet-adapter#wallets */
  new PhantomWalletAdapter(),
]

const { SystemProgram, Keypair } = web3;
const opts = {
  preflightCommitment: "processed"
}
//program params


//enter app
function App() {
  const [pdaStatus, setPdaStatus] = useState(null);
  const wallet = useWallet();



  async function checkPDA() {
    const provider = await getProvider()
    const [userSocialsPDA, _] = await PublicKey
      .findProgramAddress(
        [
          anchor.utils.bytes.utf8.encode("user-socials"),
          provider.wallet.publicKey.toBuffer()
        ],
        program.programId
      );
    const programID = new PublicKey(idl.metadata.address);
    const proxyProgramID = new PublicKey(proxy.metadata.address);
    const program = new Program(idl, programID, provider);
    const proxyprogram = new Program(proxy, proxyProgramID, provider)
    const account = await program.account.userInfo.fetch(userSocialsPDA)
    setPdaStatus(account)
    return account
  }

  async function setPda(name, twitter, discord) {

  }


  if (!wallet.connected) {
    /* If the user's wallet is not connected, display connect wallet button. */
    return (
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: '100px' }}>
        <WalletMultiButton />
      </div>
    )
  } else {
    return (
      <div className="App">
        <div>
          {
            !pdaStatus && (<button onClick={checkPDA}>CheckPDA</button>)
          }
          {
            pdaStatus && <button onClick={(name, twitter, discord) => setPda(name, twitter, discord)}>Set Data</button>
          }
        </div>
      </div>
    )
  }
}

export default App;
