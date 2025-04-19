// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Scoreboard {
    struct ScoreEntry {
        string username;
        address player;
        uint256 score;
    }

    ScoreEntry[] public leaderboard;

    event ScoreSubmitted(string username, address player, uint256 score);

    function submitScore(string memory username, uint256 score) public {
        leaderboard.push(ScoreEntry(username, msg.sender, score));
        emit ScoreSubmitted(username, msg.sender, score);
    }

    function getScoreCount() public view returns (uint) {
        return leaderboard.length;
    }

    function getScore(uint index) public view returns (string memory, address, uint256) {
        require(index < leaderboard.length, "Invalid index");
        ScoreEntry memory entry = leaderboard[index];
        return (entry.username, entry.player, entry.score);
    }
}
