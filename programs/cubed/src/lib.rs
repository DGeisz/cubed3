use anchor_lang::prelude::*;
use anchor_lang::solana_program::account_info::AccountInfo;
use anchor_lang::solana_program::entrypoint::ProgramResult;
use anchor_lang::solana_program::native_token::sol_to_lamports;
use anchor_lang::solana_program::program_error::ProgramError;
use anchor_lang::solana_program::program_option::COption;
use anchor_lang::solana_program::pubkey::Pubkey;
use anchor_lang::solana_program::{
    hash,
    program::{invoke, invoke_signed},
    system_instruction,
};
use anchor_lang::{Accounts, CpiContext};
use anchor_spl::token::{self, MintTo, TokenAccount, Transfer};
use arrayref::{array_ref, array_refs};
use mpl_token_metadata::instruction::create_metadata_accounts;

declare_id!("5pDJMtbFrSnctiWQi57WtFgbpsuPbQKFkBMUyDMaVpef");

mod utils;

const MASTER_SEED: &[u8] = b"master";
const CANVAS_SEED_PREFIX: &[u8] = b"canvas";

const COLLECTION_SEED_PREFIX: &[u8] = b"clln";
const CUBE_PRICE: f64 = 0.01;
const COLLECTION_PRICE: f64 = 0.1;
const INIT_CUBES: u16 = 16;

const MINT_SEED_PREFIX: &[u8] = b"mint";
const TOKEN_ACCOUNT_SEED_PREFIX: &[u8] = b"token";
const ESCROW_ACCOUNT_SEED_PREFIX: &[u8] = b"escrow";
const LISTING_SEED_PREFIX: &[u8] = b"listing";
const OFFER_SEED_PREFIX: &[u8] = b"offer";
const AUCTION_SEED_PREFIX: &[u8] = b"auction";
const AUCTION_ESCROW_ACCOUNT_SEED_PREFIX: &[u8] = b"aes";

fn _account_info_to_token_account(info: &AccountInfo) -> Result<TokenAccount, ProgramError> {
    TokenAccount::try_deserialize(&mut &**info.data.borrow())
}

fn unpack_coption_key(src: &[u8; 36]) -> Result<COption<Pubkey>, ProgramError> {
    let (tag, body) = array_refs![src, 4, 32];
    match *tag {
        [0, 0, 0, 0] => Ok(COption::None),
        [1, 0, 0, 0] => Ok(COption::Some(Pubkey::new_from_array(*body))),
        _ => Err(ProgramError::InvalidAccountData),
    }
}

pub fn get_mint_authority(account_info: &AccountInfo) -> Result<COption<Pubkey>, ProgramError> {
    // In token program, 36, 8, 1, 1 is the layout, where the first 36 is mint_authority
    // so we start at 0.
    let data = account_info.try_borrow_data().unwrap();
    let authority_bytes = array_ref![data, 0, 36];

    Ok(unpack_coption_key(&authority_bytes)?)
}

#[program]
pub mod cubed {
    use std::str::FromStr;

    use mpl_token_metadata::state::Creator;

    use super::*;
    use crate::utils::MIN_CANVAS_PRICE_SOL;
    use crate::utils::{calculate_prices, get_epoch_time_secs, PricePackage};

    pub fn initialize(
        ctx: Context<Initialize>,
        _master_bump: u8,
        default_collection_name: [u8; 32],
        _collection_bump: u8,
    ) -> ProgramResult {
        let cube_master = &mut ctx.accounts.cubed_master;
        let default_collection = &mut ctx.accounts.default_collection;

        cube_master.owner = ctx.accounts.owner.key();
        cube_master.last_canvas_time = 0;
        cube_master.canvas_price_ema = sol_to_lamports(MIN_CANVAS_PRICE_SOL);

        default_collection.owner = ctx.accounts.owner.key();
        default_collection.public = true;
        default_collection.name_bytes = default_collection_name;
        default_collection.max_size = -1;
        default_collection.num_items = 0;

        Ok(())
    }

    /* We recalculate price based on `now` instead of epoch_time */
    pub fn buy_canvas(
        ctx: Context<BuyCanvas>,
        _master_bump: u8,
        _canvas_bump: u8,
        _mint_bump: u8,
        epoch_time: i64,
        collection_name_bytes: [u8; 32],
        _collection_bump: u8,
    ) -> ProgramResult {
        let cube_master = &mut ctx.accounts.cubed_master;
        let canvas = &mut ctx.accounts.canvas;
        let artist = &mut ctx.accounts.artist;
        let collection = &mut ctx.accounts.collection;

        let now = get_epoch_time_secs();

        /* Make sure the epoch time they provided for the new account isn't greater than the time now */
        if now < epoch_time {
            return Err(ProgramError::InvalidArgument);
        }

        if epoch_time < cube_master.last_canvas_time {
            return Err(ProgramError::InvalidArgument);
        }

        /* Make sure we can add to this collection */
        if !collection.public && collection.owner != artist.key() {
            /* Can't add to a private collection you don't own */
            msg!("Can't add to a private collection you don't own");
            return Err(ProgramError::InvalidArgument);
        }

        if collection.max_size > 0 && (collection.num_items as i16) >= collection.max_size {
            msg!("Can't add to a collection that's been maxed out");
            return Err(ProgramError::InvalidArgument);
        }

        let PricePackage {
            next: next_price,
            current: current_price,
        } = calculate_prices(
            cube_master.canvas_price_ema,
            (now - cube_master.last_canvas_time) as u64,
        );

        /* Make sure the artist has enough funds */
        if artist.try_lamports()? < current_price {
            return Err(ProgramError::InsufficientFunds);
        }

        /* Buy the canvas */
        invoke(
            &system_instruction::transfer(&artist.key(), &cube_master.key(), current_price),
            &[
                artist.to_account_info().clone(),
                cube_master.to_account_info(),
                ctx.accounts.system_program.to_account_info(),
            ],
        )?;

        /* Create the canvas */
        canvas.artist = artist.key();
        canvas.unused_cubes = INIT_CUBES;
        canvas.price = current_price;
        canvas.cubes_in_canvas = 0;
        canvas.last_hash = hash::hash(&epoch_time.to_le_bytes()).to_bytes();
        canvas.init_hash = canvas.last_hash;
        canvas.collection_name = collection_name_bytes;
        canvas.finished = false;

        /* Bump the collection count */
        collection.num_items += 1;

        /* Set the next price for the cubed master */
        cube_master.canvas_price_ema = next_price;
        cube_master.last_canvas_time = now;

        Ok(())
    }

    /*  */
    pub fn create_collection(
        ctx: Context<CreateCollection>,
        _master_bump: u8,
        _canvas_bump: u8,
        _epoch_time: i64,
        _collection_bump: u8,
        name_bytes: [u8; 32],
        max_size: i16,
        public: bool,
    ) -> ProgramResult {
        let cubed_master = &mut ctx.accounts.cubed_master;
        let owner = &mut ctx.accounts.owner;
        let collection = &mut ctx.accounts.collection;

        let collection_price = sol_to_lamports(COLLECTION_PRICE);

        /* Make sure the creator has enough lamports */
        if owner.try_lamports()? < collection_price {
            return Err(ProgramError::InsufficientFunds);
        }

        /* Buy the collection */
        invoke(
            &system_instruction::transfer(&owner.key(), &cubed_master.key(), collection_price),
            &[
                owner.to_account_info().clone(),
                cubed_master.to_account_info(),
                ctx.accounts.system_program.to_account_info(),
            ],
        )?;

        /* Set the collection parameters */
        collection.owner = ctx.accounts.owner.key();
        collection.max_size = max_size;
        collection.name_bytes = name_bytes;
        collection.num_items = 0;
        collection.public = public;

        Ok(())
    }

    pub fn buy_cubes(
        ctx: Context<BuyCubes>,
        _master_bump: u8,
        _canvas_bump: u8,
        _epoch_time: i64,
        num_cubes: u16,
    ) -> ProgramResult {
        let buyer = &mut ctx.accounts.buyer;
        let canvas = &mut ctx.accounts.canvas;
        let cube_master = &mut ctx.accounts.cubed_master;

        let cube_price_lamports = sol_to_lamports(CUBE_PRICE);
        let total_price = (num_cubes as u64) * cube_price_lamports;

        /* Make sure they have enough funds */
        if buyer.try_lamports()? < total_price {
            return Err(ProgramError::InsufficientFunds);
        }

        /* Make sure that the canvas isn't finished */
        if canvas.finished {
            return Err(ProgramError::InvalidAccountData);
        }

        /* Buy the canvas */
        invoke(
            &system_instruction::transfer(&buyer.key(), &cube_master.key(), total_price),
            &[
                buyer.to_account_info().clone(),
                cube_master.to_account_info(),
                ctx.accounts.system_program.to_account_info(),
            ],
        )?;

        /* Add the number of unused cubes to the canvas */
        canvas.unused_cubes += num_cubes;

        Ok(())
    }

    pub fn place_cube(
        ctx: Context<PlaceCube>,
        _canvas_bump: u8,
        _epoch_time: i64,
        algo: [u8; 512],
        x: u16,
        y: u16,
    ) -> ProgramResult {
        let artist = &mut ctx.accounts.artist;
        let canvas = &mut ctx.accounts.canvas;

        if canvas.finished {
            msg!("Can't change a finished canvas!");
            return Err(ProgramError::InvalidAccountData);
        }

        /* First check that the artist actually even owns this canvas */
        if artist.key() != canvas.artist {
            return Err(ProgramError::IllegalOwner);
        }

        /* Now check if we have enough cubes */
        if canvas.unused_cubes <= 0 {
            msg!("You don't have any unused cubes remaining!");
            return Err(ProgramError::InvalidAccountData);
        }

        /* Make sure that the canvas isn't finished */
        if canvas.finished {
            return Err(ProgramError::InvalidAccountData);
        }

        /* Make the buffer for the next hash */
        let mut buffer: Vec<u8> = Vec::new();
        buffer.extend_from_slice(&[0]);
        buffer.extend_from_slice(&algo);
        buffer.extend_from_slice(&x.to_le_bytes());
        buffer.extend_from_slice(&y.to_le_bytes());
        buffer.extend_from_slice(&canvas.last_hash);

        /* Set the next hash */
        canvas.last_hash = hash::hash(&buffer[..]).to_bytes();

        /* Decrease the number of unused cubes */
        canvas.unused_cubes -= 1;

        /* Incr the number of cubes we have in the canvas */
        canvas.cubes_in_canvas += 1;

        Ok(())
    }

    pub fn remove_cube(
        ctx: Context<RemoveCube>,
        _canvas_bump: u8,
        _epoch_time: i64,
        x: u16,
        y: u16,
    ) -> ProgramResult {
        let artist = &mut ctx.accounts.artist;
        let canvas = &mut ctx.accounts.canvas;

        if canvas.finished {
            msg!("Can't change a finished canvas!");
            return Err(ProgramError::InvalidAccountData);
        }

        /* First check that the artist actually even owns this canvas */
        if artist.key() != canvas.artist {
            return Err(ProgramError::IllegalOwner);
        }

        if canvas.cubes_in_canvas <= 0 {
            msg!("This doesn't have any cubes in the canvas!");
            return Err(ProgramError::InvalidArgument);
        }

        /* Make sure that the canvas isn't finished */
        if canvas.finished {
            return Err(ProgramError::InvalidAccountData);
        }

        /* Make the buffer for the next hash */
        let mut buffer: Vec<u8> = Vec::new();
        buffer.extend_from_slice(&[1]);
        buffer.extend_from_slice(&x.to_le_bytes());
        buffer.extend_from_slice(&y.to_le_bytes());
        buffer.extend_from_slice(&canvas.last_hash);

        /* Set the next hash */
        canvas.last_hash = hash::hash(&buffer[..]).to_bytes();

        /* Decr the number of cubes in canvas */
        canvas.cubes_in_canvas -= 1;

        Ok(())
    }

    pub fn mint_mosaic(
        ctx: Context<MintMosaic>,
        _master_bump: u8,
        _canvas_bump: u8,
        _mint_bump: u8,
        _token_bump: u8,
        epoch_time: i64,
    ) -> ProgramResult {
        let canvas = &mut ctx.accounts.canvas;
        let artist = &mut ctx.accounts.artist;

        if canvas.finished {
            msg!("Canvas is already finished");
            return Err(ProgramError::InvalidAccountData);
        }

        let cpi_accounts = MintTo {
            mint: ctx.accounts.mint.clone(),
            to: ctx.accounts.token_account.clone(),
            authority: ctx.accounts.cubed_master.to_account_info().clone(),
        };
        let cpi_program = ctx.accounts.token_program.clone();

        let m_bump = [_master_bump];
        let m_seed = [MASTER_SEED, &m_bump];

        let t_bump = [_token_bump];
        let t_seed = [
            TOKEN_ACCOUNT_SEED_PREFIX,
            &epoch_time.to_le_bytes(),
            &artist.key().to_bytes(),
            &t_bump[..],
        ];

        msg!("Minting token...");

        let mi_bump = [_mint_bump];
        let mi_seed = [MINT_SEED_PREFIX, &epoch_time.to_le_bytes(), &mi_bump[..]];
        let seed = &[&m_seed[..], &t_seed[..], &mi_seed[..]][..];

        let context = CpiContext::new_with_signer(cpi_program, cpi_accounts, seed);

        token::mint_to(context, 1)?;
        canvas.finished = true;

        msg!(
            "Balgo {:?} {:?}",
            ctx.accounts.cubed_master.key(),
            get_mint_authority(&ctx.accounts.mint.to_account_info())
        );

        /* Now create the token metadata */
        let ix = create_metadata_accounts(
            ctx.accounts.token_metadata_program.key(),
            ctx.accounts.metadata.key(),
            ctx.accounts.mint.key(),
            ctx.accounts.cubed_master.key(),
            artist.key(),
            ctx.accounts.cubed_master.key(),
            "Cubed Mosaic".to_string(),
            "".to_string(),
            format!(
                "https://dmjmpivqt60di.cloudfront.net/data/{}.json",
                epoch_time
            ),
            Some(vec![
                Creator {
                    address: ctx.accounts.cubed_master.key(),
                    verified: true,
                    share: 3,
                },
                Creator {
                    address: artist.key(),
                    verified: false,
                    share: 97,
                },
            ]),
            3,
            true,
            false,
        );

        // let metadata_account_info = next_account_info(account_info_iter)?;
        // let mint_info = next_account_info(account_info_iter)?;
        // let mint_authority_info = next_account_info(account_info_iter)?;
        // let payer_account_info = next_account_info(account_info_iter)?;
        // let update_authority_info = next_account_info(account_info_iter)?;
        // let system_account_info = next_account_info(account_info_iter)?;
        // let rent_info = next_account_info(account_info_iter)?;

        // //   0. `[writable]`  Metadata key (pda of ['metadata', program id, mint id])
        // //   1. `[]` Mint of token asset
        // //   2. `[signer]` Mint authority
        // //   3. `[signer]` payer
        // //   4. `[]` update authority info
        // //   5. `[]` System program
        // //   6. `[]` Rent info
        invoke_signed(
            &ix,
            &[
                ctx.accounts.metadata.to_account_info(),
                ctx.accounts.mint.to_account_info(),
                ctx.accounts.cubed_master.to_account_info(),
                artist.to_account_info(),
                ctx.accounts.cubed_master.to_account_info(),
                ctx.accounts.system_program.to_account_info(),
                ctx.accounts.rent.to_account_info(),
            ],
            &[&m_seed[..]][..],
        )?;

        Ok(())
    }

    pub fn list_mosaic(
        ctx: Context<ListMosaic>,
        _master_bump: u8,
        _mint_bump: u8,
        _token_bump: u8,
        _escrow_bump: u8,
        _listing_bump: u8,
        epoch_time: i64,
        price: u64,
    ) -> ProgramResult {
        let token_account = &mut ctx.accounts.token_account;
        let owner = &mut ctx.accounts.owner;
        let escrow_account = &mut ctx.accounts.escrow_account;
        let listing = &mut ctx.accounts.listing;

        let token_data = _account_info_to_token_account(token_account)?;
        let escrow_data = _account_info_to_token_account(escrow_account)?;

        if token_data.amount != 1 && escrow_data.amount != 0 {
            msg!("Account owner must currently possess nft");
            return Err(ProgramError::InvalidAccountData);
        }

        let cpi_accounts = Transfer {
            from: token_account.to_account_info().clone(),
            to: escrow_account.to_account_info().clone(),
            authority: owner.to_account_info().clone(),
        };
        let cpi_program = ctx.accounts.token_program.clone();

        let t_bump = [_token_bump];
        let t_seed = [
            TOKEN_ACCOUNT_SEED_PREFIX,
            &epoch_time.to_le_bytes(),
            &owner.key().to_bytes(),
            &t_bump[..],
        ];

        let e_bump = [_escrow_bump];
        let e_seed = [
            ESCROW_ACCOUNT_SEED_PREFIX,
            &epoch_time.to_le_bytes(),
            &e_bump[..],
        ];

        let seed = &[&t_seed[..], &e_seed[..]][..];
        let context = CpiContext::new_with_signer(cpi_program, cpi_accounts, seed);

        token::transfer(context, 1)?;

        listing.price = price;
        listing.owner = owner.key();

        Ok(())
    }

    pub fn change_listing(
        ctx: Context<ChangeListing>,
        _escrow_bump: u8,
        _listing_bump: u8,
        _epoch_time: i64,
        price: u64,
    ) -> ProgramResult {
        let escrow_account = &mut ctx.accounts.escrow_account;
        let listing = &mut ctx.accounts.listing;

        let escrow_data = _account_info_to_token_account(escrow_account)?;

        if escrow_data.amount != 1 {
            msg!("Owner's escrow account must possess nft to change listing");
            return Err(ProgramError::InvalidAccountData);
        }

        listing.price = price;

        Ok(())
    }

    pub fn buy_mosaic(
        ctx: Context<BuyMosaic>,
        _master_bump: u8,
        _mint_bump: u8,
        _buyer_account_bump: u8,
        _escrow_bump: u8,
        _listing_bump: u8,
        epoch_time: i64,
    ) -> ProgramResult {
        let escrow_account = &mut ctx.accounts.escrow_account;
        let listing = &mut ctx.accounts.listing;
        let buyer = &mut ctx.accounts.buyer;
        let buyer_account = &mut ctx.accounts.buyer_account;
        let cubed_master = &mut ctx.accounts.cubed_master;
        let owner = &mut ctx.accounts.owner;

        let escrow_data = _account_info_to_token_account(escrow_account)?;

        if escrow_data.amount != 1 {
            msg!("Owner's escrow account must possess nft to change listing");
            return Err(ProgramError::InvalidAccountData);
        }

        if listing.owner == buyer.key() {
            msg!("Can't buy it from yourself!");
            return Err(ProgramError::InvalidAccountData);
        }

        if buyer.to_account_info().try_lamports()? < listing.price {
            msg!("Buyer doesn't have enough lamports!");
            return Err(ProgramError::InsufficientFunds);
        }

        /* First transfer the funds */
        invoke(
            &system_instruction::transfer(&buyer.key(), &listing.owner, listing.price),
            &[
                buyer.to_account_info().clone(),
                owner.clone(),
                ctx.accounts.system_program.to_account_info(),
            ],
        )?;

        /* Transfer the NFT */
        let cpi_accounts = Transfer {
            from: escrow_account.to_account_info().clone(),
            to: buyer_account.to_account_info().clone(),
            authority: cubed_master.to_account_info().clone(),
        };
        let cpi_program = ctx.accounts.token_program.clone();

        let t_bump = [_buyer_account_bump];
        let t_seed = [
            TOKEN_ACCOUNT_SEED_PREFIX,
            &epoch_time.to_le_bytes(),
            &buyer.key().to_bytes(),
            &t_bump[..],
        ];

        let e_bump = [_escrow_bump];
        let e_seed = [
            ESCROW_ACCOUNT_SEED_PREFIX,
            &epoch_time.to_le_bytes(),
            &e_bump[..],
        ];

        let m_bump = [_master_bump];
        let m_seed = [MASTER_SEED, &m_bump];

        let seed = &[&t_seed[..], &e_seed[..], &m_seed[..]][..];
        let context = CpiContext::new_with_signer(cpi_program, cpi_accounts, seed);

        token::transfer(context, 1)?;

        Ok(())
    }

    pub fn remove_listing(
        ctx: Context<RemoveListing>,
        _master_bump: u8,
        _token_bump: u8,
        _escrow_bump: u8,
        _listing_bump: u8,
        epoch_time: i64,
    ) -> ProgramResult {
        let escrow_account = &mut ctx.accounts.escrow_account;
        let token_account = &mut ctx.accounts.token_account;
        let cubed_master = &mut ctx.accounts.cubed_master;
        let owner = &mut ctx.accounts.owner;

        let escrow_data = _account_info_to_token_account(escrow_account)?;

        if escrow_data.amount != 1 {
            msg!("Escrow doesn't have the nft!");
            return Err(ProgramError::InvalidAccountData);
        }

        /* We want to transfer the token back to the user's account */
        let cpi_accounts = Transfer {
            from: escrow_account.to_account_info().clone(),
            to: token_account.to_account_info().clone(),
            authority: cubed_master.to_account_info().clone(),
        };
        let cpi_program = ctx.accounts.token_program.clone();

        let m_bump = [_master_bump];
        let m_seed = [MASTER_SEED, &m_bump];

        let t_bump = [_token_bump];
        let t_seed = [
            TOKEN_ACCOUNT_SEED_PREFIX,
            &epoch_time.to_le_bytes(),
            &owner.key().to_bytes(),
            &t_bump[..],
        ];

        let e_bump = [_escrow_bump];
        let e_seed = [
            ESCROW_ACCOUNT_SEED_PREFIX,
            &epoch_time.to_le_bytes(),
            &e_bump[..],
        ];

        let seed = &[&t_seed[..], &e_seed[..], &m_seed[..]][..];
        let context = CpiContext::new_with_signer(cpi_program, cpi_accounts, seed);

        token::transfer(context, 1)?;

        Ok(())
    }

    pub fn make_offer(
        ctx: Context<MakeOffer>,
        _offer_bump: u8,
        epoch_time: i64,
        price: u64,
    ) -> ProgramResult {
        if price == 0 {
            msg!("Can't offer nothing for canvas");
            return Err(ProgramError::InvalidArgument);
        }

        let offer_account = &mut ctx.accounts.offer;
        let bidder = &mut ctx.accounts.bidder;

        /* Make sure they have enough money */
        if bidder.try_lamports()? < price {
            return Err(ProgramError::InsufficientFunds);
        }

        /* Transfer the money */
        let o_bump = [_offer_bump];
        let o_seed = [OFFER_SEED_PREFIX, &epoch_time.to_le_bytes(), &o_bump[..]];

        invoke_signed(
            &system_instruction::transfer(&bidder.key(), &offer_account.key(), price),
            &[
                bidder.to_account_info().clone(),
                offer_account.to_account_info(),
                ctx.accounts.system_program.to_account_info(),
            ],
            &[&o_seed[..]][..],
        )?;

        offer_account.bidder = bidder.key();
        offer_account.price = price;
        offer_account.active = true;

        Ok(())
    }

    pub fn increase_offer(
        ctx: Context<IncreaseOffer>,
        offer_bump: u8,
        epoch_time: i64,
        price: u64,
    ) -> ProgramResult {
        let offer_account = &mut ctx.accounts.offer;
        let old_bidder = &mut ctx.accounts.old_bidder;
        let bidder = &mut ctx.accounts.bidder;
        let old_price = offer_account.price.clone();

        /* Make sure we have the correct old bidder */
        if offer_account.bidder != old_bidder.key() {
            return Err(ProgramError::InvalidAccountData);
        }

        /* Make sure we're actually increasing the price */
        if price < offer_account.price {
            return Err(ProgramError::InvalidAccountData);
        }

        /* Transfer the money */
        let o_bump = [offer_bump];
        let o_seed = [OFFER_SEED_PREFIX, &epoch_time.to_le_bytes(), &o_bump[..]];

        let transfer_amount = if bidder.key() == old_bidder.key() {
            price - offer_account.price
        } else {
            price
        };

        invoke_signed(
            &system_instruction::transfer(&bidder.key(), &offer_account.key(), transfer_amount),
            &[
                bidder.to_account_info().clone(),
                offer_account.to_account_info(),
                ctx.accounts.system_program.to_account_info(),
            ],
            &[&o_seed[..]][..],
        )?;

        /* If we're moving to a different bidder, then move money back to old bidder
        (this has to come after the system_instruction::transfer) */
        if bidder.key() != old_bidder.key() {
            **offer_account.to_account_info().try_borrow_mut_lamports()? -= old_price;
            **old_bidder.to_account_info().try_borrow_mut_lamports()? += old_price;
        }

        offer_account.bidder = bidder.key();
        offer_account.price = price;

        Ok(())
    }

    pub fn accept_offer(
        ctx: Context<AcceptOffer>,
        _master_bump: u8,
        _mint_bump: u8,
        _owner_account_bump: u8,
        _bidder_account_bump: u8,
        _offer_bump: u8,
        epoch_time: i64,
    ) -> ProgramResult {
        /* First we want to ensure that this boi actually owns the nft */
        let owner = &mut ctx.accounts.owner;
        let owner_account = &mut ctx.accounts.owner_account;
        let offer = &mut ctx.accounts.offer;
        let bidder_account = &mut ctx.accounts.bidder_account;
        let bidder = &mut ctx.accounts.bidder;

        let old_price = offer.price.clone();

        let token_data = _account_info_to_token_account(owner_account)?;

        if offer.price == 0 {
            msg!("Offer price zero indicates the offer isn't active");
            return Err(ProgramError::InvalidAccountData);
        }

        if token_data.amount != 1 {
            msg!("Only the current owner can accept the token!");
            return Err(ProgramError::InvalidAccountData);
        }

        let cpi_accounts = Transfer {
            from: owner_account.to_account_info().clone(),
            to: bidder_account.to_account_info().clone(),
            authority: owner.to_account_info().clone(),
        };
        let cpi_program = ctx.accounts.token_program.clone();

        let t_bump = [_owner_account_bump];
        let t_seed = [
            TOKEN_ACCOUNT_SEED_PREFIX,
            &epoch_time.to_le_bytes(),
            &owner.key().to_bytes(),
            &t_bump[..],
        ];

        let e_bump = [_bidder_account_bump];
        let e_seed = [
            TOKEN_ACCOUNT_SEED_PREFIX,
            &epoch_time.to_le_bytes(),
            &bidder.key().to_bytes(),
            &e_bump[..],
        ];

        let seed = &[&t_seed[..], &e_seed[..]][..];
        let context = CpiContext::new_with_signer(cpi_program, cpi_accounts, seed);

        token::transfer(context, 1)?;

        **offer.to_account_info().try_borrow_mut_lamports()? -= old_price;
        **owner.to_account_info().try_borrow_mut_lamports()? += old_price;

        /* Change this offer price to zero so that new owners can't accept a false offer */
        offer.price = 0;

        Ok(())
    }

    pub fn remove_offer(
        ctx: Context<RemoveOffer>,
        _offer_bump: u8,
        _epoch_time: i64,
    ) -> ProgramResult {
        let bidder = &mut ctx.accounts.bidder;
        let offer = &mut ctx.accounts.offer;

        **offer.to_account_info().try_borrow_mut_lamports()? -= offer.price;
        **bidder.to_account_info().try_borrow_mut_lamports()? += offer.price;

        offer.price = 0;
        offer.active = false;

        Ok(())
    }

    pub fn create_auction(
        ctx: Context<CreateAuction>,
        _master_bump: u8,
        _auction_bump: u8,
        _owner_account_bump: u8,
        _mint_bump: u8,
        aes_bump: u8,
        epoch_time: i64,
        end_time: i64,
        tick: u64,
    ) -> ProgramResult {
        let owner_account = &mut ctx.accounts.owner_account;
        let aes_account = &mut ctx.accounts.aes_account;
        let owner = &mut ctx.accounts.owner;
        let auction = &mut ctx.accounts.auction;

        let current_time = get_epoch_time_secs();

        if end_time < current_time {
            return Err(ProgramError::InvalidArgument);
        }

        let owner_data = _account_info_to_token_account(owner_account)?;

        if owner_data.amount != 1 {
            return Err(ProgramError::InvalidAccountData);
        }

        /* Transfer the token into the auction escrow account */
        let cpi_accounts = Transfer {
            from: owner_account.to_account_info().clone(),
            to: aes_account.to_account_info().clone(),
            authority: owner.to_account_info().clone(),
        };
        let cpi_program = ctx.accounts.token_program.clone();

        let t_bump = [_owner_account_bump];
        let t_seed = [
            TOKEN_ACCOUNT_SEED_PREFIX,
            &epoch_time.to_le_bytes(),
            &owner.key().to_bytes(),
            &t_bump[..],
        ];

        let e_bump = [aes_bump];
        let e_seed = [
            AUCTION_ESCROW_ACCOUNT_SEED_PREFIX,
            &epoch_time.to_le_bytes(),
            &e_bump[..],
        ];

        let seed = &[&t_seed[..], &e_seed[..]][..];
        let context = CpiContext::new_with_signer(cpi_program, cpi_accounts, seed);

        token::transfer(context, 1)?;

        auction.end_time = end_time;
        auction.highest_bid = 0;
        auction.tick = tick;
        auction.leader = owner.key();

        Ok(())
    }

    pub fn bid_on_auction(
        ctx: Context<BidOnAuction>,
        auction_bump: u8,
        _aes_bump: u8,
        epoch_time: i64,
        bid: u64,
    ) -> ProgramResult {
        let aes_account = &mut ctx.accounts.aes_account;
        let bidder = &mut ctx.accounts.bidder;
        let last_bidder = &mut ctx.accounts.last_bidder;
        let auction = &mut ctx.accounts.auction;

        let current_time = get_epoch_time_secs();

        /* Make sure auction is still running */
        if current_time > auction.end_time {
            return Err(ProgramError::InvalidArgument);
        }

        /* Make sure bid is higher than current bid plus tick */
        if bid < auction.highest_bid + auction.tick {
            return Err(ProgramError::InvalidArgument);
        }

        let aes_data = _account_info_to_token_account(&aes_account)?;

        /* Make sure we're actively in auction */
        if aes_data.amount != 1 {
            return Err(ProgramError::InvalidAccountData);
        }

        let last_bid = auction.highest_bid;

        if bidder.try_lamports()? < bid {
            return Err(ProgramError::InsufficientFunds);
        }

        let a_bump = [auction_bump];
        let a_seed = [AUCTION_SEED_PREFIX, &epoch_time.to_le_bytes(), &a_bump[..]];

        /* Move the bid funds into the auction account */
        invoke_signed(
            &system_instruction::transfer(&bidder.key(), &auction.key(), bid),
            &[
                bidder.to_account_info().clone(),
                auction.to_account_info(),
                ctx.accounts.system_program.to_account_info(),
            ],
            &[&a_seed[..]][..],
        )?;

        /* Return the old funds */
        **auction.to_account_info().try_borrow_mut_lamports()? -= last_bid;
        **last_bidder.to_account_info().try_borrow_mut_lamports()? += last_bid;

        auction.highest_bid = bid;
        auction.leader = bidder.key();

        Ok(())
    }

    pub fn finish_auction(
        ctx: Context<FinishAuction>,
        master_bump: u8,
        _auction_bump: u8,
        aes_bump: u8,
        winner_account_bump: u8,
        epoch_time: i64,
    ) -> ProgramResult {
        let aes_account = &mut ctx.accounts.aes_account;
        let winner = &mut ctx.accounts.winner;
        let winner_account = &mut ctx.accounts.winner_account;
        let owner = &mut ctx.accounts.owner;
        let auction = &mut ctx.accounts.auction;
        let cubed_master = &mut ctx.accounts.cubed_master;

        let current_time = get_epoch_time_secs();

        /* Make sure auction has finished */
        if current_time < auction.end_time {
            return Err(ProgramError::InvalidArgument);
        }

        let aes_data = _account_info_to_token_account(&aes_account)?;

        /* Make sure the nft is still in escrow */
        if aes_data.amount != 1 {
            return Err(ProgramError::InvalidAccountData);
        }

        /* First transfer the nft to the winner's account */
        let cpi_accounts = Transfer {
            from: aes_account.to_account_info().clone(),
            to: winner_account.to_account_info().clone(),
            authority: cubed_master.to_account_info().clone(),
        };
        let cpi_program = ctx.accounts.token_program.clone();

        let m_bump = [master_bump];
        let m_seed = [MASTER_SEED, &m_bump];

        let t_bump = [winner_account_bump];
        let t_seed = [
            TOKEN_ACCOUNT_SEED_PREFIX,
            &epoch_time.to_le_bytes(),
            &winner.key().to_bytes(),
            &t_bump[..],
        ];

        let e_bump = [aes_bump];
        let e_seed = [
            AUCTION_ESCROW_ACCOUNT_SEED_PREFIX,
            &epoch_time.to_le_bytes(),
            &e_bump[..],
        ];

        let seed = &[&t_seed[..], &e_seed[..], &m_seed[..]][..];
        let context = CpiContext::new_with_signer(cpi_program, cpi_accounts, seed);

        token::transfer(context, 1)?;

        let highest_bid = auction.highest_bid.clone();

        /* Now transfer funds from the auction account to the owner */
        **auction.to_account_info().try_borrow_mut_lamports()? -= highest_bid;
        **owner.to_account_info().try_borrow_mut_lamports()? += highest_bid;

        /* Zero out the auction account */
        auction.highest_bid = 0;

        Ok(())
    }
}

#[derive(Accounts)]
#[instruction(master_bump: u8, auction_bump: u8,  aes_bump: u8, winner_account_bump: u8, epoch_time: i64)]
pub struct FinishAuction<'info> {
    #[account(mut)]
    winner: AccountInfo<'info>,
    #[account(mut)]
    owner: AccountInfo<'info>,
    #[account(
        mut,
        seeds = [MASTER_SEED],
        bump = master_bump)]
    pub cubed_master: Account<'info, CubedMaster>,
    #[account(
        mut,
        constraint = auction.leader == winner.key(),
        seeds = [AUCTION_SEED_PREFIX, &epoch_time.to_le_bytes()],
        bump = auction_bump,
    )]
    pub auction: Account<'info, MosaicAuction>,
    #[account(
        mut,
        seeds = [AUCTION_ESCROW_ACCOUNT_SEED_PREFIX, &epoch_time.to_le_bytes()],
        bump = aes_bump
    )]
    pub aes_account: AccountInfo<'info>,
    #[account(
        mut,
        seeds = [TOKEN_ACCOUNT_SEED_PREFIX, &epoch_time.to_le_bytes(), &winner.key().to_bytes()],
        bump = winner_account_bump
    )]
    pub winner_account: AccountInfo<'info>,
    pub token_program: AccountInfo<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(auction_bump: u8,  aes_bump: u8, epoch_time: i64)]
pub struct BidOnAuction<'info> {
    #[account(mut)]
    pub bidder: Signer<'info>,
    #[account(mut)]
    pub last_bidder: AccountInfo<'info>,
    #[account(
        mut,
        constraint = auction.leader == last_bidder.key(),
        seeds = [AUCTION_SEED_PREFIX, &epoch_time.to_le_bytes()],
        bump = auction_bump,
    )]
    pub auction: Account<'info, MosaicAuction>,
    #[account(
        mut,
        seeds = [AUCTION_ESCROW_ACCOUNT_SEED_PREFIX, &epoch_time.to_le_bytes()],
        bump = aes_bump
    )]
    pub aes_account: AccountInfo<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(_master_bump: u8, auction_bump: u8, _owner_account_bump: u8, _mint_bump: u8, aes_bump: u8,  epoch_time: i64)]
pub struct CreateAuction<'info> {
    #[account(mut)]
    pub owner: Signer<'info>,
    #[account(
        seeds = [MINT_SEED_PREFIX, &epoch_time.to_le_bytes()],
        bump = _mint_bump,
        )]
    pub mint: AccountInfo<'info>,
    #[account(
        mut,
        seeds = [TOKEN_ACCOUNT_SEED_PREFIX, &epoch_time.to_le_bytes(), &owner.key().to_bytes()],
        bump = _owner_account_bump
    )]
    pub owner_account: AccountInfo<'info>,
    #[account(
        init_if_needed,
        payer = owner,
        seeds = [AUCTION_SEED_PREFIX, &epoch_time.to_le_bytes()],
        bump = auction_bump,
        space = 8 + 8 + 8 + 32 + 8
    )]
    pub auction: Account<'info, MosaicAuction>,
    #[account(
        mut,
        seeds = [MASTER_SEED],
        bump = _master_bump)]
    pub cubed_master: Account<'info, CubedMaster>,
    #[account(
        init_if_needed,
        payer = owner,
        token::mint = mint,
        token::authority = cubed_master,
        seeds = [AUCTION_ESCROW_ACCOUNT_SEED_PREFIX, &epoch_time.to_le_bytes()],
        bump = aes_bump
    )]
    pub aes_account: AccountInfo<'info>,
    pub system_program: Program<'info, System>,
    pub token_program: AccountInfo<'info>,
    pub rent: Sysvar<'info, Rent>,
}

#[derive(Accounts)]
#[instruction(offer_bump: u8, epoch_time: i64)]
pub struct RemoveOffer<'info> {
    #[account(mut)]
    pub bidder: Signer<'info>,
    #[account(
        mut,
        constraint = offer.active == true,
        seeds = [OFFER_SEED_PREFIX, &epoch_time.to_le_bytes()],
        bump = offer_bump,
    )]
    pub offer: Account<'info, MosaicOffer>,
    pub system_program: Program<'info, System>,
}

/* We're going to say that you just have to have this unlisted to accept an offer */
#[derive(Accounts)]
#[instruction(_master_bump: u8, _mint_bump: u8, _owner_account_bump: u8, bidder_account_bump: u8, offer_bump: u8, epoch_time: i64)]
pub struct AcceptOffer<'info> {
    #[account(mut)]
    pub owner: Signer<'info>,
    #[account(mut)]
    pub bidder: AccountInfo<'info>,
    #[account(
        mut,
        constraint = offer.active == true,
        has_one = bidder,
        seeds = [OFFER_SEED_PREFIX, &epoch_time.to_le_bytes()],
        bump = offer_bump,
    )]
    pub offer: Account<'info, MosaicOffer>,
    #[account(
        seeds = [MINT_SEED_PREFIX, &epoch_time.to_le_bytes()],
        bump = _mint_bump,
        )]
    pub mint: AccountInfo<'info>,
    #[account(
        mut,
        seeds = [TOKEN_ACCOUNT_SEED_PREFIX, &epoch_time.to_le_bytes(), &owner.key().to_bytes()],
        bump = _owner_account_bump
    )]
    pub owner_account: AccountInfo<'info>,
    #[account(
        init_if_needed,
        payer = owner,
        token::mint = mint,
        token::authority = bidder,
        seeds = [TOKEN_ACCOUNT_SEED_PREFIX, &epoch_time.to_le_bytes(), &bidder.key().to_bytes()],
        bump = bidder_account_bump
    )]
    pub bidder_account: AccountInfo<'info>,
    pub system_program: Program<'info, System>,
    pub token_program: AccountInfo<'info>,
    pub rent: Sysvar<'info, Rent>,
}

#[derive(Accounts)]
#[instruction(offer_bump: u8, epoch_time: i64)]
pub struct IncreaseOffer<'info> {
    #[account(mut)]
    pub bidder: Signer<'info>,
    #[account(mut)]
    pub old_bidder: AccountInfo<'info>,
    #[account(
        mut,
        constraint = offer.active == true,
        seeds = [OFFER_SEED_PREFIX, &epoch_time.to_le_bytes()],
        bump = offer_bump,
    )]
    pub offer: Account<'info, MosaicOffer>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(offer_bump: u8, epoch_time: i64)]
pub struct MakeOffer<'info> {
    #[account(mut)]
    pub bidder: Signer<'info>,
    #[account(
        init_if_needed,
        payer = bidder,
        seeds = [OFFER_SEED_PREFIX, &epoch_time.to_le_bytes()],
        bump = offer_bump,
        space = 8 + 32 + 8 + 1,
    )]
    pub offer: Account<'info, MosaicOffer>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(_master_bump: u8, _token_bump: u8, escrow_bump: u8, _listing_bump: u8, epoch_time: i64)]
pub struct RemoveListing<'info> {
    #[account(mut)]
    pub owner: Signer<'info>,
    #[account(
        mut,
        seeds = [MASTER_SEED],
        bump = _master_bump)]
    pub cubed_master: Account<'info, CubedMaster>,
    #[account(
        mut,
        has_one = owner,
        seeds = [LISTING_SEED_PREFIX, &epoch_time.to_le_bytes()],
        bump = _listing_bump
    )]
    pub listing: Account<'info, MosaicListing>,
    #[account(
        mut,
        seeds = [ESCROW_ACCOUNT_SEED_PREFIX, &epoch_time.to_le_bytes()],
        bump = escrow_bump
    )]
    pub escrow_account: AccountInfo<'info>,
    #[account(
        mut,
        seeds = [TOKEN_ACCOUNT_SEED_PREFIX, &epoch_time.to_le_bytes(), &owner.key().to_bytes()],
        bump = _token_bump
    )]
    pub token_account: AccountInfo<'info>,
    pub system_program: Program<'info, System>,
    pub token_program: AccountInfo<'info>,
    pub rent: Sysvar<'info, Rent>,
}

#[derive(Accounts)]
#[instruction(_master_bump: u8, _mint_bump: u8, _buyer_account_bump: u8, escrow_bump: u8, _listing_bump: u8, epoch_time: i64)]
pub struct BuyMosaic<'info> {
    #[account(
        mut,
        seeds = [MASTER_SEED],
        bump = _master_bump)]
    pub cubed_master: Account<'info, CubedMaster>,
    #[account(mut)]
    pub buyer: Signer<'info>,
    #[account(mut)]
    pub owner: AccountInfo<'info>,
    #[account(
        seeds = [MINT_SEED_PREFIX, &epoch_time.to_le_bytes()],
        bump = _mint_bump,
        )]
    pub mint: AccountInfo<'info>,
    #[account(
        has_one = owner,
        seeds = [LISTING_SEED_PREFIX, &epoch_time.to_le_bytes()],
        bump = _listing_bump,
    )]
    pub listing: Account<'info, MosaicListing>,
    #[account(
        init_if_needed,
        payer = buyer,
        token::mint = mint,
        token::authority = buyer,
        seeds = [TOKEN_ACCOUNT_SEED_PREFIX, &epoch_time.to_le_bytes(), &buyer.key().to_bytes()],
        bump = _buyer_account_bump
    )]
    pub buyer_account: AccountInfo<'info>,
    #[account(
        mut,
        seeds = [ESCROW_ACCOUNT_SEED_PREFIX, &epoch_time.to_le_bytes()],
        bump = escrow_bump
    )]
    pub escrow_account: AccountInfo<'info>,
    pub system_program: Program<'info, System>,
    pub token_program: AccountInfo<'info>,
    pub rent: Sysvar<'info, Rent>,
}

#[derive(Accounts)]
#[instruction(_master_bump: u8, _canvas_bump: u8, _mint_bump: u8, _token_bump: u8, epoch_time: i64)]
pub struct MintMosaic<'info> {
    #[account(mut)]
    pub artist: Signer<'info>,
    #[account(
        mut,
        seeds = [MASTER_SEED],
        bump = _master_bump)]
    pub cubed_master: Account<'info, CubedMaster>,
    #[account(
        mut,
        seeds = [CANVAS_SEED_PREFIX, &epoch_time.to_le_bytes()],
        bump = _canvas_bump)]
    pub canvas: Account<'info, CubedCanvas>,
    #[account(
        init,
        payer = artist,
        token::mint = mint,
        token::authority = artist,
        seeds = [TOKEN_ACCOUNT_SEED_PREFIX, &epoch_time.to_le_bytes(), &artist.key().to_bytes()],
        bump = _token_bump
    )]
    pub token_account: AccountInfo<'info>,
    // #[account(address = mpl_token_metadata::id())]
    token_metadata_program: AccountInfo<'info>,
    #[account(mut)]
    metadata: UncheckedAccount<'info>,
    #[account(
        mut,
        seeds = [MINT_SEED_PREFIX, &epoch_time.to_le_bytes()],
        bump = _mint_bump,
        )]
    pub mint: AccountInfo<'info>,
    pub system_program: Program<'info, System>,
    pub token_program: AccountInfo<'info>,
    pub rent: Sysvar<'info, Rent>,
}

#[derive(Accounts)]
#[instruction(escrow_bump: u8, _listing_bump: u8, epoch_time: i64)]
pub struct ChangeListing<'info> {
    #[account(mut)]
    pub owner: Signer<'info>,
    #[account(
        mut,
        has_one = owner,
        seeds = [LISTING_SEED_PREFIX, &epoch_time.to_le_bytes()],
        bump = _listing_bump,
    )]
    pub listing: Account<'info, MosaicListing>,
    #[account(
        seeds = [ESCROW_ACCOUNT_SEED_PREFIX, &epoch_time.to_le_bytes()],
        bump = escrow_bump
    )]
    pub escrow_account: AccountInfo<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(_master_bump: u8, _mint_bump: u8, _token_bump: u8, escrow_bump: u8, _listing_bump: u8, epoch_time: i64)]
pub struct ListMosaic<'info> {
    #[account(mut)]
    pub owner: Signer<'info>,
    #[account(
        mut,
        seeds = [MASTER_SEED],
        bump = _master_bump)]
    pub cubed_master: Account<'info, CubedMaster>,
    #[account(
        init_if_needed,
        payer = owner,
        seeds = [LISTING_SEED_PREFIX, &epoch_time.to_le_bytes()],
        bump = _listing_bump,
        space = 8 + 8 + 32
    )]
    pub listing: Account<'info, MosaicListing>,
    #[account(
        init_if_needed,
        payer = owner,
        token::mint = mint,
        token::authority = cubed_master,
        seeds = [ESCROW_ACCOUNT_SEED_PREFIX, &epoch_time.to_le_bytes()],
        bump = escrow_bump
    )]
    pub escrow_account: AccountInfo<'info>,
    #[account(
        mut,
        seeds = [MINT_SEED_PREFIX, &epoch_time.to_le_bytes()],
        bump = _mint_bump,
        )]
    pub mint: AccountInfo<'info>,
    #[account(
        mut,
        seeds = [TOKEN_ACCOUNT_SEED_PREFIX, &epoch_time.to_le_bytes(), &owner.key().to_bytes()],
        bump = _token_bump
    )]
    pub token_account: AccountInfo<'info>,
    pub system_program: Program<'info, System>,
    pub token_program: AccountInfo<'info>,
    pub rent: Sysvar<'info, Rent>,
}

#[derive(Accounts)]
#[instruction(master_bump: u8, default_collection_name: [u8; 32], collection_bump: u8)]
pub struct Initialize<'info> {
    #[account(init, payer = owner,
        space = 8 + 32 + 16 + 8,
        seeds = [MASTER_SEED], bump = master_bump)]
    pub cubed_master: Account<'info, CubedMaster>,
    #[account(init, payer = owner,
        space = 8 + 32 + 1 + 64 + 16 + 16,
        seeds = [COLLECTION_SEED_PREFIX, &default_collection_name], bump = collection_bump)]
    pub default_collection: Account<'info, CubedCollection>,
    #[account(mut)]
    pub owner: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(_master_bump: u8, _canvas_bump: u8, _mint_bump: u8, epoch_time: i64, collection_name_bytes: [u8; 32], collection_bump: u8)]
pub struct BuyCanvas<'info> {
    #[account(mut)]
    pub artist: Signer<'info>,
    #[account(
        mut,
        seeds = [MASTER_SEED],
        bump = _master_bump)]
    pub cubed_master: Account<'info, CubedMaster>,
    #[account(
        mut,
        seeds = [COLLECTION_SEED_PREFIX, &collection_name_bytes],
        bump = collection_bump)]
    pub collection: Account<'info, CubedCollection>,
    #[account(
        init,
        payer = artist,
        seeds = [CANVAS_SEED_PREFIX, &epoch_time.to_le_bytes()],
        bump = _canvas_bump,
        space = 8 + 196 + 1)]
    pub canvas: Account<'info, CubedCanvas>,
    #[account(
        init,
        payer = artist,
        mint::decimals = 0,
        mint::authority = cubed_master,
        seeds = [MINT_SEED_PREFIX, &epoch_time.to_le_bytes()],
        bump = _mint_bump,
        )]
    pub mint: AccountInfo<'info>,
    pub system_program: Program<'info, System>,
    pub token_program: AccountInfo<'info>,
    pub rent: Sysvar<'info, Rent>,
}

#[derive(Accounts)]
#[instruction(master_bump: u8, canvas_bump: u8, epoch_time: i64, collection_bump: u8, name_bytes: [u8; 32])]
pub struct CreateCollection<'info> {
    #[account(mut)]
    pub owner: Signer<'info>,
    #[account(
        mut,
        seeds = [MASTER_SEED],
        bump = master_bump)]
    pub cubed_master: Account<'info, CubedMaster>,
    #[account(
        init,
        payer = owner,
        seeds = [COLLECTION_SEED_PREFIX, &name_bytes],
        bump = collection_bump,
        space = 8 + 129)]
    pub collection: Account<'info, CubedCollection>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(master_bump: u8, canvas_bump: u8, epoch_time: i64)]
pub struct BuyCubes<'info> {
    #[account(mut)]
    pub buyer: Signer<'info>,
    #[account(
        mut,
        seeds = [MASTER_SEED],
        bump = master_bump)]
    pub cubed_master: Account<'info, CubedMaster>,
    #[account(
        mut,
        seeds = [CANVAS_SEED_PREFIX, &epoch_time.to_le_bytes()],
        bump = canvas_bump)]
    pub canvas: Account<'info, CubedCanvas>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(canvas_bump: u8, epoch_time: i64)]
pub struct PlaceCube<'info> {
    #[account(mut)]
    pub artist: Signer<'info>,
    #[account(
    mut,
    seeds = [CANVAS_SEED_PREFIX, &epoch_time.to_le_bytes()],
    bump = canvas_bump)]
    pub canvas: Account<'info, CubedCanvas>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(canvas_bump: u8, epoch_time: i64)]
pub struct RemoveCube<'info> {
    #[account(mut)]
    pub artist: Signer<'info>,
    #[account(
    mut,
    seeds = [CANVAS_SEED_PREFIX, &epoch_time.to_le_bytes()],
    bump = canvas_bump)]
    pub canvas: Account<'info, CubedCanvas>,
    pub system_program: Program<'info, System>,
}

#[account]
pub struct CubedMaster {
    pub owner: Pubkey,
    pub last_canvas_time: i64,
    pub canvas_price_ema: u64,
}

#[account]
pub struct CubedCollection {
    pub owner: Pubkey,
    pub public: bool,
    pub name_bytes: [u8; 32],
    pub max_size: i16,
    pub num_items: u16,
}

#[account]
pub struct CubedCanvas {
    pub artist: Pubkey,
    pub price: u64,
    pub unused_cubes: u16,
    pub cubes_in_canvas: u16,
    pub init_hash: [u8; 32],
    pub last_hash: [u8; 32],
    pub collection_name: [u8; 32],
    pub finished: bool,
}

#[account]
pub struct MosaicListing {
    price: u64,
    owner: Pubkey,
}

#[account]
pub struct MosaicOffer {
    bidder: Pubkey,
    price: u64,
    active: bool,
}

#[account]
pub struct MosaicAuction {
    end_time: i64,
    highest_bid: u64,
    tick: u64,
    leader: Pubkey,
}
