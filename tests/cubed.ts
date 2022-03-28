import * as anchor from "@project-serum/anchor";
import { Program } from "@project-serum/anchor";
import { Cubed } from "../target/types/cubed";
import {
  PublicKey,
  SystemProgram,
  LAMPORTS_PER_SOL,
  SYSVAR_RENT_PUBKEY,
} from "@solana/web3.js";
import assert from "assert";
import {
  CubeModel,
  CubeSyntaxTurn,
  encodePosition,
  extendAlgo,
  placeCubeNextHash,
  removeCubeNextHash,
  sha256ByteBash,
} from "../app/src/global_architecture/cube_model/cube_model";
import { TOKEN_PROGRAM_ID, Token } from "@solana/spl-token";
import _ from "underscore";
import {
  COLLECTION_SEED,
  MASTER_SEED,
  MIN_CANVAS_PRICE,
  CANVAS_SEED,
  MINT_SEED_PREFIX,
  DEFAULT_COLLECTION_NAME_BYTES,
  INITIAL_CANVAS_CUBES,
  CUBE_PRICE,
  TOKEN_ACCOUNT_SEED_PREFIX,
  ESCROW_ACCOUNT_SEED_PREFIX,
  LISTING_SEED_PREFIX,
  OFFER_SEED_PREFIX,
  AUCTION_ESCROW_ACCOUNT_SEED_PREFIX,
  AUCTION_SEED_PREFIX,
} from "../app/src/global_chain/chain_constants";
import { programs } from "@metaplex/js";

const TOKEN_METADATA_PROGRAM_ID = programs.metadata.MetadataProgram.PUBKEY;

async function sleep(millis: number) {
  return new Promise((res) => setTimeout(res, millis));
}

// TODO: Change this to 10
const CUBES_TO_PLACE = 2;

describe("cubed", () => {
  const provider = anchor.Provider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.Cubed as Program<Cubed>;
  let _master_pda: PublicKey = null;
  let _master_bump = null;
  let artist = anchor.web3.Keypair.generate();

  let escrow_pda: PublicKey;
  let escrow_bump;

  let listing_pda: PublicKey;
  let listing_bump;

  let _canvas_pda: PublicKey = null;
  let _canvas_bump = null;
  let _canvas_time = null;
  let _canvas_hash = new Uint8Array();
  let _cubes_in_canvas = 0;
  let _now_buffer = null;
  let _num_cubes = 0;

  let _mint_pda: PublicKey = null;
  let _mint_bump = null;

  let _token_pda: PublicKey = null;
  let _token_bump = null;

  let _default_collection_pda = null;
  let _default_collection_bump = null;

  let buyer = anchor.web3.Keypair.generate();

  let buyer_account_pda: PublicKey;
  let buyer_account_bump;

  let offer_pda: PublicKey;
  let offer_bump;

  let auction_pda: PublicKey;
  let auction_bump;

  let aes_pda: PublicKey;
  let aes_bump;

  let buyer2 = anchor.web3.Keypair.generate();

  let tokenMaster: Token;

  let auctionEndTime;

  it("initialize basic state ", async () => {
    await provider.connection.confirmTransaction(
      await provider.connection.requestAirdrop(artist.publicKey, 1000000000000),
      "processed"
    );

    await provider.connection.confirmTransaction(
      await provider.connection.requestAirdrop(buyer.publicKey, 1000000000000),
      "processed"
    );

    await provider.connection.confirmTransaction(
      await provider.connection.requestAirdrop(buyer2.publicKey, 1000000000000),
      "processed"
    );
  });

  it("It initialized!", async () => {
    const [master_pda, master_bump] = await PublicKey.findProgramAddress(
      [Buffer.from(anchor.utils.bytes.utf8.encode(MASTER_SEED))],
      program.programId
    );

    const [clln_pda, clln_bump] = await PublicKey.findProgramAddress(
      [
        Buffer.from(anchor.utils.bytes.utf8.encode(COLLECTION_SEED)),
        DEFAULT_COLLECTION_NAME_BYTES,
      ],
      program.programId
    );

    _default_collection_pda = clln_pda;
    _default_collection_bump = clln_bump;

    _master_pda = master_pda;
    _master_bump = master_bump;

    await program.rpc.initialize(
      master_bump,
      Array.from(DEFAULT_COLLECTION_NAME_BYTES),
      clln_bump,
      {
        accounts: {
          cubedMaster: master_pda,
          defaultCollection: clln_pda,
          owner: provider.wallet.publicKey,
          systemProgram: SystemProgram.programId,
        },
      }
    );
  });

  /* TODO: Turn this on in order to test multi init failing */
  // it("Initializing again with different owner fails", async () => {
  //   const hacker = anchor.web3.Keypair.generate();

  //   await provider.connection.confirmTransaction(
  //     await provider.connection.requestAirdrop(hacker.publicKey, 10000000000),
  //     "processed"
  //   );

  //   await program.rpc.initialize(_master_bump, {
  //     accounts: {
  //       cubedMaster: _master_pda,
  //       owner: hacker.publicKey,
  //       systemProgram: anchor.web3.SystemProgram.programId,
  //     },
  //     signers: [hacker],
  //   });
  // });
  // it("works", async () => {
  //   const hello = anchor.web3.Keypair.generate();

  //   await program.rpc.hello({
  //     accounts: {
  //       artist: artist.publicKey,
  //       hello: hello.publicKey,
  //     },
  //     signers: [artist],
  //   });
  // });

  it("Allows us to buy canvas", async () => {
    /* Need to figure out if how much time we need to leave between purchasing canvases */
    const now = new anchor.BN(Math.floor(Date.now() / 1000) - 1);
    _now_buffer = now.toArrayLike(Buffer, "le", 8);

    const [canvas_pda, canvas_bump] = await PublicKey.findProgramAddress(
      [Buffer.from(anchor.utils.bytes.utf8.encode(CANVAS_SEED)), _now_buffer],
      program.programId
    );

    const [mint_pda, mint_bump] = await PublicKey.findProgramAddress(
      [
        Buffer.from(anchor.utils.bytes.utf8.encode(MINT_SEED_PREFIX)),
        _now_buffer,
      ],
      program.programId
    );

    _mint_pda = mint_pda;
    _mint_bump = mint_bump;

    _canvas_pda = canvas_pda;
    _canvas_bump = canvas_bump;
    _canvas_time = now;

    /* We're only using this to fetch token info, so we give it a fake signer */
    tokenMaster = new Token(provider.connection, _mint_pda, TOKEN_PROGRAM_ID, {
      publicKey: mint_pda,
      secretKey: new Uint8Array(0),
    });

    const artistLamportsBefore = (
      await provider.connection.getAccountInfo(artist.publicKey)
    ).lamports;

    let collection_before = await program.account.cubedCollection.fetch(
      _default_collection_pda
    );

    assert(collection_before.numItems == 0);

    await program.rpc.buyCanvas(
      _master_bump,
      canvas_bump,
      mint_bump,
      now,
      DEFAULT_COLLECTION_NAME_BYTES,
      _default_collection_bump,
      {
        accounts: {
          artist: artist.publicKey,
          cubedMaster: _master_pda,
          canvas: canvas_pda,
          mint: mint_pda,
          systemProgram: SystemProgram.programId,
          collection: _default_collection_pda,
          tokenProgram: TOKEN_PROGRAM_ID,
          rent: SYSVAR_RENT_PUBKEY,
        },
        signers: [artist],
      }
    );

    const artistLamportsAfter = (
      await provider.connection.getAccountInfo(artist.publicKey)
    ).lamports;

    const delLamports = artistLamportsBefore - artistLamportsAfter;

    let collection = await program.account.cubedCollection.fetch(
      _default_collection_pda
    );

    assert(collection.numItems == 1);
    assert(delLamports >= MIN_CANVAS_PRICE * anchor.web3.LAMPORTS_PER_SOL);
  });

  it("Allows us to buy cubes", async () => {
    let canvas = await program.account.cubedCanvas.fetch(_canvas_pda);
    assert(canvas.unusedCubes === INITIAL_CANVAS_CUBES);

    const artistLamportsBefore = (
      await provider.connection.getAccountInfo(artist.publicKey)
    ).lamports;

    _num_cubes = CUBES_TO_PLACE;

    /* Now we run buy cubes */
    await program.rpc.buyCubes(
      _master_bump,
      _canvas_bump,
      _canvas_time,
      CUBES_TO_PLACE,
      {
        accounts: {
          buyer: artist.publicKey,
          cubedMaster: _master_pda,
          canvas: _canvas_pda,
          systemProgram: SystemProgram.programId,
        },
        signers: [artist],
      }
    );

    canvas = await program.account.cubedCanvas.fetch(_canvas_pda);

    assert(canvas.unusedCubes === INITIAL_CANVAS_CUBES + CUBES_TO_PLACE);

    const artistLamportsAfter = (
      await provider.connection.getAccountInfo(artist.publicKey)
    ).lamports;

    const delLamports = artistLamportsBefore - artistLamportsAfter;

    assert(delLamports >= CUBE_PRICE * CUBES_TO_PLACE * LAMPORTS_PER_SOL);
    assert(
      delLamports < (CUBE_PRICE * CUBES_TO_PLACE + 0.001) * LAMPORTS_PER_SOL
    );
    assert(canvas.cubesInCanvas == _cubes_in_canvas);
  });

  it("Allows us to place cube", async () => {
    const algo: CubeSyntaxTurn[] = extendAlgo(
      CubeModel.algoStringToTurns("R D R' D'2")
    );
    const x = -3;
    const y = 56;

    const xEn = encodePosition(x);
    const yEn = encodePosition(y);
    _canvas_hash = sha256ByteBash(_now_buffer);

    _canvas_hash = placeCubeNextHash(algo, xEn, yEn, _canvas_hash);

    await program.rpc.placeCube(_canvas_bump, _canvas_time, algo, xEn, yEn, {
      accounts: {
        artist: artist.publicKey,
        canvas: _canvas_pda,
        systemProgram: SystemProgram.programId,
      },
      signers: [artist],
    });

    const canvas = await program.account.cubedCanvas.fetch(_canvas_pda);
    _cubes_in_canvas += 1;

    assert(canvas.unusedCubes == INITIAL_CANVAS_CUBES + _num_cubes - 1);
    assert(_.isEqual(canvas.lastHash, Array.from(_canvas_hash)));
    assert(canvas.cubesInCanvas == _cubes_in_canvas);
  });

  /* CUBES_TO_PLACE -- test regular
     CUBES_TO_PLACE + 2 -- break this case
   */
  const TEST_CUBES = CUBES_TO_PLACE;

  it("Allows us to place many cubes", async () => {
    const randPosRange = 400;
    for (let i of _.range(TEST_CUBES)) {
      const algo: CubeSyntaxTurn[] = [];
      const numTurns = Math.floor(Math.random() * 100);

      for (let _b of _.range(numTurns)) {
        let turn: CubeSyntaxTurn = Math.floor(Math.random() * 25) + 1;
        algo.push(turn);
      }

      const x = randPosRange / 2 - Math.floor(Math.random() * randPosRange);
      const y = randPosRange / 2 - Math.floor(Math.random() * randPosRange);
      const xEn = encodePosition(x);
      const yEn = encodePosition(y);

      _canvas_hash = placeCubeNextHash(algo, xEn, yEn, _canvas_hash);

      await program.rpc.placeCube(_canvas_bump, _canvas_time, algo, xEn, yEn, {
        accounts: {
          artist: artist.publicKey,
          canvas: _canvas_pda,
          systemProgram: SystemProgram.programId,
        },
        signers: [artist],
      });

      const canvas = await program.account.cubedCanvas.fetch(_canvas_pda);

      _cubes_in_canvas++;
      assert(canvas.unusedCubes == INITIAL_CANVAS_CUBES + _num_cubes - 2 - i);
      assert(_.isEqual(canvas.lastHash, Array.from(_canvas_hash)));
      assert(canvas.cubesInCanvas == _cubes_in_canvas);
    }
  });

  /* CUBES_TO_PLACE / 2 -- USED FOR REGULAR TESTING
     CUBES_TO_PLACE + 2 -- USED TO BREAK THIS
  */
  const REMOVE_TEST_CUBES = CUBES_TO_PLACE / 2;

  it("Allows us to remove many cubes", async () => {
    const randPosRange = 400;

    for (let i of _.range(REMOVE_TEST_CUBES)) {
      const x = randPosRange / 2 - Math.floor(Math.random() * randPosRange);
      const y = randPosRange / 2 - Math.floor(Math.random() * randPosRange);
      const xEn = encodePosition(x);
      const yEn = encodePosition(y);

      _canvas_hash = removeCubeNextHash(xEn, yEn, _canvas_hash);

      await program.rpc.removeCube(_canvas_bump, _canvas_time, xEn, yEn, {
        accounts: {
          artist: artist.publicKey,
          canvas: _canvas_pda,
          systemProgram: SystemProgram.programId,
        },
        signers: [artist],
      });

      const canvas = await program.account.cubedCanvas.fetch(_canvas_pda);

      _cubes_in_canvas--;
      assert(
        canvas.unusedCubes ==
          INITIAL_CANVAS_CUBES + _num_cubes - 1 - CUBES_TO_PLACE
      );

      assert(_.isEqual(canvas.lastHash, Array.from(_canvas_hash)));
      assert(canvas.cubesInCanvas == _cubes_in_canvas);
    }
  });

  it("Allows us to mint the mosaic", async () => {
    const [token_pda, token_bump] = await PublicKey.findProgramAddress(
      [
        Buffer.from(anchor.utils.bytes.utf8.encode(TOKEN_ACCOUNT_SEED_PREFIX)),
        _now_buffer,
        artist.publicKey.toBytes(),
      ],
      program.programId
    );

    _token_bump = token_bump;
    _token_pda = token_pda;

    const [metadata_account, _metadata_bump] =
      await programs.metadata.MetadataProgram.findMetadataAccount(_mint_pda);

    await program.rpc.mintMosaic(
      _master_bump,
      _canvas_bump,
      _mint_bump,
      token_bump,
      _canvas_time,
      {
        accounts: {
          tokenMetadataProgram: TOKEN_METADATA_PROGRAM_ID,
          metadata: metadata_account,
          artist: artist.publicKey,
          cubedMaster: _master_pda,
          canvas: _canvas_pda,
          tokenAccount: token_pda,
          mint: _mint_pda,
          systemProgram: SystemProgram.programId,
          tokenProgram: TOKEN_PROGRAM_ID,
          rent: SYSVAR_RENT_PUBKEY,
        },
        signers: [artist],
      }
    );

    const tokenAccountInfo = await tokenMaster.getAccountInfo(token_pda);

    assert(tokenAccountInfo.amount.toNumber() == 1);
  });

  it("Allows us to list the mosaic", async () => {
    [escrow_pda, escrow_bump] = await PublicKey.findProgramAddress(
      [
        Buffer.from(anchor.utils.bytes.utf8.encode(ESCROW_ACCOUNT_SEED_PREFIX)),
        _now_buffer,
      ],
      program.programId
    );

    [listing_pda, listing_bump] = await PublicKey.findProgramAddress(
      [
        Buffer.from(anchor.utils.bytes.utf8.encode(LISTING_SEED_PREFIX)),
        _now_buffer,
      ],
      program.programId
    );

    await program.rpc.listMosaic(
      _master_bump,
      _mint_bump,
      _token_bump,
      escrow_bump,
      listing_bump,
      _canvas_time,
      new anchor.BN(10),
      {
        accounts: {
          owner: artist.publicKey,
          cubedMaster: _master_pda,
          tokenAccount: _token_pda,
          escrowAccount: escrow_pda,
          mint: _mint_pda,
          systemProgram: SystemProgram.programId,
          tokenProgram: TOKEN_PROGRAM_ID,
          listing: listing_pda,
          rent: SYSVAR_RENT_PUBKEY,
        },
        signers: [artist],
      }
    );

    const escrowInfo = await tokenMaster.getAccountInfo(escrow_pda);
    const tokenAccountInfo = await tokenMaster.getAccountInfo(_token_pda);

    assert(escrowInfo.amount.toNumber() == 1);
    assert(tokenAccountInfo.amount.toNumber() == 0);
  });

  it("Allows us to change the listing", async () => {
    await program.rpc.changeListing(
      escrow_bump,
      listing_bump,
      _canvas_time,
      new anchor.BN(20),
      {
        accounts: {
          owner: artist.publicKey,
          listing: listing_pda,
          escrowAccount: escrow_pda,
          systemProgram: SystemProgram.programId,
        },
        signers: [artist],
      }
    );

    let mosaicListing = await program.account.mosaicListing.fetch(listing_pda);
    assert(mosaicListing.price.toNumber() === 20);
  });

  it("Allows us to buy the mosaic", async () => {
    [buyer_account_pda, buyer_account_bump] =
      await PublicKey.findProgramAddress(
        [
          Buffer.from(
            anchor.utils.bytes.utf8.encode(TOKEN_ACCOUNT_SEED_PREFIX)
          ),
          _now_buffer,
          buyer.publicKey.toBytes(),
        ],
        program.programId
      );

    await program.rpc.buyMosaic(
      _master_bump,
      _mint_bump,
      buyer_account_bump,
      escrow_bump,
      listing_bump,
      _canvas_time,
      {
        accounts: {
          cubedMaster: _master_pda,
          buyer: buyer.publicKey,
          owner: artist.publicKey,
          mint: _mint_pda,
          listing: listing_pda,
          buyerAccount: buyer_account_pda,
          escrowAccount: escrow_pda,
          systemProgram: SystemProgram.programId,
          tokenProgram: TOKEN_PROGRAM_ID,
          rent: SYSVAR_RENT_PUBKEY,
        },
        signers: [buyer],
      }
    );

    const escrowInfo = await tokenMaster.getAccountInfo(escrow_pda);
    const buyerAccountInfo = await tokenMaster.getAccountInfo(
      buyer_account_pda
    );

    assert(escrowInfo.amount.toNumber() == 0);
    assert(buyerAccountInfo.amount.toNumber() == 1);
  });

  it("Allows us to re-list the mosaic", async () => {
    await program.rpc.listMosaic(
      _master_bump,
      _mint_bump,
      buyer_account_bump,
      escrow_bump,
      listing_bump,
      _canvas_time,
      new anchor.BN(200),
      {
        accounts: {
          owner: buyer.publicKey,
          cubedMaster: _master_pda,
          tokenAccount: buyer_account_pda,
          escrowAccount: escrow_pda,
          mint: _mint_pda,
          systemProgram: SystemProgram.programId,
          tokenProgram: TOKEN_PROGRAM_ID,
          listing: listing_pda,
          rent: SYSVAR_RENT_PUBKEY,
        },
        signers: [buyer],
      }
    );

    const escrowInfo = await tokenMaster.getAccountInfo(escrow_pda);
    const buyerAccountInfo = await tokenMaster.getAccountInfo(
      buyer_account_pda
    );

    assert(escrowInfo.amount.toNumber() == 1);
    assert(buyerAccountInfo.amount.toNumber() == 0);
  });

  it("Allows us to remove listing", async () => {
    await program.rpc.removeListing(
      _master_bump,
      buyer_account_bump,
      escrow_bump,
      listing_bump,
      _canvas_time,
      {
        accounts: {
          owner: buyer.publicKey,
          cubedMaster: _master_pda,
          listing: listing_pda,
          escrowAccount: escrow_pda,
          tokenAccount: buyer_account_pda,
          systemProgram: SystemProgram.programId,
          tokenProgram: TOKEN_PROGRAM_ID,
          rent: SYSVAR_RENT_PUBKEY,
        },
        signers: [buyer],
      }
    );

    const escrowInfo = await tokenMaster.getAccountInfo(escrow_pda);
    const buyerAccountInfo = await tokenMaster.getAccountInfo(
      buyer_account_pda
    );

    assert(escrowInfo.amount.toNumber() == 0);
    assert(buyerAccountInfo.amount.toNumber() == 1);
  });

  it("Allows us to make offer", async () => {
    [offer_pda, offer_bump] = await PublicKey.findProgramAddress(
      [
        Buffer.from(anchor.utils.bytes.utf8.encode(OFFER_SEED_PREFIX)),
        _now_buffer,
      ],
      program.programId
    );

    await program.rpc.makeOffer(offer_bump, _canvas_time, new anchor.BN(400), {
      accounts: {
        bidder: buyer2.publicKey,
        offer: offer_pda,
        systemProgram: SystemProgram.programId,
      },
      signers: [buyer2],
    });

    const offer = await program.account.mosaicOffer.fetch(offer_pda);
    const offerAccount = await provider.connection.getAccountInfo(offer_pda);

    assert(offer.bidder.toString() == buyer2.publicKey.toString());
    assert(offer.price.toNumber() == 400);
    assert(offerAccount.lamports > 400);
  });

  it("Allows us to increase listing from same bidder", async () => {
    let offerAccount = await provider.connection.getAccountInfo(offer_pda);
    let startingLamports = offerAccount.lamports;

    await program.rpc.increaseOffer(
      offer_bump,
      _canvas_time,
      new anchor.BN(420),
      {
        accounts: {
          bidder: buyer2.publicKey,
          oldBidder: buyer2.publicKey,
          offer: offer_pda,
          systemProgram: SystemProgram.programId,
        },
        signers: [buyer2],
      }
    );

    const offer = await program.account.mosaicOffer.fetch(offer_pda);
    offerAccount = await provider.connection.getAccountInfo(offer_pda);

    assert(offer.bidder.toString() == buyer2.publicKey.toString());
    assert(offer.price.toNumber() == 420);

    assert(offerAccount.lamports - startingLamports == 20);
  });

  it("Allows us to increase listing from different bidder", async () => {
    let offerAccount = await provider.connection.getAccountInfo(offer_pda);
    let startingLamports = offerAccount.lamports;

    await program.rpc.increaseOffer(
      offer_bump,
      _canvas_time,
      new anchor.BN(500),
      {
        accounts: {
          bidder: artist.publicKey,
          oldBidder: buyer2.publicKey,
          offer: offer_pda,
          systemProgram: SystemProgram.programId,
        },
        signers: [artist],
      }
    );

    const offer = await program.account.mosaicOffer.fetch(offer_pda);
    offerAccount = await provider.connection.getAccountInfo(offer_pda);

    assert(offer.bidder.toString() == artist.publicKey.toString());
    assert(offer.price.toNumber() == 500);

    assert(offerAccount.lamports - startingLamports == 80);
  });

  it("Allows us to accept offer", async () => {
    let offerAccount = await provider.connection.getAccountInfo(offer_pda);
    let startingLamports = offerAccount.lamports;

    await program.rpc.acceptOffer(
      _master_bump,
      _mint_bump,
      buyer_account_bump,
      _token_bump,
      offer_bump,
      _canvas_time,
      {
        accounts: {
          owner: buyer.publicKey,
          bidder: artist.publicKey,
          offer: offer_pda,
          mint: _mint_pda,
          ownerAccount: buyer_account_pda,
          bidderAccount: _token_pda,
          systemProgram: SystemProgram.programId,
          tokenProgram: TOKEN_PROGRAM_ID,
          rent: SYSVAR_RENT_PUBKEY,
        },
        signers: [buyer],
      }
    );

    const offer = await program.account.mosaicOffer.fetch(offer_pda);
    offerAccount = await provider.connection.getAccountInfo(offer_pda);

    assert(offer.bidder.toString() == artist.publicKey.toString());
    assert(offer.price.toNumber() == 0);

    assert(offerAccount.lamports - startingLamports == -500);

    const artistAccount = await tokenMaster.getAccountInfo(_token_pda);
    const buyerAccountInfo = await tokenMaster.getAccountInfo(
      buyer_account_pda
    );

    assert(artistAccount.amount.toNumber() == 1);
    assert(buyerAccountInfo.amount.toNumber() == 0);
  });

  it("Allows us to remove offer", async () => {
    let startBidderLamports = (
      await provider.connection.getAccountInfo(buyer2.publicKey)
    ).lamports;
    let startOfferLamports = (
      await provider.connection.getAccountInfo(offer_pda)
    ).lamports;

    /* Start by making an offer */
    await program.rpc.makeOffer(offer_bump, _canvas_time, new anchor.BN(400), {
      accounts: {
        bidder: buyer2.publicKey,
        offer: offer_pda,
        systemProgram: SystemProgram.programId,
      },
      signers: [buyer2],
    });

    let middleBidderLamports = (
      await provider.connection.getAccountInfo(buyer2.publicKey)
    ).lamports;
    let middleOfferLamports = (
      await provider.connection.getAccountInfo(offer_pda)
    ).lamports;

    assert(middleBidderLamports - startBidderLamports == -400);
    assert(middleOfferLamports - startOfferLamports == 400);

    /* Start by making an offer */
    await program.rpc.removeOffer(offer_bump, _canvas_time, {
      accounts: {
        bidder: buyer2.publicKey,
        offer: offer_pda,
        systemProgram: SystemProgram.programId,
      },
      signers: [buyer2],
    });

    let finalBidderLamports = (
      await provider.connection.getAccountInfo(buyer2.publicKey)
    ).lamports;
    let finalOfferLamports = (
      await provider.connection.getAccountInfo(offer_pda)
    ).lamports;

    assert(finalBidderLamports == startBidderLamports);
    assert(finalOfferLamports == startOfferLamports);
  });

  it("Allows us to create an auction", async () => {
    [auction_pda, auction_bump] = await PublicKey.findProgramAddress(
      [
        Buffer.from(anchor.utils.bytes.utf8.encode(AUCTION_SEED_PREFIX)),
        _now_buffer,
      ],
      program.programId
    );

    [aes_pda, aes_bump] = await PublicKey.findProgramAddress(
      [
        Buffer.from(
          anchor.utils.bytes.utf8.encode(AUCTION_ESCROW_ACCOUNT_SEED_PREFIX)
        ),
        _now_buffer,
      ],
      program.programId
    );

    auctionEndTime = Date.now() / 1000 + 3;

    await program.rpc.createAuction(
      _master_bump,
      auction_bump,
      _token_bump,
      _mint_bump,
      aes_bump,
      _canvas_time,
      new anchor.BN(auctionEndTime),
      new anchor.BN(200),
      {
        accounts: {
          owner: artist.publicKey,
          mint: _mint_pda,
          ownerAccount: _token_pda,
          auction: auction_pda,
          cubedMaster: _master_pda,
          aesAccount: aes_pda,
          systemProgram: SystemProgram.programId,
          tokenProgram: TOKEN_PROGRAM_ID,
          rent: SYSVAR_RENT_PUBKEY,
        },
        signers: [artist],
      }
    );

    const ownerAccountInfo = await tokenMaster.getAccountInfo(_token_pda);
    const aesAccountInfo = await tokenMaster.getAccountInfo(aes_pda);

    assert(ownerAccountInfo.amount.toNumber() == 0);
    assert(aesAccountInfo.amount.toNumber() == 1);
  });

  it("Allows us to bid on the canvas", async () => {
    await program.rpc.bidOnAuction(
      auction_bump,
      aes_bump,
      _canvas_time,
      new anchor.BN(1000),
      {
        accounts: {
          bidder: buyer2.publicKey,
          lastBidder: artist.publicKey,
          auction: auction_pda,
          aesAccount: aes_pda,
          systemProgram: SystemProgram.programId,
        },
        signers: [buyer2],
      }
    );

    await program.rpc.bidOnAuction(
      auction_bump,
      aes_bump,
      _canvas_time,
      new anchor.BN(2000),
      {
        accounts: {
          bidder: buyer2.publicKey,
          lastBidder: buyer2.publicKey,
          auction: auction_pda,
          aesAccount: aes_pda,
          systemProgram: SystemProgram.programId,
        },
        signers: [buyer2],
      }
    );

    await program.rpc.bidOnAuction(
      auction_bump,
      aes_bump,
      _canvas_time,
      new anchor.BN(3000),
      {
        accounts: {
          bidder: buyer.publicKey,
          lastBidder: buyer2.publicKey,
          auction: auction_pda,
          aesAccount: aes_pda,
          systemProgram: SystemProgram.programId,
        },
        signers: [buyer],
      }
    );

    const auction = await program.account.mosaicAuction.fetch(auction_pda);

    assert(auction.highestBid.toNumber() == 3000);
    assert(auction.leader.toString() == buyer.publicKey.toString());
  });

  it("Allows us to finish auction", async () => {
    await sleep(3000);

    const artLampBefore = (
      await provider.connection.getAccountInfo(artist.publicKey)
    ).lamports;

    await program.rpc.finishAuction(
      _master_bump,
      auction_bump,
      aes_bump,
      buyer_account_bump,
      _canvas_time,
      {
        accounts: {
          cubedMaster: _master_pda,
          winner: buyer.publicKey,
          owner: artist.publicKey,
          auction: auction_pda,
          aesAccount: aes_pda,
          winnerAccount: buyer_account_pda,
          tokenProgram: TOKEN_PROGRAM_ID,
          systemProgram: SystemProgram.programId,
        },
      }
    );

    const artLampAfter = (
      await provider.connection.getAccountInfo(artist.publicKey)
    ).lamports;

    assert(artLampAfter - artLampBefore === 3000);
    const artistAccountInfo = await tokenMaster.getAccountInfo(_token_pda);
    const aesAccountInfo = await tokenMaster.getAccountInfo(aes_pda);
    const buyerAccountInfo = await tokenMaster.getAccountInfo(
      buyer_account_pda
    );

    assert(buyerAccountInfo.amount.toNumber() == 1);
    assert(artistAccountInfo.amount.toNumber() == 0);
    assert(aesAccountInfo.amount.toNumber() == 0);
  });
});
