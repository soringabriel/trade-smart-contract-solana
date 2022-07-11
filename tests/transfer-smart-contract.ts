import * as anchor from "@project-serum/anchor";
import { Program } from "@project-serum/anchor";
import { TransferSmartContract } from "../target/types/transfer_smart_contract";
import { expect, assert } from 'chai';

describe("transfer-smart-contract", () => {
    // Configure the client to use the local cluster.
    anchor.setProvider(anchor.AnchorProvider.env());

    const program = anchor.workspace.TransferSmartContract as Program<TransferSmartContract>;

    it("Create wallet works!", async () => {
        const walletKeyPair = anchor.web3.Keypair.generate();
        const user = program.provider.wallet;
        await program.rpc.createWallet({
            accounts: {
                wallet: walletKeyPair.publicKey,
                user: user.publicKey,
                systemProgram: anchor.web3.SystemProgram.programId
            },
            signers: [walletKeyPair]
        });

        let wallet = await program.account.wallet.fetch(walletKeyPair.publicKey);
        expect(wallet.eur).to.equal(0);
        expect(wallet.usd).to.equal(0);
    });

    it("Buy usd works!", async () => {
        const walletKeyPair = anchor.web3.Keypair.generate();
        const user = program.provider.wallet;
        await program.rpc.createWallet({
            accounts: {
                wallet: walletKeyPair.publicKey,
                user: user.publicKey,
                systemProgram: anchor.web3.SystemProgram.programId
            },
            signers: [walletKeyPair]
        });

        await program.rpc.buyUsd(10, {
            accounts: {
                wallet: walletKeyPair.publicKey,
            },
            signers: []
        });

        let wallet = await program.account.wallet.fetch(walletKeyPair.publicKey);
        expect(wallet.eur).to.equal(0);
        expect(wallet.usd).to.equal(10);
    });

    it("Buy eur works!", async () => {
        const walletKeyPair = anchor.web3.Keypair.generate();
        const user = program.provider.wallet;
        await program.rpc.createWallet({
            accounts: {
                wallet: walletKeyPair.publicKey,
                user: user.publicKey,
                systemProgram: anchor.web3.SystemProgram.programId
            },
            signers: [walletKeyPair]
        });

        await program.rpc.buyUsd(10, {
            accounts: {
                wallet: walletKeyPair.publicKey,
            },
            signers: []
        });

        let wallet = await program.account.wallet.fetch(walletKeyPair.publicKey);
        expect(wallet.eur).to.equal(0);
        expect(wallet.usd).to.equal(10);
    });

    it("Trade eur works!", async () => {
        const walletKeyPair = anchor.web3.Keypair.generate();
        const user = program.provider.wallet;
        await program.rpc.createWallet({
            accounts: {
                wallet: walletKeyPair.publicKey,
                user: user.publicKey,
                systemProgram: anchor.web3.SystemProgram.programId
            },
            signers: [walletKeyPair]
        });

        await program.rpc.buyEur(10, {
            accounts: {
                wallet: walletKeyPair.publicKey,
            },
            signers: []
        });

        await program.rpc.tradeEurForUsd(10, {
            accounts: {
                wallet: walletKeyPair.publicKey,
            },
            signers: []
        });

        let wallet = await program.account.wallet.fetch(walletKeyPair.publicKey);
        expect(wallet.eur).to.equal(0);
        expect(wallet.usd).to.equal(10 * 1.1);
    });

    it("Trade usd works!", async () => {
        const walletKeyPair = anchor.web3.Keypair.generate();
        const user = program.provider.wallet;
        await program.rpc.createWallet({
            accounts: {
                wallet: walletKeyPair.publicKey,
                user: user.publicKey,
                systemProgram: anchor.web3.SystemProgram.programId
            },
            signers: [walletKeyPair]
        });

        await program.rpc.buyUsd(10, {
            accounts: {
                wallet: walletKeyPair.publicKey,
            },
            signers: []
        });

        await program.rpc.tradeUsdForEur(10, {
            accounts: {
                wallet: walletKeyPair.publicKey,
            },
            signers: []
        });

        let wallet = await program.account.wallet.fetch(walletKeyPair.publicKey);
        expect(wallet.eur).to.equal(10 * 0.9);
        expect(wallet.usd).to.equal(0);
    });
});
