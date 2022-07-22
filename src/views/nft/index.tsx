import { Metaplex, MetaplexFile, bundlrStorage, BundlrStorageDriver, toMetaplexFileFromBrowser, walletAdapterIdentity } from "@metaplex-foundation/js";
import { Connection, clusterApiUrl, Keypair } from "@solana/web3.js";
import { FC, useState, useCallback } from "react";
import { useWallet, useConnection } from '@solana/wallet-adapter-react';

export const NFTView = () => {
  const wallet = useWallet();
  // const [file, setFile] = useState<MetaplexFile>();
  const [nftUri, setNftUri] = useState('');
  const [arweave, setArweave] = useState('')
  const [nftLink, setNftLink] = useState('');
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
  
  async function upload(e) {
    const browserFile: File = e.target.files[0];
    const file: MetaplexFile = await toMetaplexFileFromBrowser(browserFile);
    // const price = await metaplex.storage().getUploadPriceForFile(file);
    // await storage.fund(price);

    const { uri, metadata } = await metaplex
      .nfts()
      .uploadMetadata({
          image: file,
      })
      .run();
    setNftUri(uri);
    setArweave(metadata.image)
  }

  const showArweave = () => {
    return (
      <div className='text-center'>
          <h2>
            Your photo has been uploaded to Arweave <b><a href={arweave} target='_blank'>here</a></b>
          </h2>
      </div> 
    )
  }

  const showNftLink = () => {
    return (
      <div className='text-center'>
        <h2>
          View your minted NFT on the Solana Explorer <b><a href={nftLink} target='_blank'>here</a></b>
        </h2>
      </div>
    )
  }

  async function mint() {
    const { nft } = await metaplex
      .nfts()
      .create({
          uri: nftUri,
          name: "My NFT",
          sellerFeeBasisPoints: 500, // Represents 5.00%.
      })
      .run(); 

    const address = nft.mintAddress.toString()
    setNftLink(`https://explorer.solana.com/address/${address}?cluster=devnet`)
  }

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
          <input type='file' onChange={upload}/>
        </div>
        {arweave && showArweave()}
        <button
          className="group w-60 m-2 btn animate-pulse disabled:hidden bg-gradient-to-r from-[#9945FF] to-[#14F195] hover:from-pink-500 hover:to-yellow-500 ... "
          onClick={mint} disabled={!nftUri || nftLink != ''}
        >
          <span className="block group-disabled:hidden" > 
              Mint NFT 
          </span>
        </button>
        {nftLink && showNftLink()}
      </div>
    </div>
  );
};
