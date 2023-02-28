const contractABI = [
  "function addRecord(uint256 record, uint256 new_root) public",
  "function getState() public view returns (tuple(uint256[],uint256))",
  "function getRoots() public view returns (uint256[])",
]

// Add the production backend URL here or default to local URL
const BACKEND_URL = "" || "localhost:3001";

module.exports = {
  contractABI,
  BACKEND_URL,
}