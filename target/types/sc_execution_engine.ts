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
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "InvalidSigner",
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
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "InvalidSigner",
      "msg": "Provided account is not signer"
    }
  ]
};
