# 用法：在根目录下执行 ./redeploy.sh
# 作者：@lechatelierlenz
echo "deploy.ps1 running..."
echo "[Checking for deployed contracts]"
$status = npx hardhat ignition status chain-1337
# 检查是否有部署的合约
$deployed = $status -match "Deployed Addresses"
if ($deployed) {
    # 清除所有合约
    npx hardhat ignition wipe chain-1337 RESwapModule#RESwap
    npx hardhat ignition wipe chain-1337 RealEstateModule#RealEstate
    npx hardhat ignition wipe chain-1337 TokenModule#HousieCoin
    echo "[Cleared all contracts]"
} else {
    # 没有合约需要清除
    echo "[No contracts to clear]"
}
# 随后部署合约
npx hardhat ignition deploy .\ignition\modules\RESwap.ts --network ganache 
