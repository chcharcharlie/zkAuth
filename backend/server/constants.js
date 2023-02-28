/* eslint-disable max-len */
const contractABI = [
  'function addRecord(uint256 record, uint256 new_root) public',
  'function getState() public view returns (tuple(uint256[],uint256))',
  'function getRoots() public view returns (uint256[])',
];

module.exports = {
  contractABI,
};
