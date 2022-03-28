#!/bin/bash

anchor build && anchor deploy & 
solana airdrop 100 26zcqBg1BUK6jai2UgnurAdzz4wL6E7sRt2Eutstv6xQ & 
solana program deploy programs/cubed/external_programs/mpl_token_metadata.so &
