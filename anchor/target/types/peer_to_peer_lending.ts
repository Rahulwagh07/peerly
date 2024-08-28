/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/peer_to_peer_lending.json`.
 */
export type PeerToPeerLending = {
  "address": "24TJfVSRZbifpwYphPRoWfhmcGm7ZGm7SYjXqqaFhzCR",
  "metadata": {
    "name": "peerToPeerLending",
    "version": "0.1.0",
    "spec": "0.1.0",
    "description": "Created with Anchor"
  },
  "instructions": [
    {
      "name": "fundLoan",
      "discriminator": [
        50,
        221,
        51,
        13,
        3,
        142,
        116,
        215
      ],
      "accounts": [
        {
          "name": "lender",
          "writable": true,
          "signer": true
        },
        {
          "name": "borrower",
          "writable": true
        },
        {
          "name": "loan",
          "writable": true
        },
        {
          "name": "lendingPool",
          "writable": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": []
    },
    {
      "name": "getAccountDetails",
      "discriminator": [
        213,
        33,
        222,
        24,
        61,
        155,
        49,
        247
      ],
      "accounts": [
        {
          "name": "lendingPool"
        }
      ],
      "args": [
        {
          "name": "account",
          "type": "pubkey"
        }
      ],
      "returns": {
        "defined": {
          "name": "accountDetails"
        }
      }
    },
    {
      "name": "getAllLoans",
      "discriminator": [
        31,
        124,
        215,
        197,
        39,
        169,
        52,
        79
      ],
      "accounts": [
        {
          "name": "lendingPool"
        }
      ],
      "args": [],
      "returns": {
        "vec": {
          "defined": {
            "name": "loan"
          }
        }
      }
    },
    {
      "name": "repayLoan",
      "discriminator": [
        224,
        93,
        144,
        77,
        61,
        17,
        137,
        54
      ],
      "accounts": [
        {
          "name": "borrower",
          "writable": true,
          "signer": true
        },
        {
          "name": "lender",
          "writable": true
        },
        {
          "name": "loan",
          "writable": true
        },
        {
          "name": "lendingPool",
          "writable": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": []
    },
    {
      "name": "requestLoan",
      "discriminator": [
        120,
        2,
        7,
        7,
        1,
        219,
        235,
        187
      ],
      "accounts": [
        {
          "name": "borrower",
          "writable": true,
          "signer": true
        },
        {
          "name": "loan",
          "writable": true,
          "signer": true
        },
        {
          "name": "lendingPool",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  108,
                  101,
                  110,
                  100,
                  105,
                  110,
                  103,
                  95,
                  112,
                  111,
                  111,
                  108
                ]
              }
            ]
          }
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "amount",
          "type": "u64"
        },
        {
          "name": "mortgageCid",
          "type": "string"
        },
        {
          "name": "dueDate",
          "type": "i64"
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "loan",
      "discriminator": [
        20,
        195,
        70,
        117,
        165,
        227,
        182,
        1
      ]
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "invalidAmount",
      "msg": "Invalid loan amount"
    },
    {
      "code": 6001,
      "name": "invalidDueDate",
      "msg": "Invalid due date"
    },
    {
      "code": 6002,
      "name": "lenderCannotBorrow",
      "msg": "Lender cannot borrow"
    },
    {
      "code": 6003,
      "name": "borrowerCannotLend",
      "msg": "Borrower cannot lend"
    },
    {
      "code": 6004,
      "name": "loanNotFundable",
      "msg": "Loan is not in a fundable state"
    },
    {
      "code": 6005,
      "name": "loanNotRepayable",
      "msg": "Loan is not in a repayable state"
    },
    {
      "code": 6006,
      "name": "unauthorizedBorrower",
      "msg": "Unauthorized borrower"
    },
    {
      "code": 6007,
      "name": "loanNotDefaulted",
      "msg": "Loan is not defaulted"
    },
    {
      "code": 6008,
      "name": "loanNotOverdue",
      "msg": "Loan is not overdue"
    }
  ],
  "types": [
    {
      "name": "accountDetails",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "accountType",
            "type": {
              "defined": {
                "name": "accountType"
              }
            }
          },
          {
            "name": "loans",
            "type": {
              "vec": {
                "defined": {
                  "name": "loan"
                }
              }
            }
          }
        ]
      }
    },
    {
      "name": "accountType",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "none"
          },
          {
            "name": "lender"
          },
          {
            "name": "borrower"
          }
        ]
      }
    },
    {
      "name": "loan",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "address",
            "type": "pubkey"
          },
          {
            "name": "borrower",
            "type": "pubkey"
          },
          {
            "name": "lender",
            "type": "pubkey"
          },
          {
            "name": "amount",
            "type": "u64"
          },
          {
            "name": "mortgageCid",
            "type": "string"
          },
          {
            "name": "dueDate",
            "type": "i64"
          },
          {
            "name": "status",
            "type": {
              "defined": {
                "name": "loanStatus"
              }
            }
          },
          {
            "name": "requestDate",
            "type": "i64"
          },
          {
            "name": "fundDate",
            "type": {
              "option": "i64"
            }
          },
          {
            "name": "repayDate",
            "type": {
              "option": "i64"
            }
          }
        ]
      }
    },
    {
      "name": "loanStatus",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "requested"
          },
          {
            "name": "funded"
          },
          {
            "name": "closed"
          },
          {
            "name": "defaulted"
          }
        ]
      }
    }
  ]
};
