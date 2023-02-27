// SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.9;

contract Registry {
    struct RegistryState {
        uint256[] records;
        uint256 root;
    }

    // The owner of the contract
    address public owner;

    // The merkle tree
    uint256[] records;
    uint256[] roots;

    constructor() {
        owner = msg.sender;
    }

    // Add a new record and store the new merkle root
    function addRecord(uint256 record, uint256 new_root) public {
        require(
            msg.sender == owner,
            "Only the owner is allowed to add new records."
        );

        records.push(record);
        roots.push(new_root);
    }

    // Get the current state of the registry to build proof
    function getState() public view returns (RegistryState memory) {
        RegistryState memory state;
        state.records = records;
        state.root = roots[roots.length - 1];
        return state;
    }

    // Get all the roots
    function getRoots() public view returns (uint256[] memory) {
        return roots;
    }
}
