#!/bin/bash

anchor build && anchor deploy && 
# Chrome Browser wallet
solana airdrop 100 26zcqBg1BUK6jai2UgnurAdzz4wL6E7sRt2Eutstv6xQ 
# Brave browser wallet
solana airdrop 100 AdRLtRpZ7XYKjbS65TPkmfdTqtdG5qHZrS3MicDVcdck
# solana program deploy programs/cubed/external_programs/mpl_token_metadata.so &
