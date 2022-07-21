import { Metaplex, MetaplexFile, bundlrStorage, BundlrStorageDriver, toMetaplexFileFromBrowser, walletAdapterIdentity } from "@metaplex-foundation/js";
import { Connection, clusterApiUrl, Keypair } from "@solana/web3.js";
import { FC, useState, useCallback } from "react";
import { useWallet, useConnection } from '@solana/wallet-adapter-react';

export const NFTView = () => {
  const wallet = useWallet();
  const { connection } = useConnection();
  const metaplex = Metaplex.make(connection)
                           .use(walletAdapterIdentity(wallet))
                           .use(bundlrStorage());
  const storage = metaplex.storage().driver() as BundlrStorageDriver;
  
  metaplex.use(bundlrStorage({
    address: 'https://devnet.bundlr.network',
    providerUrl: 'https://api.devnet.solana.com',
    timeout: 60000,
  }));
  
  async function execute(e) {
    const browserFile: File = e.target.files[0];
    const file: MetaplexFile = await toMetaplexFileFromBrowser(browserFile);
    console.log(file)
    try {
      const tx_1 = (await storage.bundlr()).fund(100000000);
      console.log(tx_1)
    } catch (error) {
      console.error(error)
    }
    
    const { uri, metadata } = await metaplex
      .nfts()
      .uploadMetadata({
          name: "My NFT",
          image: file,
      })
      .run();

    console.log(metadata.image)
    console.log(uri)
    const { nft } = await metaplex
      .nfts()
      .create({
          uri: uri,
          name: "My NFT",
          sellerFeeBasisPoints: 500, // Represents 5.00%.
      })
      .run(); 

    console.log(nft)
    const imageUrl = nft.json.image;
    console.log(imageUrl)
    const mint = nft.mintAddress;
    const found = await metaplex.nfts().findByMint(mint).run();
    console.log(found.json.image)
  }

  // async function onSelect() {

  // }

  // async function onUpload() {

  // }

  // async function onMint() {

  // }

  return (
    <div className="md:hero mx-auto p-4">
      <div className="md:hero-content flex flex-col">
        <h1 className="text-center text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-tr from-[#9945FF] to-[#14F195]">
          Mint an NFT
        </h1>
        <h4 className="md:w-full text-center text-slate-300 my-2">
          <p>Upload any photo and mint it as an NFT on Solana!</p>
        </h4>
        <div className="text-center">
          <input type='file' onChange={execute}/>
        </div>
      </div>
    </div>
  );
  // return (
  //   <div className="md:hero mx-auto p-4">
  //     <div className="md:hero-content flex flex-col">
  //       <h1 className="text-center text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-tr from-[#9945FF] to-[#14F195]">
  //         Mint an NFT
  //       </h1>
  //       <h4 className="md:w-full text-center text-slate-300 my-2">
  //         <p>Upload any photo and mint it as an NFT on Solana!</p>
  //       </h4>
  //       <div className="text-center">
  //         <input type='file' onChange={execute}/>
  //       </div>
  //       <button
  //         className="group w-60 m-2 btn animate-pulse disabled:hidden bg-gradient-to-r from-[#9945FF] to-[#14F195] hover:from-pink-500 hover:to-yellow-500 ... "
  //         onClick={onUpload} disabled={!browserFile}
  //       >
  //         <span className="block group-disabled:hidden" > 
  //             Upload Photo 
  //         </span>
  //       </button>
  //       <button
  //         className="group w-60 m-2 btn animate-pulse disabled:hidden bg-gradient-to-r from-[#9945FF] to-[#14F195] hover:from-pink-500 hover:to-yellow-500 ... "
  //         onClick={onMint} disabled={!uri}
  //       >
  //         <span className="block group-disabled:hidden" > 
  //             Mint NFT 
  //         </span>
  //       </button>
  //     </div>
  //   </div>
  // );


};
