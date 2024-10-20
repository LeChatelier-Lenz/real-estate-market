import { Button, ButtonGroup, InputAdornment, Paper } from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import {useEffect, useState} from 'react';
import {HouseCoinContract, web3,RESwapContract, RealEstateContract, TokenSaleContract} from '../utils/contracts';
import AddLinkIcon from '@mui/icons-material/AddLink';
import TextField from '@mui/material/TextField';
import "./style.css";
import NFTIdList from '../components/NFTList';



const GanacheTestChainId = '0x539' // Ganache默认的ChainId = 0x539 = Hex(1337)
// TODO change according to your configuration
const GanacheTestChainName = 'REChain'  //
const GanacheTestChainRpcUrl = 'http://127.0.0.1:8546' // Ganache RPC地址

interface Order {
    listedTimestamp: string;
    price: string;
    owner: string;
}


const HouseTradePage = () => {
    const [price, setPrice] = useState(0)

    const [account, setAccount] = useState('')
    const [accountBalance, setAccountBalance] = useState(0)
    const [accountETHBalance, setAccountETHBalance] = useState(0)
    const [orderList, setOrderList] = useState<any[]>([])
    //设置状态变量 MyNFTList，用于存储用户的NFT列表
    const [MyNFTIdList, setMyNFTIdList] = useState<any[]>([])
    const [checked, setChecked] = useState([] as number[]);
    const [submitChoice,setSubmitChoice] = useState(0)
    const [PurchaseId, setPurchaseId] = useState<number | null>(null)
    const [PurchasePrice, setPurchasePrice] = useState<number | null>(null)
    const [charge, setCharge] = useState<number | null>(null)

    const isValidEthereumAddress = (address: string): boolean => {
        return /^0x[a-fA-F0-9]{40}$/.test(address);
    };


    const columns: GridColDef[] = [
        { field: 'orderId', headerName: '房屋id', width: 60 },
        { field: 'seller', headerName: '卖家', width: 200 },
        { field: 'price', headerName: '价格(HSC)', width: 150 },
        {
          field: 'listedTime',
          headerName: '挂单时间',
          type: 'string',
          width: 200,
        }
    ];

    const paginationModel = { page: 0, pageSize: 5 };

    // 表格组件,不要持续不断地渲染
    const DataTable = ()=>{
        return(
        <Paper sx={{ height: 400, width: '100%' }}>
            <DataGrid
                scrollbarSize={10}
                rows={orderList.map((item, index) => ({ id: index, ...item }))}
                columns={columns}
                initialState={{ pagination: { paginationModel } }}
                pageSizeOptions={[5, 10]}
                sx={{ border: 0 }}
            />
        </Paper>
        )
    }

    const handleToggle = (value: number) => () => {
      const currentIndex = checked.indexOf(value);
      const newChecked = [...checked];
  
      if (currentIndex === -1) {
        newChecked.push(value);
      } else {
        newChecked.splice(currentIndex, 1);
      }
  
      setChecked(newChecked);
    };


    useEffect(() => {
        // 初始化检查用户是否已经连接钱包
        // 查看window对象里是否存在ethereum（metamask安装后注入的）对象
        const initCheckAccounts = async () => {
            // @ts-ignore
            const {ethereum} = window;
            if (Boolean(ethereum && ethereum.isMetaMask)) {
                // 尝试获取连接的用户账户
                const accounts = await web3.eth.getAccounts()
                if(accounts && accounts.length) {
                    setAccount(accounts[0])
                }
            }
        }

        initCheckAccounts()
    }, [])

    useEffect(() => {
        // 查看对应账户在代币合约中的余额(HSC)
        const getAccountInfo = async () => {
            if (HouseCoinContract) {
                const ab = await HouseCoinContract.methods.balanceOf(account).call()
                // 如果返回的是数字，说明调用成功，setAccountBalance
                if (!isNaN(Number(ab))) {
                    setAccountBalance(Number(ab))
                }
            } else {
                alert('Contract not exists.')
            }
        }

        if(account !== '') {
            getAccountInfo()
        }
    }, [account])

    useEffect(() => {
        // 查看对应账户在代币合约中的余额(ETH)
        const getAccountETHBalance = async () => {
            if (web3) {
                const ab = await web3.eth.getBalance(account)
                // 如果返回的是数字，说明调用成功，setAccountBalance
                if (!isNaN(Number(ab))) {
                    setAccountETHBalance(Number(ab))
                }
            } else {
                alert('Contract not exists.')
            }
        }

        if(account !== '') {
            getAccountETHBalance()
        }
    }, [account])

    // 获取所有订单列表
    useEffect(() => {
        const getOrderList = async () => {
            if (RESwapContract) {
                const NFTIdlist:string[] = await RESwapContract.methods.getAllOrders().call()
                if (NFTIdlist) {
                    const list = []
                    for (let i = 0; i < NFTIdlist.length; i++) {
                        const order: Order = await RESwapContract.methods.getOrder(NFTIdlist[i]).call()
                        if (order)
                        {
                            //order的结构为{'listedTimestamp': '1634025600', 'price': '10000n', 'owner':'0x31231313...'},需要转换成JS对象
                            const item = {
                                orderId: NFTIdlist[i]?NFTIdlist[i].toString():'0',
                                seller: order.owner,
                                price: Number(order.price)/(10**18),
                                //时间戳转换成一般时间格式，作为字符串存储
                                listedTime: new Date(Number(order.listedTimestamp)*1000).toLocaleString()
                            }
                            // console.log('item:',item)
                            list.push(item)
                        }
                    }
                    if (list && list.length) {
                        setOrderList(list)
                    }
                }
            }else{
                alert('Contract not exists.')
            }
        }
        getOrderList()
    }, [orderList])

    // 获取用户的NFT列表
    useEffect(() => {
        const getMyNFTList = async () => {
            if(RealEstateContract){
                // console.log(account)
                //需要对地址进行有效性验证
                if (!isValidEthereumAddress(account)) {
                    console.error("Invalid Ethereum address", account);
                    return; // 提前返回或处理错误
                }
                const NFTIdList = await RealEstateContract.methods.tokensOf(account).call()
                if(NFTIdList){
                    //获取的结果是[3n, 4n, 9n ...]的形式，需要转换成[3, 4, 9 ...]的形式
                    const list = NFTIdList.map((item: any) => item.toString())
                    setMyNFTIdList(list)
                }
            }
        }
        getMyNFTList()
    }, [MyNFTIdList, account])

    // 根据用户的操作，执行挂单，撤单，更新信息的操作
    const handleSubmit = async () => {   
        if(submitChoice === 1){
            //挂单
            if(checked.length > 1 ){
                //不能同时挂多个订单
                alert('只能同时挂一个订单');
                console.log(checked);
            }else if(checked.length === 0){
                alert('请选择一个房产');
            }
            // 执行挂单操作
            const tokenId = checked[0];
            const priceHSC = price*10**18;
            if(RealEstateContract && RESwapContract){
                try{
                    const RESwapaddr = RESwapContract.options.address;
                    // console.log('RESwapaddr:',RESwapaddr);
                    // console.log('tokenId:',tokenId);
                    // console.log('priceHSC:',priceHSC);
                    const res0 = await RealEstateContract.methods.approve(RESwapaddr,tokenId).send({from:account});
                    console.log('res0:',res0)
                    const res = await RESwapContract.methods.list(tokenId,priceHSC).send({from:account});
                    console.log('res:',res)
                }
                catch(e){
                    console.log('error:',e)
                }
                console.log('submitChoice:',submitChoice)
            }
        }else if(submitChoice === 2){
            //撤单
            if (checked.length === 0) {
                alert('请选择一个房产');
            }
            if (RealEstateContract && RESwapContract) {
                try{
                    for (let i = 0; i < checked.length; i++) {
                        const res = await RESwapContract.methods.revoke(checked[i]).send({from:account});
                        console.log('res:',res)
                    }
                }catch(e){
                    console.log('error:',e)
                }
            }
            console.log('submitChoice:',submitChoice)
        }else if(submitChoice === 3){
            //更新信息
            if (checked.length > 1) {
                alert('只能同时更新一个订单');
                console.log(checked);
            }else if(checked.length === 0){
                alert('请选择一个房产');
            } 
            if (RealEstateContract && RESwapContract) {
                const tokenId = checked[0];
                const priceHSC = price*10**18;  
                try{
                    const res = await RESwapContract.methods.update(tokenId,priceHSC).send({from:account});
                    console.log('res:',res)
                }catch(e){
                    console.log('error:',e)
                }
            }
            console.log('submitChoice:',submitChoice)
        }
        setSubmitChoice(0);
    }

    const handleChargeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setCharge(Number(event.target.value));
    }

    const handlePurchasePriceChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setPurchasePrice(Number(event.target.value));
    }

    const handlePurchaseChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setPurchaseId(Number(event.target.value));
    }

    const handlePriceChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setPrice(Number(event.target.value));
    }

    const onClickConnectWallet = async () => {
        // 查看window对象里是否存在ethereum（metamask安装后注入的）对象
        // @ts-ignore
        const {ethereum} = window;
        if (!Boolean(ethereum && ethereum.isMetaMask)) {
            alert('MetaMask is not installed!');
            return
        }

        try {
            // 如果当前小狐狸不在本地链上，切换Metamask到本地测试链
            if (ethereum.chainId !== GanacheTestChainId) {
                const chain = {
                    chainId: GanacheTestChainId, // Chain-ID
                    chainName: GanacheTestChainName, // Chain-Name
                    rpcUrls: [GanacheTestChainRpcUrl], // RPC-URL
                };

                try {
                    // 尝试切换到本地网络
                    await ethereum.request({method: "wallet_switchEthereumChain", params: [{chainId: chain.chainId}]})
                } catch (switchError: any) {
                    // 如果本地网络没有添加到Metamask中，添加该网络
                    if (switchError.code === 4902) {
                        await ethereum.request({ method: 'wallet_addEthereumChain', params: [chain]
                        });
                    }
                }
            }

            // 小狐狸成功切换网络了，接下来让小狐狸请求用户的授权
            await ethereum.request({method: 'eth_requestAccounts'});
            // 获取小狐狸拿到的授权用户列表
            const accounts = await ethereum.request({method: 'eth_accounts'});
            // 如果用户存在，展示其account，否则显示错误信息
            setAccount(accounts[0] || 'Not able to get accounts');
        } catch (error: any) {
            alert(error.message)
        }
    }


    const confirmCharge = async () => {
        if (charge === null || charge <= 0) {
            alert('请输入正确的充值金额');
            return;
        }
        if (HouseCoinContract) {
            try{
                //转化为整形
                const value = charge;
                const res = await web3.eth.sendTransaction({from:account,to:TokenSaleContract.options.address,value:web3.utils.toWei(value,'ether'),gas:210000});
                console.log('res:',res)
            }catch(e){
                console.log('error:',e)
                alert("充值失败");
                return; 
            }
            alert('充值成功');
            console.log('charge:',charge)
        }
    }

    const confirmPurchase = async () => {
        if (PurchaseId === null || PurchaseId < 0) {
            alert('请输入目标房屋id');
            return;
        }
        if (RealEstateContract && RESwapContract) {
            try{
                //先检验地址是否有效
                if (!isValidEthereumAddress(account)) {
                    console.error("Invalid Ethereum address", account);
                    return; // 提前返回或处理错误
                }
                const price = PurchasePrice?PurchasePrice:0;
                const res = await RESwapContract.methods.purchase(PurchaseId,web3.utils.toWei(price,"ether")).send({from:account});
                console.log('res:',res)
            }catch(e){
                console.log('error:',e)
            }
        }
    }

    return (
        <div className='container'>

        <div className='main'>
            <h1>House Trade</h1>
            <div className='account'>
                {account === '' && <Button variant="contained" endIcon={<AddLinkIcon />} onClick={onClickConnectWallet}>连接钱包</Button>}
                {/* 用户名可能过长，提供展开操作 */}
                {/* <div>当前用户：{account === '' ? '无用户连接' : account}</div> */}
                <div><b>当前用户：</b>{account === '' ? '无用户连接' : account}</div>
                <div><b>HousieCoin(豪斯币)</b>余额：<b>{account === '' ? 0 : accountBalance/(10**18 )} </b> HSC </div>
                <div className='balance'>
                    <div className='charge'>
                        <TextField
                            value={charge}
                            onChange={handleChargeChange}
                            id="outlined-basic"
                            label="充值金额"
                            variant="outlined"
                            size="small"
                            type="number"
                            slotProps={{
                                input: {
                                  startAdornment: <InputAdornment position="start">HSC</InputAdornment>,
                                },
                              }}
                        />
                        <Button variant="contained" size = "small" style={{"margin":"10px"}} disabled={charge===null || charge <=0} onClick={confirmCharge} >充值</Button>
                    </div>
                    
                </div>
                <div><b>Ethereum(以太坊)</b>余额：<b>{account === '' ? 0 : accountETHBalance/(10**18)} </b> ETH</div>
            </div>
            {/* 在页面上展示用户的NFT列表（只有Id） */}
            <div className='my-nft-list'>
                <h2>我的NFT列表</h2>
                {/* 若对应账号没有NFT内容，则显示文字：“您的房屋资产为空” 并且保证列表过长时可以滑动*/}
                {   MyNFTIdList.length === 0 ? <div style={{color:'grey'}}>您的房屋资产为空</div> :
                        <NFTIdList NFTIdlist={MyNFTIdList} checked={checked} handleToggle={handleToggle}/>
                }
            </div>
            <div className='order-operation'>
                {/* 下方提供操作：挂单，撤单，更新信息；根据checked来指定要进行操作的项 */}
                <ButtonGroup variant="contained"  color="success" aria-label="Basic button group" >
                    <Button onClick={()=>setSubmitChoice(1)}>挂单</Button>
                    <Button onClick={()=>setSubmitChoice(2)} >撤单</Button>
                    <Button onClick={()=>setSubmitChoice(3)}>更新信息</Button>
                </ButtonGroup>
                <TextField 
                    value = {price}
                    onChange={handlePriceChange}
                    id="price" 
                    label="挂单价格" 
                    variant="filled" 
                    required 
                    type="number"
                    margin='normal'
                    size='small'
                    slotProps={{
                        input: {
                          startAdornment: <InputAdornment position="start">HSC</InputAdornment>,
                        },
                      }}
                />
                <Button 
                    variant="contained" 
                    onClick={handleSubmit} 
                    style={{"width":"250px"}}
                    disabled={submitChoice === 0 || price < 0 ||(price === 0 && submitChoice !== 2) || checked.length === 0}
                >确认操作</Button>
            </div>
        </div>
        <div className='side'>
            <div className='order-list'>
                <h2>交易市场订单列表</h2>
                      <DataTable />
            </div>
            <div className="purchase">
                <p style={{"margin":"10px"}}>选择要购买的房屋</p>
                <TextField 
                    style={{"margin":"10px"}}
                    value = {PurchaseId}
                    onChange={handlePurchaseChange}
                    id="price" 
                    label="目标房屋id" 
                    variant="filled" 
                    required 
                    type="number"   
                    margin='normal'
                    size='small'
                />
                <TextField 
                    style={{"margin":"10px"}}
                    value = {PurchasePrice}
                    onChange={handlePurchasePriceChange}
                    id="price" 
                    label="购买价" 
                    variant="filled" 
                    required 
                    type="number"   
                    margin='normal'
                    size='small'
                />
                <Button variant="contained" onClick={confirmPurchase} style={{"margin":"10px"}}>确认</Button>
            </div>
        </div>
    </div>
    );
}

export default HouseTradePage;