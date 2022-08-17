import type { NextPage } from "next";
import Head from "next/head";
import { HomeView } from "../views";

const Home: NextPage = (props) => {
  return (
    <div>
      <Head>
        <title>Sol Ink</title>
        <meta
          name="description"
          content="Sol Ink"
        />
      </Head>
      <HomeView />
    </div>
  );
};

export default Home;
