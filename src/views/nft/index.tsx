import { Metaplex, MetaplexFile, bundlrStorage, BundlrStorageDriver, toMetaplexFileFromBrowser, walletAdapterIdentity } from "@metaplex-foundation/js";
import { useState, useEffect } from "react";
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { RequestAirdrop } from '../../components/RequestAirdrop';
import useUserSOLBalanceStore from '../../stores/useUserSOLBalanceStore';

export const NFTView = () => {
  const [nftUri, setNftUri] = useState('');
  const [arweave, setArweave] = useState('');
  const [name, setName] = useState('');
  const [symbol, setSymbol] = useState('');
  const [nftLink, setNftLink] = useState('');


  const wallet = useWallet();
  const { connection } = useConnection();

  const balance = useUserSOLBalanceStore((s) => s.balance)
  const { getUserSOLBalance } = useUserSOLBalanceStore()

  useEffect(() => {
    if (wallet.publicKey) {
      console.log(wallet.publicKey.toBase58())
      getUserSOLBalance(wallet.publicKey, connection)
    }
  }, [wallet.publicKey, connection, getUserSOLBalance])

  const metaplex = Metaplex.make(connection)
                           .use(walletAdapterIdentity(wallet))
                           .use(bundlrStorage());
  // const storage = metaplex.storage().driver() as BundlrStorageDriver;
  
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
      <div className='text-center text-xl mt-8 mb-8'>
          <h2>
            Your photo has been uploaded to Arweave <b><a href={arweave} target='_blank'>here</a></b>
          </h2>
      </div> 
    )
  }

  const showNftLink = () => {
    return (
      <div className='text-center text-xl mt-8 mb-8'>
        <h2>
          View your minted NFT on the Solana Explorer <b><a href={nftLink} target='_blank'>here</a></b>
        </h2>
      </div>
    )
  }

  const mintNFT = () => {
    return (
      <div className="text-center container mt-5">
        <form>
          <label> Name: </label>
          <input className='mr-5' type="text" required
                    onChange={(e) => setName(e.target.value)}/>
          <label> Symbol: </label>
          <input type="text" required
                    onChange={(e) => setSymbol(e.target.value)}/>
        </form>
        <button
          className="group w-60 mt-8 btn animate-pulse disabled:hidden bg-gradient-to-r from-[#9945FF] to-[#14F195] hover:from-pink-500 hover:to-yellow-500 ... "
          onClick={mint}
        >
          <span className="block group-disabled:hidden" > 
              Mint NFT 
          </span>
        </button>
      </div>
    )
  }

  async function mint() {
    const { nft } = await metaplex
      .nfts()
      .create({
          uri: nftUri,
          name: name,
          sellerFeeBasisPoints: 500, // Represents 5.00%.
          symbol: symbol
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
        <h4 className="md:w-full text-center text-slate-300 my-4 text-2xl">
          <p>Upload any photo and mint it as an NFT on Solana!</p>
        </h4>
        <RequestAirdrop />
        {wallet && <p>SOL Balance: {(balance || 0).toLocaleString()}</p>}
        <div className="text-center mt-5">
          <input type='file' onChange={upload}/>
        </div>
        {arweave && showArweave()}
        {nftUri && mintNFT()}
        {nftLink && showNftLink()}
      </div>
    </div>
  );
};
