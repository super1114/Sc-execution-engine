export type ScExecutionEngine = {
  "version": "0.1.0",
  "name": "sc_execution_engine",
  "instructions": [
    {
      "name": "executeTransaction",
      "accounts": [
        {
          "name": "payer",
          "isMut": false,
          "isSigner": true
        }
      ],
      "args": [
        {
          "name": "instructions",
          "type": {
            "vec": {
              "defined": "TxInstruction"
            }
          }
        }
      ]
    },
    {
      "name": "createPool",
      "accounts": [
        {
          "name": "sender",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "base",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "vestPool",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "mint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "maxSigners",
          "type": "u8"
        },
        {
          "name": "amount",
          "type": "u64"
        },
        {
          "name": "lockingPeriod",
          "type": "i64"
        },
        {
          "name": "minSign",
          "type": "u8"
        }
      ]
    },
    {
      "name": "deposit",
      "accounts": [
        {
          "name": "sender",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "vestPool",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "mint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "userTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "vaultTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "associatedTokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "nominateReceiver",
      "accounts": [
        {
          "name": "sender",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "vestPool",
          "isMut": true,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "receiver",
          "type": "publicKey"
        }
      ]
    },
    {
      "name": "claim",
      "accounts": [
        {
          "name": "receiver",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "base",
          "isMut": false,
          "isSigner": false,
          "docs": [
            "CHECKED: this account is used only as seed"
          ]
        },
        {
          "name": "vestPool",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "mint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "userTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "vaultTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "associatedTokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    }
  ],
  "accounts": [
    {
      "name": "vestPool",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "base",
            "type": "publicKey"
          },
          {
            "name": "sender",
            "type": "publicKey"
          },
          {
            "name": "recipient",
            "type": "publicKey"
          },
          {
            "name": "mint",
            "type": "publicKey"
          },
          {
            "name": "amount",
            "type": "u64"
          },
          {
            "name": "lockedPeriod",
            "type": "i64"
          },
          {
            "name": "depositTime",
            "type": "i64"
          },
          {
            "name": "minSign",
            "type": "u8"
          },
          {
            "name": "status",
            "type": {
              "defined": "VestStatus"
            }
          },
          {
            "name": "signers",
            "type": {
              "vec": "publicKey"
            }
          }
        ]
      }
    }
  ],
  "types": [
    {
      "name": "TxInstruction",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "programId",
            "type": "publicKey"
          },
          {
            "name": "keys",
            "type": {
              "vec": {
                "defined": "TxAccountMeta"
              }
            }
          },
          {
            "name": "data",
            "type": "bytes"
          }
        ]
      }
    },
    {
      "name": "TxAccountMeta",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "pubkey",
            "type": "publicKey"
          },
          {
            "name": "isSigner",
            "type": "bool"
          },
          {
            "name": "isWritable",
            "type": "bool"
          }
        ]
      }
    },
    {
      "name": "VestStatus",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "Created"
          },
          {
            "name": "Deposited"
          },
          {
            "name": "Nominated"
          },
          {
            "name": "Claimed"
          }
        ]
      }
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "InvalidSender",
      "msg": "Provided account is not signer"
    },
    {
      "code": 6001,
      "name": "ZeroVestAmount",
      "msg": "Provided account is not signer"
    },
    {
      "code": 6002,
      "name": "InvalidLockingPeriod",
      "msg": "Provided account is not signer"
    },
    {
      "code": 6003,
      "name": "InsufficientSigners",
      "msg": "Provided account is not signer"
    },
    {
      "code": 6004,
      "name": "InvalidMint",
      "msg": "Provided account is not signer"
    },
    {
      "code": 6005,
      "name": "InvalidReceiver",
      "msg": "Provided account is not signer"
    },
    {
      "code": 6006,
      "name": "InvalidClaimTime",
      "msg": "Provided account is not signer"
    },
    {
      "code": 6007,
      "name": "InvalidVestingStatus",
      "msg": "Provided account is not signer"
    },
    {
      "code": 6008,
      "name": "InvalidBaseKey",
      "msg": "Provided account is not signer"
    }
  ]
};

export const IDL: ScExecutionEngine = {
  "version": "0.1.0",
  "name": "sc_execution_engine",
  "instructions": [
    {
      "name": "executeTransaction",
      "accounts": [
        {
          "name": "payer",
          "isMut": false,
          "isSigner": true
        }
      ],
      "args": [
        {
          "name": "instructions",
          "type": {
            "vec": {
              "defined": "TxInstruction"
            }
          }
        }
      ]
    },
    {
      "name": "createPool",
      "accounts": [
        {
          "name": "sender",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "base",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "vestPool",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "mint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "maxSigners",
          "type": "u8"
        },
        {
          "name": "amount",
          "type": "u64"
        },
        {
          "name": "lockingPeriod",
          "type": "i64"
        },
        {
          "name": "minSign",
          "type": "u8"
        }
      ]
    },
    {
      "name": "deposit",
      "accounts": [
        {
          "name": "sender",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "vestPool",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "mint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "userTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "vaultTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "associatedTokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "nominateReceiver",
      "accounts": [
        {
          "name": "sender",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "vestPool",
          "isMut": true,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "receiver",
          "type": "publicKey"
        }
      ]
    },
    {
      "name": "claim",
      "accounts": [
        {
          "name": "receiver",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "base",
          "isMut": false,
          "isSigner": false,
          "docs": [
            "CHECKED: this account is used only as seed"
          ]
        },
        {
          "name": "vestPool",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "mint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "userTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "vaultTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "associatedTokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    }
  ],
  "accounts": [
    {
      "name": "vestPool",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "base",
            "type": "publicKey"
          },
          {
            "name": "sender",
            "type": "publicKey"
          },
          {
            "name": "recipient",
            "type": "publicKey"
          },
          {
            "name": "mint",
            "type": "publicKey"
          },
          {
            "name": "amount",
            "type": "u64"
          },
          {
            "name": "lockedPeriod",
            "type": "i64"
          },
          {
            "name": "depositTime",
            "type": "i64"
          },
          {
            "name": "minSign",
            "type": "u8"
          },
          {
            "name": "status",
            "type": {
              "defined": "VestStatus"
            }
          },
          {
            "name": "signers",
            "type": {
              "vec": "publicKey"
            }
          }
        ]
      }
    }
  ],
  "types": [
    {
      "name": "TxInstruction",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "programId",
            "type": "publicKey"
          },
          {
            "name": "keys",
            "type": {
              "vec": {
                "defined": "TxAccountMeta"
              }
            }
          },
          {
            "name": "data",
            "type": "bytes"
          }
        ]
      }
    },
    {
      "name": "TxAccountMeta",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "pubkey",
            "type": "publicKey"
          },
          {
            "name": "isSigner",
            "type": "bool"
          },
          {
            "name": "isWritable",
            "type": "bool"
          }
        ]
      }
    },
    {
      "name": "VestStatus",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "Created"
          },
          {
            "name": "Deposited"
          },
          {
            "name": "Nominated"
          },
          {
            "name": "Claimed"
          }
        ]
      }
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "InvalidSender",
      "msg": "Provided account is not signer"
    },
    {
      "code": 6001,
      "name": "ZeroVestAmount",
      "msg": "Provided account is not signer"
    },
    {
      "code": 6002,
      "name": "InvalidLockingPeriod",
      "msg": "Provided account is not signer"
    },
    {
      "code": 6003,
      "name": "InsufficientSigners",
      "msg": "Provided account is not signer"
    },
    {
      "code": 6004,
      "name": "InvalidMint",
      "msg": "Provided account is not signer"
    },
    {
      "code": 6005,
      "name": "InvalidReceiver",
      "msg": "Provided account is not signer"
    },
    {
      "code": 6006,
      "name": "InvalidClaimTime",
      "msg": "Provided account is not signer"
    },
    {
      "code": 6007,
      "name": "InvalidVestingStatus",
      "msg": "Provided account is not signer"
    },
    {
      "code": 6008,
      "name": "InvalidBaseKey",
      "msg": "Provided account is not signer"
    }
  ]
};
