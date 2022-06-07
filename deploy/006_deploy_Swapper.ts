import { HardhatRuntimeEnvironment } from 'hardhat/types'
import { DeployFunction } from 'hardhat-deploy/types'
import { AirUSD, Swapper } from '../types'
import { waitSeconds } from '../helper/utils'

const deploySwapper: DeployFunction = async (
  hre: HardhatRuntimeEnvironment
) => {
  const { deployments, ethers, network } = hre
  const { deploy } = deployments
  const [deployer] = await ethers.getSigners()

  const airUSD = <AirUSD>await ethers.getContract('AirUSD')

  let weth = ''
  if (network.name == 'mainnet') {
    weth = '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2'
  } else {
    weth = (
      await deploy('WETH', {
        from: deployer.address,
        contract: 'MockToken',
        args: ['Mocked WETH', 'WETH'],
        log: true,
      })
    ).address

    await waitSeconds(10)
    console.log('=====> Verifing ....')
    try {
      await hre.run('verify:verify', {
        address: weth,
        contract: 'contracts/mock/MockToken.sol:MockToken',
        constructorArguments: ['Mocked WETH', 'WETH'],
      })
    } catch (_) {}
  }

  const wethSwapImpl = (
    await deploy('UniswapV2Swapper', {
      from: deployer.address,
      args: [
        '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D', // router
        weth, // tokenIn
        airUSD.address, // tokenOut
        [weth, airUSD.address], // path
      ],
      log: true,
    })
  ).address

  await deploy('Swapper', {
    from: deployer.address,
    args: [],
    log: true,
  })

  const swapper = <Swapper>await ethers.getContract('Swapper')
  await (
    await swapper.addSwapperImpl(
      weth, // tokenIn
      airUSD.address, // tokenOut
      wethSwapImpl // airUSD swap impl
    )
  ).wait()

  await waitSeconds(10)
  console.log('=====> Verifing ....')
  try {
    await hre.run('verify:verify', {
      address: swapper.address,
      contract: 'contracts/Swapper.sol:Swapper',
      constructorArguments: [],
    })
  } catch (_) {}
}

export default deploySwapper
deploySwapper.tags = ['Swapper']
deploySwapper.dependencies = ['AirUSD']