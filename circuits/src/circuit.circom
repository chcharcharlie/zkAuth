pragma circom 2.0.0;

include "../node_modules/circomlib/circuits/poseidon.circom";

// if s == 0 returns [in[0], in[1]]
// if s == 1 returns [in[1], in[0]]
template DualMux() {
    signal input in[2];
    signal input s;
    signal output out[2];

    s * (1 - s) === 0;
    out[0] <== (in[1] - in[0])*s + in[0];
    out[1] <== (in[0] - in[1])*s + in[1];
}

template Merkle(levels) {
  signal input self;
  signal input path[levels];
  signal input pathIndices[levels];
  signal output root;

  component hashers[levels];
  component selectors[levels];

  for (var i = 0; i < levels; i ++) {
    selectors[i] = DualMux();
    selectors[i].in[0] <== i == 0 ? self : hashers[i - 1].out;
    selectors[i].in[1] <== path[i];
    selectors[i].s <== pathIndices[i];

    hashers[i] = Poseidon(2);
    hashers[i].inputs[0] <== selectors[i].out[0];
    hashers[i].inputs[1] <== selectors[i].out[1];
  }

  root <== hashers[levels - 1].out;
}

template ProofToMerkle(levels) {
  signal input emailHash;
  signal input appPublicId;
  signal input randomizer;
  signal input verificationCode;
  signal input path[levels];
  signal input pathIndices[levels];
  signal output root;
  signal output userId;
  signal output nullifier;

  component userIdHasher = Poseidon(2);
  userIdHasher.inputs[0] <== emailHash;
  userIdHasher.inputs[1] <== appPublicId;

  component statementHasher = Poseidon(3);
  statementHasher.inputs[0] <== emailHash;
  statementHasher.inputs[1] <== verificationCode;
  statementHasher.inputs[2] <== randomizer;

  component nullifierHasher = Poseidon(2);
  nullifierHasher.inputs[0] <== emailHash;
  nullifierHasher.inputs[1] <== verificationCode;

  component merkle = Merkle(levels);
  merkle.self <== statementHasher.out;
  for (var i = 0; i < levels; i ++) {
    merkle.path[i] <== path[i];
    merkle.pathIndices[i] <== pathIndices[i];
  }

  root <== merkle.root;
  userId <== userIdHasher.out;
  nullifier <== nullifierHasher.out;
}

component main {public [appPublicId]} = ProofToMerkle(8);