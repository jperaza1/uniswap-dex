import { Token, ChainId, Fetcher, WETH, Route, Trade, TokenAmount, TradeType, Percent } from '@uniswap/sdk';
import { ethers } from 'ethers'
import { useState, useEffect } from 'react';
import { abi } from '@uniswap/v2-periphery/build/IUniswapV2Router02.json'

const contractAddress = "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D";
const tokenAddress = "0xa980eb9de950013a33d0801fe4b5d013691db6ce";

function App() {

  const [loading, setLoading] = useState(true);
  const [BSCN, setBSCN] = useState();
  const [pair, setPair] = useState();
  const [route, setRoute] = useState();
  const [amount, setAmount] = useState(1);
  const [trade, setTrade] = useState();
  const [signer, setSigner] = useState();
  const [uniswapRouter, setUniswapRouter] = useState();
  const [address, setAddress] = useState();
  const [transactionWaiting, setTransactionWaiting] = useState({
    isTransaction: false,
    result: null
  });

  const setUp = async () => {

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
    return { pair, BSCN, route, signer, uniswapRouter, address };

  }

  useEffect(() => {
    const init = async () => {
      const { pair, BSCN, route, signer, uniswapRouter, address } = await setUp();
      setBSCN(BSCN);
      setPair(pair);
      setRoute(route);
      setSigner(signer);
      setUniswapRouter(uniswapRouter);
      setAddress(address);
      setLoading(false);
    }

    init();

  }, []);

  useEffect(() => {
    if (BSCN && route && !loading && amount) {
      const newTrade = new Trade(route, new TokenAmount(BSCN, Number(amount)), TradeType.EXACT_OUTPUT);
      setTrade(newTrade);
    }
  }, [amount, BSCN, route, loading]);


  const buy = (event) => {
    event.preventDefault();

    const slippageTolerance = new Percent('5000', '10000');

    const amountOutMin = trade.minimumAmountOut(slippageTolerance).raw;
    const path = [WETH[BSCN.chainId].address, BSCN.address];
    const to = address;
    const deadline = Math.floor(Date.now() / 1000) + 60 * 20;
    const value = trade.inputAmount.raw;

    uniswapRouter.swapExactETHForTokens(
      ethers.BigNumber.from(String(amountOutMin)).toHexString(),
      path,
      to,
      deadline,
      { value: ethers.BigNumber.from(String(value)).toHexString() }
    ).then(async (result) => {
      setTransactionWaiting({
        ...transactionWaiting,
        isTransaction: true
      })
      const is = await result.wait();
      setTransactionWaiting({
        isTransaction: false,
        result: is.transactionHash
      });
      setAmount(1);

    });

  }

  return (
    <>
      {loading ?
        <div className="spinner-border" role="status">
          <span className="sr-only">Loading...</span>
        </div> :
        <>
          <p>1 WETH / BSCN: {route.midPrice.toSignificant(2)} BSCN</p>

          <p>1 BSCN / WETH: {route.midPrice.invert().toSignificant(2)} WETH</p>
          <form className="justify-content-center" action="" onSubmit={buy}>
            <div className="form-group row" style={{ justifyContent: "center" }}>
              <label htmlFor="count">Cantidad Boletos: </label>
              <div className="col-sm-4">
                <input
                  value={amount}
                  type="number"
                  className="form-control"
                  id="count"
                  min="1"
                  onChange={({ target: { value } }) => setAmount(value)} />
              </div>

            </div>
            <button className="btn btn-primary">Comprar</button>
          </form>
          <br />
          <p>Price impact: {trade?.priceImpact.toSignificant(5)} %</p>
          {transactionWaiting.isTransaction && transactionWaiting.result === null && (
            <div className="alert alert-primary" role="alert">
              Transacción en proceso. Esperando confirmaciones
            </div>
          )}

          {transactionWaiting.isTransaction === false && transactionWaiting.result !== null && (
            <div className="alert alert-success" role="alert">
              <p>Transacción exitosa</p>
              <a href={`https://rinkeby.etherscan.io/tx/${transactionWaiting.result}`} target="_blank">{transactionWaiting.result}</a>
            </div>
          )}

        </>

      }
    </>
  );
}

export default App;
