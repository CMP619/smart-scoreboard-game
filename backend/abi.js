module.exports = [
    {
      "inputs": [
        { "internalType": "string", "name": "username", "type": "string" },
        { "internalType": "uint256", "name": "score", "type": "uint256" }
      ],
      "name": "submitScore",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "getScoreCount",
      "outputs": [
        { "internalType": "uint256", "name": "", "type": "uint256" }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        { "internalType": "uint256", "name": "index", "type": "uint256" }
      ],
      "name": "getScore",
      "outputs": [
        { "internalType": "string", "name": "", "type": "string" },
        { "internalType": "address", "name": "", "type": "address" },
        { "internalType": "uint256", "name": "", "type": "uint256" }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "anonymous": false,
      "inputs": [
        { "indexed": false, "internalType": "string", "name": "username", "type": "string" },
        { "indexed": false, "internalType": "address", "name": "player", "type": "address" },
        { "indexed": false, "internalType": "uint256", "name": "score", "type": "uint256" }
      ],
      "name": "ScoreSubmitted",
      "type": "event"
    }
  ];
  