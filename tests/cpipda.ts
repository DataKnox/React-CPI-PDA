import * as anchor from '@project-serum/anchor';
import { Program } from '@project-serum/anchor';
import { Keypair, PublicKey } from '@solana/web3.js';
import { expect } from 'chai';
import { Cpipda } from '../target/types/cpipda'
import { Proxy } from '../target/types/proxy'

describe("cpipda", () => {

  // Configure the client to use the local cluster.
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.Cpipda as Program<Cpipda>;
  const proxyprogram = anchor.workspace.Proxy as Program<Proxy>;

  it("Cpid!", async () => {
    const [userSocialsPDA, _] = await PublicKey
      .findProgramAddress(
        [
          anchor.utils.bytes.utf8.encode("user-socials"),
          provider.wallet.publicKey.toBuffer()
        ],
        program.programId
      );
    console.log("prov key: " + provider.wallet.publicKey.toBase58())
    console.log("PDA: " + userSocialsPDA)

    await program.methods
      .setUserSocials()
      .accounts({
        user: provider.wallet.publicKey,
        userSocials: userSocialsPDA
      })
      .rpc()
    console.log("account set")
    expect((await program.account.userInfo.fetch(userSocialsPDA)).name).to.equal("empty");
    // Add your test here.
    await proxyprogram.methods
      .updateSocials(
        "Knox", "knox_trades", "knoxtrades#2784"
      )
      .accounts({
        user: provider.wallet.publicKey,
        userSocials: userSocialsPDA,
        cpipdaProgram: program.programId
      })
      .rpc();

    expect((await program.account.userInfo.fetch(userSocialsPDA)).name).to.equal("Knox");
  });
});
