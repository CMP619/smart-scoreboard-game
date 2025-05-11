// ABI (Application Binary Interface): javascript - smart contract communication interface
const contractABI = [
    {
        "inputs": [
            {
                "internalType": "string",
                "name": "username",
                "type": "string"
            },
            {
                "internalType": "uint256",
                "name": "score",
                "type": "uint256"
            }
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
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "index",
                "type": "uint256"
            }
        ],
        "name": "getScore",
        "outputs": [
            {
                "internalType": "string",
                "name": "",
                "type": "string"
            },
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": false,
                "internalType": "string",
                "name": "username",
                "type": "string"
            },
            {
                "indexed": false,
                "internalType": "address",
                "name": "player",
                "type": "address"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "score",
                "type": "uint256"
            }
        ],
        "name": "ScoreSubmitted",
        "type": "event"
    }
];

const contractAddress = '0x2e24A8c1d3e5DCfaE572C1036473223e8435837A';  // Our contract address

let provider, signer, contract;

async function initializeBlockchain() {
    if (typeof window.ethereum === 'undefined') {
    alert("MetaMask is not installed! Please install it to connect to the blockchain.");
    return;
    }
    try {
        provider = new ethers.providers.Web3Provider(window.ethereum, "any");
        await provider.send("eth_requestAccounts", []);
        signer = provider.getSigner(0);
        contract = new ethers.Contract(contractAddress, contractABI, signer);
        console.log('Blockchain objects initialized.');
    } catch (error) {
        console.error('Blockchain initialization failed:', error);
    }
}



async function displayBlockchainScores() {
    const blockchainScoresElement = document.getElementById("blockchainScores");
    blockchainScoresElement.innerHTML = '';  // önceki skorları temizle

    if (contract) {
        try {
            // Blockchain'den toplam skor sayısını al
            const scoreCount = await contract.getScoreCount();
            console.log('Blockchain score count:', scoreCount.toString());

            const scores = [];
            for (let i = 0; i < scoreCount; i++) {
                // Blockchain'den her skoru al
                const [username, , score] = await contract.getScore(i);
                scores.push({ name: username, score: parseInt(score.toString()) });
            }

            // Skorları azalan sıraya göre sırala
            scores.sort((a, b) => b.score - a.score);

            // İlk 10 skoru listele
            for (let i = 0; i < Math.min(scores.length, 10); i++) {
                const item = scores[i];
                const listItem = document.createElement('li');
                const playerName = item.name.trim().padEnd(20, '.');
                const scoreStr = item.score.toString().padStart(6, '0');
                listItem.innerHTML = `${playerName} ${scoreStr}`;
                blockchainScoresElement.appendChild(listItem);
            }
        } catch (error) {
            console.error('Blockchain read error:', error);

            blockchainScoresElement.innerHTML = `
            <li class="error-message" style="color: red;">    Unable to Fetch Scores</li>
        `;
            // Blockchain okunamıyorsa localStorage'dan yükle
            loadLocalScores();
        }
    } else {
        // Eğer kontrat yoksa, localStorage'dan yükle
        console.log("contract error");
        loadLocalScores();
    }
}

async function submitScore(playerName, score) {
    try {
        try {
            // Blockchain işlemini timeout ile sarıyoruz
            const txPromise = contract.submitScore(playerName, score);
    
            // 10 saniyede cevap gelmezse timeout
            const tx = await Promise.race([
                txPromise,
                new Promise((_, reject) => setTimeout(() => reject(new Error('Blockchain timeout')), 10000))
            ]);
    
            await tx.wait(); // İşlemi bekle
            console.log('Score submitted to blockchain!');
        } catch (error) {
            console.error('Blockchain error, proceeding with local save:', error);
        }

        // Skoru localStorage'a kaydet
        let localScores = JSON.parse(localStorage.getItem('scores')) || [];
        localScores.push({ name: playerName, score: score });
        localStorage.setItem('scores', JSON.stringify(localScores));

        // Güncel skorları göster
        await displayBlockchainScores();
        displayLocalScores();

    } catch (error) {
        console.error('Error submitting score:', error);
    }
}
