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

const opts = {
  preflightCommitment: "processed"
}
const programID = new PublicKey("6UBeznVw8PWyhVPa9Sk99nMTR8C5GUt2k535ov4Pqvfg");
const proxyprogID = new PublicKey("HKbTE9zSwQFx1vaXGxSe7EyFqdrmVyiEyeeuLWVwPo7W")
function App() {
  const [pdaStatus, setPdaStatus] = useState(null);
  const [buttonDisabled, setButtonDisabled] = useState(true)
  const [pdaName, setPdaName] = useState(null);
  const [pdaTwitter, setPdaTwitter] = useState(null);
  const [pdaDiscord, setPdaDiscrd] = useState(null);
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
      if (account) {
        setPdaName(account.name)
        setPdaTwitter(account.twitter)
        setPdaDiscrd(account.discord)
      }
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

    const provider = await getProvider()
    const program = new Program(idl, programID, provider);
    await program.methods.setUserSocials()
      .accounts({
        user: provider.wallet.publicKey,
        userSocials: userSocialsPDA,
      })
      .rpc()
    await checkPDA();
  }

  async function setPda(name, twitter, discord) {
    console.log("fired off setPda")
    console.log(name + " " + twitter + " " + discord)
    const [userSocialsPDA, _] = await PublicKey
      .findProgramAddress(
        [
          anchor.utils.bytes.utf8.encode("user-socials"),
          wallet.publicKey.toBuffer()
        ],
        programID
      );
    const provider = await getProvider()
    const program = new Program(idl, programID, provider);
    const proxyProg = new Program(proxy, proxyprogID, provider)
    await proxyProg.methods.updateSocials(name, twitter, discord)
      .accounts({
        user: provider.wallet.publicKey,
        userSocials: userSocialsPDA,
        cpipdaProgram: program.programId
      })
      .rpc();
    await checkPDA();
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
            pdaStatus ? (
              <div>
                <h2>PDA Found</h2>
                <h3>Name: {pdaName}</h3>
                <h3>Twitter: {pdaTwitter}</h3>
                <h3>Discord: {pdaDiscord}</h3>
                <form onSubmit={async event => {
                  event.preventDefault()
                  const { name, twitter, discord, fieldset } = event.target.elements
                  const newName = name.value
                  const newTwitter = twitter.value
                  const newDiscord = discord.value
                  fieldset.disabled = true

                  try {
                    await setPda(newName, newTwitter, newDiscord)
                  } catch (err) {
                    console.log(err)
                  }
                }}>
                  <fieldset id="fieldset">
                    <label
                      htmlFor="greeting"
                      style={{
                        display: 'block',
                        color: 'var(--gray)',
                        marginBottom: '0.5em'
                      }}
                    >
                      Change Name
                    </label>
                    <div style={{ display: 'flex' }}>
                      <input
                        autoComplete="off"
                        defaultValue="empty"
                        id="name"
                        onChange={e => setButtonDisabled(e.target.value === "empty")}
                        style={{ flex: 1 }}
                      />

                    </div>
                    <label
                      htmlFor="greeting"
                      style={{
                        display: 'block',
                        color: 'var(--gray)',
                        marginBottom: '0.5em'
                      }}
                    >
                      Change Twitter
                    </label>
                    <div style={{ display: 'flex' }}>
                      <input
                        autoComplete="off"
                        defaultValue="empty"
                        id="twitter"
                        onChange={e => setButtonDisabled(e.target.value === "empty")}
                        style={{ flex: 1 }}
                      />

                    </div>
                    <label
                      htmlFor="greeting"
                      style={{
                        display: 'block',
                        color: 'var(--gray)',
                        marginBottom: '0.5em'
                      }}
                    >
                      Change Discord
                    </label>
                    <div style={{ display: 'flex' }}>
                      <input
                        autoComplete="off"
                        defaultValue="empty"
                        id="discord"
                        onChange={e => setButtonDisabled(e.target.value === "empty")}
                        style={{ flex: 1 }}
                      />

                    </div>
                  </fieldset>
                  <button
                    disabled={buttonDisabled}
                    style={{ borderRadius: '0 5px 5px 0' }}
                  >
                    Save
                  </button>
                </form>
              </div>
            ) : (
              <div>
                <h3>No PDA Found. Initialize it</h3>
                <button onClick={initialize}>Initialize</button>
              </div>
            )
          }

          {
            !pdaStatus && (<button onClick={checkPDA}>CheckPDA</button>)
          }
        </div>
      </div >
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