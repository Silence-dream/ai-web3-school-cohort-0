// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title DeFiAdvisor
 * @dev AI Agent × DeFi 策略师 — 链上合约层
 * @notice 这是 Hackathon MVP 的核心合约，负责：
 *   1. 存储 AI Agent 分析的策略建议
 *   2. 记录用户的策略执行历史
 *   3. 提供链上数据查询接口
 */
contract DeFiAdvisor {
    // ============ 数据结构 ============

    struct Strategy {
        uint256 id;
        address user;
        string strategyType;  // "lending", "liquidity", "staking"
        string tokenPair;     // "USDC-ETH", "ETH-USDT"
        string recommendation; // AI Agent 生成的建议
        uint256 timestamp;
        bool executed;
    }

    struct UserProfile {
        address wallet;
        uint256 strategyCount;
        uint256 totalExecuted;
    }

    // ============ 状态变量 ============

    uint256 public strategyCounter;
    address public owner;

    mapping(uint256 => Strategy) public strategies;
    mapping(address => UserProfile) public users;
    mapping(address => uint256[]) public userStrategies;

    // ============ 事件 ============

    event StrategyCreated(
        uint256 indexed id,
        address indexed user,
        string strategyType,
        string tokenPair
    );

    event StrategyExecuted(uint256 indexed id, address indexed user);

    // ============ 修饰器 ============

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call");
        _;
    }

    // ============ 构造函数 ============

    constructor() {
        owner = msg.sender;
    }

    // ============ 核心函数 ============

    /**
     * @notice AI Agent 调用此函数，将分析的策略上链
     */
    function createStrategy(
        string memory _strategyType,
        string memory _tokenPair,
        string memory _recommendation
    ) external returns (uint256) {
        strategyCounter++;

        strategies[strategyCounter] = Strategy({
            id: strategyCounter,
            user: msg.sender,
            strategyType: _strategyType,
            tokenPair: _tokenPair,
            recommendation: _recommendation,
            timestamp: block.timestamp,
            executed: false
        });

        users[msg.sender].wallet = msg.sender;
        users[msg.sender].strategyCount++;
        userStrategies[msg.sender].push(strategyCounter);

        emit StrategyCreated(strategyCounter, msg.sender, _strategyType, _tokenPair);

        return strategyCounter;
    }

    /**
     * @notice 用户确认执行某条策略
     */
    function executeStrategy(uint256 _id) external {
        require(strategies[_id].id != 0, "Strategy not found");
        require(strategies[_id].user == msg.sender, "Not your strategy");
        require(!strategies[_id].executed, "Already executed");

        strategies[_id].executed = true;
        users[msg.sender].totalExecuted++;

        emit StrategyExecuted(_id, msg.sender);
    }

    // ============ 查询函数 ============

    /**
     * @notice 获取用户的所有策略 ID
     */
    function getUserStrategies(address _user) external view returns (uint256[] memory) {
        return userStrategies[_user];
    }

    /**
     * @notice 获取策略详情
     */
    function getStrategy(uint256 _id) external view returns (Strategy memory) {
        require(strategies[_id].id != 0, "Strategy not found");
        return strategies[_id];
    }
}
