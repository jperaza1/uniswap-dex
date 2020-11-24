import { useState, useEffect } from 'react';
import { ethers } from 'ethers'
import { abi } from '@uniswap/v2-periphery/build/IUniswapV2Router02.json'
import { Token, ChainId, Fetcher, WETH, Route } from '@uniswap/sdk';



const useSetUp = () => {
    const [BSCN, setBSCN] = useState();
    const [pair, setPair] = useState();
    const [route, setRoute] = useState();
    const [signer, setSigner] = useState();
    const [uniswapRouter, setUniswapRouter] = useState();
    const [address, setAddress] = useState();
    const [loading, setLoading] = useState(true);

    const SetUp = async () => {
        const contractAddress = `${process.env.REACT_APP_CONTRACT_ADDRESS}`;
        const tokenAddress = `${process.env.REACT_APP_TOKEN_ADDRESS}`;

        await window.ethereum.request({ method: 'eth_requestAccounts' });
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();

        const uniswapRouter = new ethers.Contract(contractAddress, abi, provider).connect(signer);
        const address = await signer.getAddress();

        const BSCN = new Token(
            ChainId.RINKEBY,
            tokenAddress,
            0,
            'BSCN',
            provider);
        const pair = await Fetcher.fetchPairData(BSCN, WETH[BSCN.chainId], provider);
        const route = new Route([pair], WETH[BSCN.chainId]);

        setBSCN(BSCN);
        setPair(pair);
        setRoute(route);
        setSigner(signer);
        setUniswapRouter(uniswapRouter);
        setAddress(address);
        setLoading(false);
    }

    useEffect(() => {
        SetUp();
    }, [])


    return { BSCN, pair, route, signer, uniswapRouter, address, loading, SetUp };
}

export default useSetUp;