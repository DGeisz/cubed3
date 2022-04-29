export type Cubed = {
  "version": "0.0.0",
  "name": "cubed",
  "instructions": [
    {
      "name": "initialize",
      "accounts": [
        {
          "name": "cubedMaster",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "defaultCollection",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "owner",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "masterBump",
          "type": "u8"
        },
        {
          "name": "defaultCollectionName",
          "type": {
            "array": [
              "u8",
              32
            ]
          }
        },
        {
          "name": "collectionBump",
          "type": "u8"
        }
      ]
    },
    {
      "name": "buyCanvas",
      "accounts": [
        {
          "name": "artist",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "cubedMaster",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "collection",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "canvas",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "mint",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
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
          "name": "masterBump",
          "type": "u8"
        },
        {
          "name": "canvasBump",
          "type": "u8"
        },
        {
          "name": "mintBump",
          "type": "u8"
        },
        {
          "name": "epochTime",
          "type": "i64"
        },
        {
          "name": "collectionNameBytes",
          "type": {
            "array": [
              "u8",
              32
            ]
          }
        },
        {
          "name": "collectionBump",
          "type": "u8"
        }
      ]
    },
    {
      "name": "createCollection",
      "accounts": [
        {
          "name": "owner",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "cubedMaster",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "collection",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "masterBump",
          "type": "u8"
        },
        {
          "name": "canvasBump",
          "type": "u8"
        },
        {
          "name": "epochTime",
          "type": "i64"
        },
        {
          "name": "collectionBump",
          "type": "u8"
        },
        {
          "name": "nameBytes",
          "type": {
            "array": [
              "u8",
              32
            ]
          }
        },
        {
          "name": "maxSize",
          "type": "i16"
        },
        {
          "name": "public",
          "type": "bool"
        }
      ]
    },
    {
      "name": "buyCubes",
      "accounts": [
        {
          "name": "buyer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "cubedMaster",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "canvas",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "masterBump",
          "type": "u8"
        },
        {
          "name": "canvasBump",
          "type": "u8"
        },
        {
          "name": "epochTime",
          "type": "i64"
        },
        {
          "name": "numCubes",
          "type": "u16"
        }
      ]
    },
    {
      "name": "placeCube",
      "accounts": [
        {
          "name": "artist",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "canvas",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "canvasBump",
          "type": "u8"
        },
        {
          "name": "epochTime",
          "type": "i64"
        },
        {
          "name": "algo",
          "type": {
            "array": [
              "u8",
              512
            ]
          }
        },
        {
          "name": "x",
          "type": "u16"
        },
        {
          "name": "y",
          "type": "u16"
        }
      ]
    },
    {
      "name": "removeCube",
      "accounts": [
        {
          "name": "artist",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "canvas",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "canvasBump",
          "type": "u8"
        },
        {
          "name": "epochTime",
          "type": "i64"
        },
        {
          "name": "x",
          "type": "u16"
        },
        {
          "name": "y",
          "type": "u16"
        }
      ]
    },
    {
      "name": "mintMosaic",
      "accounts": [
        {
          "name": "artist",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "cubedMaster",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "canvas",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "tokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "tokenMetadataProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "metadata",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "mint",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
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
          "name": "masterBump",
          "type": "u8"
        },
        {
          "name": "canvasBump",
          "type": "u8"
        },
        {
          "name": "mintBump",
          "type": "u8"
        },
        {
          "name": "tokenBump",
          "type": "u8"
        },
        {
          "name": "epochTime",
          "type": "i64"
        }
      ]
    },
    {
      "name": "listMosaic",
      "accounts": [
        {
          "name": "owner",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "cubedMaster",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "listing",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "escrowAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "mint",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "tokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
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
          "name": "masterBump",
          "type": "u8"
        },
        {
          "name": "mintBump",
          "type": "u8"
        },
        {
          "name": "tokenBump",
          "type": "u8"
        },
        {
          "name": "escrowBump",
          "type": "u8"
        },
        {
          "name": "listingBump",
          "type": "u8"
        },
        {
          "name": "epochTime",
          "type": "i64"
        },
        {
          "name": "price",
          "type": "u64"
        }
      ]
    },
    {
      "name": "changeListing",
      "accounts": [
        {
          "name": "owner",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "listing",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "escrowAccount",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "escrowBump",
          "type": "u8"
        },
        {
          "name": "listingBump",
          "type": "u8"
        },
        {
          "name": "epochTime",
          "type": "i64"
        },
        {
          "name": "price",
          "type": "u64"
        }
      ]
    },
    {
      "name": "buyMosaic",
      "accounts": [
        {
          "name": "cubedMaster",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "buyer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "owner",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "artist",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "mint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "canvas",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "listing",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "buyerAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "escrowAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
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
          "name": "masterBump",
          "type": "u8"
        },
        {
          "name": "canvasBump",
          "type": "u8"
        },
        {
          "name": "mintBump",
          "type": "u8"
        },
        {
          "name": "buyerAccountBump",
          "type": "u8"
        },
        {
          "name": "escrowBump",
          "type": "u8"
        },
        {
          "name": "listingBump",
          "type": "u8"
        },
        {
          "name": "epochTime",
          "type": "i64"
        }
      ]
    },
    {
      "name": "removeListing",
      "accounts": [
        {
          "name": "owner",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "cubedMaster",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "listing",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "escrowAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "tokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
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
          "name": "masterBump",
          "type": "u8"
        },
        {
          "name": "tokenBump",
          "type": "u8"
        },
        {
          "name": "escrowBump",
          "type": "u8"
        },
        {
          "name": "listingBump",
          "type": "u8"
        },
        {
          "name": "epochTime",
          "type": "i64"
        }
      ]
    },
    {
      "name": "makeOffer",
      "accounts": [
        {
          "name": "bidder",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "offer",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "offerBump",
          "type": "u8"
        },
        {
          "name": "epochTime",
          "type": "i64"
        },
        {
          "name": "price",
          "type": "u64"
        }
      ]
    },
    {
      "name": "increaseOffer",
      "accounts": [
        {
          "name": "bidder",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "oldBidder",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "offer",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "offerBump",
          "type": "u8"
        },
        {
          "name": "epochTime",
          "type": "i64"
        },
        {
          "name": "price",
          "type": "u64"
        }
      ]
    },
    {
      "name": "acceptOffer",
      "accounts": [
        {
          "name": "cubedMaster",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "owner",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "bidder",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "offer",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "mint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "ownerAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "canvas",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "artist",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "bidderAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
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
          "name": "masterBump",
          "type": "u8"
        },
        {
          "name": "canvasBump",
          "type": "u8"
        },
        {
          "name": "mintBump",
          "type": "u8"
        },
        {
          "name": "ownerAccountBump",
          "type": "u8"
        },
        {
          "name": "bidderAccountBump",
          "type": "u8"
        },
        {
          "name": "offerBump",
          "type": "u8"
        },
        {
          "name": "epochTime",
          "type": "i64"
        }
      ]
    },
    {
      "name": "removeOffer",
      "accounts": [
        {
          "name": "bidder",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "offer",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "offerBump",
          "type": "u8"
        },
        {
          "name": "epochTime",
          "type": "i64"
        }
      ]
    },
    {
      "name": "createAuction",
      "accounts": [
        {
          "name": "owner",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "mint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "ownerAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "auction",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "cubedMaster",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "aesAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
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
          "name": "masterBump",
          "type": "u8"
        },
        {
          "name": "auctionBump",
          "type": "u8"
        },
        {
          "name": "ownerAccountBump",
          "type": "u8"
        },
        {
          "name": "mintBump",
          "type": "u8"
        },
        {
          "name": "aesBump",
          "type": "u8"
        },
        {
          "name": "epochTime",
          "type": "i64"
        },
        {
          "name": "endTime",
          "type": "i64"
        },
        {
          "name": "tick",
          "type": "u64"
        }
      ]
    },
    {
      "name": "bidOnAuction",
      "accounts": [
        {
          "name": "bidder",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "lastBidder",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "auction",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "aesAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "auctionBump",
          "type": "u8"
        },
        {
          "name": "aesBump",
          "type": "u8"
        },
        {
          "name": "epochTime",
          "type": "i64"
        },
        {
          "name": "bid",
          "type": "u64"
        }
      ]
    },
    {
      "name": "finishAuction",
      "accounts": [
        {
          "name": "winner",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "owner",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "cubedMaster",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "canvas",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "artist",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "auction",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "aesAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "winnerAccount",
          "isMut": true,
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
        }
      ],
      "args": [
        {
          "name": "masterBump",
          "type": "u8"
        },
        {
          "name": "canvasBump",
          "type": "u8"
        },
        {
          "name": "auctionBump",
          "type": "u8"
        },
        {
          "name": "aesBump",
          "type": "u8"
        },
        {
          "name": "winnerAccountBump",
          "type": "u8"
        },
        {
          "name": "epochTime",
          "type": "i64"
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "cubedMaster",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "owner",
            "type": "publicKey"
          },
          {
            "name": "lastCanvasTime",
            "type": "i64"
          },
          {
            "name": "canvasPriceEma",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "cubedCollection",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "owner",
            "type": "publicKey"
          },
          {
            "name": "public",
            "type": "bool"
          },
          {
            "name": "nameBytes",
            "type": {
              "array": [
                "u8",
                32
              ]
            }
          },
          {
            "name": "maxSize",
            "type": "i16"
          },
          {
            "name": "numItems",
            "type": "u16"
          }
        ]
      }
    },
    {
      "name": "cubedCanvas",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "artist",
            "type": "publicKey"
          },
          {
            "name": "price",
            "type": "u64"
          },
          {
            "name": "unusedCubes",
            "type": "u16"
          },
          {
            "name": "cubesInCanvas",
            "type": "u16"
          },
          {
            "name": "initHash",
            "type": {
              "array": [
                "u8",
                32
              ]
            }
          },
          {
            "name": "lastHash",
            "type": {
              "array": [
                "u8",
                32
              ]
            }
          },
          {
            "name": "collectionName",
            "type": {
              "array": [
                "u8",
                32
              ]
            }
          },
          {
            "name": "finished",
            "type": "bool"
          }
        ]
      }
    },
    {
      "name": "mosaicListing",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "price",
            "type": "u64"
          },
          {
            "name": "owner",
            "type": "publicKey"
          }
        ]
      }
    },
    {
      "name": "mosaicOffer",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "bidder",
            "type": "publicKey"
          },
          {
            "name": "price",
            "type": "u64"
          },
          {
            "name": "active",
            "type": "bool"
          }
        ]
      }
    },
    {
      "name": "mosaicAuction",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "endTime",
            "type": "i64"
          },
          {
            "name": "highestBid",
            "type": "u64"
          },
          {
            "name": "tick",
            "type": "u64"
          },
          {
            "name": "leader",
            "type": "publicKey"
          }
        ]
      }
    }
  ]
};

export const IDL: Cubed = {
  "version": "0.0.0",
  "name": "cubed",
  "instructions": [
    {
      "name": "initialize",
      "accounts": [
        {
          "name": "cubedMaster",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "defaultCollection",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "owner",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "masterBump",
          "type": "u8"
        },
        {
          "name": "defaultCollectionName",
          "type": {
            "array": [
              "u8",
              32
            ]
          }
        },
        {
          "name": "collectionBump",
          "type": "u8"
        }
      ]
    },
    {
      "name": "buyCanvas",
      "accounts": [
        {
          "name": "artist",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "cubedMaster",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "collection",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "canvas",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "mint",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
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
          "name": "masterBump",
          "type": "u8"
        },
        {
          "name": "canvasBump",
          "type": "u8"
        },
        {
          "name": "mintBump",
          "type": "u8"
        },
        {
          "name": "epochTime",
          "type": "i64"
        },
        {
          "name": "collectionNameBytes",
          "type": {
            "array": [
              "u8",
              32
            ]
          }
        },
        {
          "name": "collectionBump",
          "type": "u8"
        }
      ]
    },
    {
      "name": "createCollection",
      "accounts": [
        {
          "name": "owner",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "cubedMaster",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "collection",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "masterBump",
          "type": "u8"
        },
        {
          "name": "canvasBump",
          "type": "u8"
        },
        {
          "name": "epochTime",
          "type": "i64"
        },
        {
          "name": "collectionBump",
          "type": "u8"
        },
        {
          "name": "nameBytes",
          "type": {
            "array": [
              "u8",
              32
            ]
          }
        },
        {
          "name": "maxSize",
          "type": "i16"
        },
        {
          "name": "public",
          "type": "bool"
        }
      ]
    },
    {
      "name": "buyCubes",
      "accounts": [
        {
          "name": "buyer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "cubedMaster",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "canvas",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "masterBump",
          "type": "u8"
        },
        {
          "name": "canvasBump",
          "type": "u8"
        },
        {
          "name": "epochTime",
          "type": "i64"
        },
        {
          "name": "numCubes",
          "type": "u16"
        }
      ]
    },
    {
      "name": "placeCube",
      "accounts": [
        {
          "name": "artist",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "canvas",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "canvasBump",
          "type": "u8"
        },
        {
          "name": "epochTime",
          "type": "i64"
        },
        {
          "name": "algo",
          "type": {
            "array": [
              "u8",
              512
            ]
          }
        },
        {
          "name": "x",
          "type": "u16"
        },
        {
          "name": "y",
          "type": "u16"
        }
      ]
    },
    {
      "name": "removeCube",
      "accounts": [
        {
          "name": "artist",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "canvas",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "canvasBump",
          "type": "u8"
        },
        {
          "name": "epochTime",
          "type": "i64"
        },
        {
          "name": "x",
          "type": "u16"
        },
        {
          "name": "y",
          "type": "u16"
        }
      ]
    },
    {
      "name": "mintMosaic",
      "accounts": [
        {
          "name": "artist",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "cubedMaster",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "canvas",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "tokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "tokenMetadataProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "metadata",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "mint",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
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
          "name": "masterBump",
          "type": "u8"
        },
        {
          "name": "canvasBump",
          "type": "u8"
        },
        {
          "name": "mintBump",
          "type": "u8"
        },
        {
          "name": "tokenBump",
          "type": "u8"
        },
        {
          "name": "epochTime",
          "type": "i64"
        }
      ]
    },
    {
      "name": "listMosaic",
      "accounts": [
        {
          "name": "owner",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "cubedMaster",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "listing",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "escrowAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "mint",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "tokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
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
          "name": "masterBump",
          "type": "u8"
        },
        {
          "name": "mintBump",
          "type": "u8"
        },
        {
          "name": "tokenBump",
          "type": "u8"
        },
        {
          "name": "escrowBump",
          "type": "u8"
        },
        {
          "name": "listingBump",
          "type": "u8"
        },
        {
          "name": "epochTime",
          "type": "i64"
        },
        {
          "name": "price",
          "type": "u64"
        }
      ]
    },
    {
      "name": "changeListing",
      "accounts": [
        {
          "name": "owner",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "listing",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "escrowAccount",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "escrowBump",
          "type": "u8"
        },
        {
          "name": "listingBump",
          "type": "u8"
        },
        {
          "name": "epochTime",
          "type": "i64"
        },
        {
          "name": "price",
          "type": "u64"
        }
      ]
    },
    {
      "name": "buyMosaic",
      "accounts": [
        {
          "name": "cubedMaster",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "buyer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "owner",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "artist",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "mint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "canvas",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "listing",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "buyerAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "escrowAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
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
          "name": "masterBump",
          "type": "u8"
        },
        {
          "name": "canvasBump",
          "type": "u8"
        },
        {
          "name": "mintBump",
          "type": "u8"
        },
        {
          "name": "buyerAccountBump",
          "type": "u8"
        },
        {
          "name": "escrowBump",
          "type": "u8"
        },
        {
          "name": "listingBump",
          "type": "u8"
        },
        {
          "name": "epochTime",
          "type": "i64"
        }
      ]
    },
    {
      "name": "removeListing",
      "accounts": [
        {
          "name": "owner",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "cubedMaster",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "listing",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "escrowAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "tokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
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
          "name": "masterBump",
          "type": "u8"
        },
        {
          "name": "tokenBump",
          "type": "u8"
        },
        {
          "name": "escrowBump",
          "type": "u8"
        },
        {
          "name": "listingBump",
          "type": "u8"
        },
        {
          "name": "epochTime",
          "type": "i64"
        }
      ]
    },
    {
      "name": "makeOffer",
      "accounts": [
        {
          "name": "bidder",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "offer",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "offerBump",
          "type": "u8"
        },
        {
          "name": "epochTime",
          "type": "i64"
        },
        {
          "name": "price",
          "type": "u64"
        }
      ]
    },
    {
      "name": "increaseOffer",
      "accounts": [
        {
          "name": "bidder",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "oldBidder",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "offer",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "offerBump",
          "type": "u8"
        },
        {
          "name": "epochTime",
          "type": "i64"
        },
        {
          "name": "price",
          "type": "u64"
        }
      ]
    },
    {
      "name": "acceptOffer",
      "accounts": [
        {
          "name": "cubedMaster",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "owner",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "bidder",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "offer",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "mint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "ownerAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "canvas",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "artist",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "bidderAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
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
          "name": "masterBump",
          "type": "u8"
        },
        {
          "name": "canvasBump",
          "type": "u8"
        },
        {
          "name": "mintBump",
          "type": "u8"
        },
        {
          "name": "ownerAccountBump",
          "type": "u8"
        },
        {
          "name": "bidderAccountBump",
          "type": "u8"
        },
        {
          "name": "offerBump",
          "type": "u8"
        },
        {
          "name": "epochTime",
          "type": "i64"
        }
      ]
    },
    {
      "name": "removeOffer",
      "accounts": [
        {
          "name": "bidder",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "offer",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "offerBump",
          "type": "u8"
        },
        {
          "name": "epochTime",
          "type": "i64"
        }
      ]
    },
    {
      "name": "createAuction",
      "accounts": [
        {
          "name": "owner",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "mint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "ownerAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "auction",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "cubedMaster",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "aesAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
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
          "name": "masterBump",
          "type": "u8"
        },
        {
          "name": "auctionBump",
          "type": "u8"
        },
        {
          "name": "ownerAccountBump",
          "type": "u8"
        },
        {
          "name": "mintBump",
          "type": "u8"
        },
        {
          "name": "aesBump",
          "type": "u8"
        },
        {
          "name": "epochTime",
          "type": "i64"
        },
        {
          "name": "endTime",
          "type": "i64"
        },
        {
          "name": "tick",
          "type": "u64"
        }
      ]
    },
    {
      "name": "bidOnAuction",
      "accounts": [
        {
          "name": "bidder",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "lastBidder",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "auction",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "aesAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "auctionBump",
          "type": "u8"
        },
        {
          "name": "aesBump",
          "type": "u8"
        },
        {
          "name": "epochTime",
          "type": "i64"
        },
        {
          "name": "bid",
          "type": "u64"
        }
      ]
    },
    {
      "name": "finishAuction",
      "accounts": [
        {
          "name": "winner",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "owner",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "cubedMaster",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "canvas",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "artist",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "auction",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "aesAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "winnerAccount",
          "isMut": true,
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
        }
      ],
      "args": [
        {
          "name": "masterBump",
          "type": "u8"
        },
        {
          "name": "canvasBump",
          "type": "u8"
        },
        {
          "name": "auctionBump",
          "type": "u8"
        },
        {
          "name": "aesBump",
          "type": "u8"
        },
        {
          "name": "winnerAccountBump",
          "type": "u8"
        },
        {
          "name": "epochTime",
          "type": "i64"
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "cubedMaster",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "owner",
            "type": "publicKey"
          },
          {
            "name": "lastCanvasTime",
            "type": "i64"
          },
          {
            "name": "canvasPriceEma",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "cubedCollection",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "owner",
            "type": "publicKey"
          },
          {
            "name": "public",
            "type": "bool"
          },
          {
            "name": "nameBytes",
            "type": {
              "array": [
                "u8",
                32
              ]
            }
          },
          {
            "name": "maxSize",
            "type": "i16"
          },
          {
            "name": "numItems",
            "type": "u16"
          }
        ]
      }
    },
    {
      "name": "cubedCanvas",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "artist",
            "type": "publicKey"
          },
          {
            "name": "price",
            "type": "u64"
          },
          {
            "name": "unusedCubes",
            "type": "u16"
          },
          {
            "name": "cubesInCanvas",
            "type": "u16"
          },
          {
            "name": "initHash",
            "type": {
              "array": [
                "u8",
                32
              ]
            }
          },
          {
            "name": "lastHash",
            "type": {
              "array": [
                "u8",
                32
              ]
            }
          },
          {
            "name": "collectionName",
            "type": {
              "array": [
                "u8",
                32
              ]
            }
          },
          {
            "name": "finished",
            "type": "bool"
          }
        ]
      }
    },
    {
      "name": "mosaicListing",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "price",
            "type": "u64"
          },
          {
            "name": "owner",
            "type": "publicKey"
          }
        ]
      }
    },
    {
      "name": "mosaicOffer",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "bidder",
            "type": "publicKey"
          },
          {
            "name": "price",
            "type": "u64"
          },
          {
            "name": "active",
            "type": "bool"
          }
        ]
      }
    },
    {
      "name": "mosaicAuction",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "endTime",
            "type": "i64"
          },
          {
            "name": "highestBid",
            "type": "u64"
          },
          {
            "name": "tick",
            "type": "u64"
          },
          {
            "name": "leader",
            "type": "publicKey"
          }
        ]
      }
    }
  ]
};
