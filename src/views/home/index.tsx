import { Metaplex, MetaplexFile, bundlrStorage, toMetaplexFileFromBrowser, walletAdapterIdentity, OperationHandlerMissingError } from "@metaplex-foundation/js";
import { useState, useEffect, useRef } from "react";
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { RequestAirdrop } from '../../components/RequestAirdrop';
import { useNetworkConfiguration } from '../../contexts/NetworkConfigurationProvider';
import { FileUploader } from "react-drag-drop-files";
import useUserSOLBalanceStore from '../../stores/useUserSOLBalanceStore';

export const HomeView = () => {
  // Initialize properties
  const [name, setName] = useState('');
  const [symbol, setSymbol] = useState('');
  const [description, setDescription] = useState('');
  const [attributes, setAttributes] = useState([]);
  const [file, setFile] = useState(null);
  const [nftLink, setNftLink] = useState('');
  
  // Configuration
  const bottomRef = useRef(null);
  const wallet = useWallet();
  const { connection } = useConnection();
  const balance = useUserSOLBalanceStore((s) => s.balance)
  const { getUserSOLBalance } = useUserSOLBalanceStore()
  const { networkConfiguration } = useNetworkConfiguration();

  useEffect(() => {
    bottomRef.current?.scrollIntoView({behavior: 'smooth'});
  });

  useEffect(() => {
    if (wallet.publicKey) {
      console.log(wallet.publicKey.toBase58())
      getUserSOLBalance(wallet.publicKey, connection)
    }
  }, [wallet.publicKey, connection, getUserSOLBalance])

  const metaplex = Metaplex.make(connection)
                           .use(walletAdapterIdentity(wallet))
                           .use(bundlrStorage());
  
  if (networkConfiguration == 'mainnet-beta') {
    metaplex.use(bundlrStorage({
      providerUrl: 'https://api.mainnet-beta.solana.com',
      timeout: 60000,
    }));
  } else {
    metaplex.use(bundlrStorage({
      address: 'https://devnet.bundlr.network',
      providerUrl: 'https://api.devnet.solana.com',
      timeout: 60000,
    }));
  }

  // Upload photo

  const upload = (file) => {
    setFile(file);

    // Set current date attribute
    const now = new Date();
    console.log(now.toLocaleDateString())
    setAttributes([{"trait_type": 'Date', 'value': now.toLocaleDateString()}])
  };

  // Mint NFT
  const mintRef = useRef(null);
  async function mint() {
    const mFile: MetaplexFile = await toMetaplexFileFromBrowser(file);

    // Upload to Arweave
    const { uri } = await metaplex
      .nfts()
      .uploadMetadata({
          image: mFile,
          description: description,
          attributes: attributes,
      })
      .run();
    
    // Mint
    const { nft } = await metaplex
      .nfts()
      .create({
          uri: uri,
          name: name,
          symbol: symbol,
          sellerFeeBasisPoints: 500, // represents 5.00%
      })
      .run(); 

    const address = nft.mintAddress.toString()
    setNftLink(`https://explorer.solana.com/address/${address}?cluster=${networkConfiguration}`)
  }

  const mintNFT = () => {
    return (
      <div className="text-center mt-5">
        <div className="image-container">
          <img src={URL.createObjectURL(file)} width="300"/>
        </div>
        <div className="mt-8 grid grid-cols-2">
          <div className="form-control">
            <label className="label">
              <span className="label-text text-xl text-slate-300">Name:</span>
            </label> 
            <input type="text" className="text bg-slate-300 text-xl input input-bordered"
                  onChange={(e) => setName(e.target.value)} required/>
          </div>
          <div className="form-control">
            <label className="label">
              <span className="label-text text-xl text-slate-300">Symbol:</span>
            </label> 
            <input type="text" className="text bg-slate-300 text-xl input input-bordered"
                  onChange={(e) => setSymbol(e.target.value)}/>
          </div>
          <div className="form-control col-span-2">
            <label className="label">
              <span className="label-text text-xl text-slate-300">Description:</span>
            </label> 
            <textarea className="textarea h-16 bg-slate-300 text-xl"
                  onChange={(e) => setDescription(e.target.value)}/>
          </div>
          {/* <div className="form-control col-span-2">
            <label className="label">
              <span className="label-text text-xl text-slate-300">Attributes:</span>
            </label> 
            <div>
              <input type="text" className="text bg-slate-300 text-xl input input-bordered"
                    placeholder="Trait type"/>
              <input type="text" className="text bg-slate-300 text-xl input input-bordered"
                    placeholder="Trait value"/>
            </div>
          </div> */}
        </div>
        <button
          className="group w-60 mt-5 btn animate-pulse disabled:hidden bg-gradient-to-r from-[#9945FF] to-[#14F195] hover:from-pink-500 hover:to-yellow-500 ... "
          type="submit" onClick={mint}
        >
          <span className="block group-disabled:hidden"> 
              Mint NFT 
          </span>
        </button>
      </div>
    )
  }
  

  // Show NFT Link
  const showNftLink = () => {
    return (
      <div className='text-center text-xl mt-8 mb-8'>
        <h2 className="text-2xl">
          View your minted NFT on the Solana Explorer <b><a href={nftLink} target='_blank'>here</a></b> and in your wallet!
        </h2>
      </div>
    )
  }

  return (
    <div className="container md:hero mx-auto p-4">
      <div className="container md:hero-content flex flex-col">
        <h1 className="text-center text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-tr from-[#9945FF] to-[#14F195]">
          Mint an NFT
        </h1>
        <h4 className="md:w-full text-center text-slate-300 my-4 text-2xl">
          <p>Upload a photo and mint it as an NFT on Solana!</p>
        </h4>
        {networkConfiguration != "mainnet-beta" && <div className="text-center"><RequestAirdrop/></div>}
        {wallet && <h4 className="md:w-full text-center text-slate-300 mb-4 text-xl">SOL Balance: {(balance || 0).toLocaleString()}</h4>}
        <FileUploader className="text-center" handleChange={upload} name="file" />
        {file && mintNFT()}
        {nftLink && showNftLink()}
      </div>
      <div ref={bottomRef} />
    </div>
  );
};
