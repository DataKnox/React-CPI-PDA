import './App.css';
import { useState } from 'react';
import { PublicKey } from '@solana/web3.js';
import {
  Program, AnchorProvider, web3
} from '@project-serum/anchor';
import idl from './cpipda.json';
import proxy from './proxy.json'
import * as anchor from '@project-serum/anchor';
import { PhantomWalletAdapter } from '@solana/wallet-adapter-wallets';
import { useWallet, WalletProvider, ConnectionProvider, useConnection } from '@solana/wallet-adapter-react';
import { WalletModalProvider, WalletMultiButton } from '@solana/wallet-adapter-react-ui';
require('@solana/wallet-adapter-react-ui/styles.css');

const wallets = [
  new PhantomWalletAdapter(),
]
const { SystemProgram } = web3;
const opts = {
  preflightCommitment: "processed"
}
const programID = new PublicKey(idl.metadata.address);

function App() {
  const [pdaStatus, setPdaStatus] = useState(null);
  const { connection } = useConnection();
  const wallet = useWallet();

  async function getProvider() {
    const provider = new AnchorProvider(
      connection, wallet, opts.preflightCommitment,
    );
    return provider;
  }

  async function checkPDA() {
    const provider = await getProvider()
    const program = new Program(idl, programID, provider);

    try {
      const [userSocialsPDA, _] = await PublicKey
        .findProgramAddress(
          [
            anchor.utils.bytes.utf8.encode("user-socials"),
            wallet.publicKey.toBuffer()
          ],
          programID
        );
      const account = await program.account.userInfo.fetch(userSocialsPDA)
      setPdaStatus(account)

      return account
    } catch (err) {
      console.log(err)
    }
  }

  async function initialize() {
    const [userSocialsPDA, _] = await PublicKey
      .findProgramAddress(
        [
          anchor.utils.bytes.utf8.encode("user-socials"),
          wallet.publicKey.toBuffer()
        ],
        programID
      );
    console.log(userSocialsPDA)
    const provider = await getProvider()
    console.log("provider " + provider.wallet.publicKey.toBase58())
    const program = new Program(idl, programID, provider);
    console.log("program " + SystemProgram.programId.toBase58())
    // console.log("program")
    // console.log(program)
    await program.rpc.setUserSocials({
      accounts: {
        user: provider.wallet.publicKey,
        userSocials: userSocialsPDA,
        systemProgram: SystemProgram.programId,
      },
      signers: [userSocialsPDA]
    })
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

          {
            pdaStatus ? (
              <h2>{pdaStatus}</h2>
            ) : (
              <div>
                <h3>No PDA Found. Initialize it</h3>
                <button onClick={initialize}>Initialize</button>
              </div>
            )
          }
        </div>
      </div>
    )
  }
}

const AppWithProvider = () => (
  <ConnectionProvider endpoint="http://127.0.0.1:8899">
    <WalletProvider wallets={wallets} autoConnect>
      <WalletModalProvider>
        <App />
      </WalletModalProvider>
    </WalletProvider>
  </ConnectionProvider>
)

export default AppWithProvider;