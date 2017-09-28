#!/usr/bin/env node

import * as minimist from "minimist";
import { WebCrypto as Pkcs11Crypto } from "node-webcrypto-p11";
import { SPACE } from "./const";
import { crypto, ICrypto } from "./crypto";
import { TestDigests } from "./test_digest";
import { TestEC } from "./test_ec";
import { TestRSA } from "./test_rsa";

const alg = { name: "ECDSA", hash: "SHA-256", namedCurve: "P-384" };

async function Main() {
    let argv: any;
    await Promise.resolve()
        .then(() => {
            // Get arguments
            argv = minimist(process.argv.slice(2), {
                alias: {
                    d: "debug",
                    h: "help",
                    p: "pin",
                    s: "slot",
                    w: "write",
                },
                default: {
                    debug: false,
                    slot: 0,
                    write: false,
                },
                string: ["pin"],
            });

            crypto.pkcs11 = new Pkcs11Crypto({
                library: argv._[0],
                pin: argv.pin,
                readWrite: argv.write,
                slot: argv.slot,
            });

            PrintInfo(crypto.pkcs11);
            Test(crypto);
        })
        .catch((err) => {
            if (argv && argv.debug) {
                console.error(err);
            } else {
                console.log(`Error: ${err.message}`);
            }
        });
}

function PrintInfo(crypto: Pkcs11Crypto) {
    const info = crypto.info;
    console.log("PKCS#11 info:");
    console.log(`${SPACE}Name: ${info.name}`);
    console.log(`${SPACE}Reader: ${info.reader}`);
    console.log(`${SPACE}Serial number: ${info.serialNumber}`);
    console.log(`${SPACE}Slot: ${info.slot}`);
    console.log(`${SPACE}Type: ${info.isHardware ? "Hardware" : "Software"}`);
    console.log(`${SPACE}Algorithms: ${info.algorithms.join(", ")}`);
    console.log();
}

async function Test(crypto: ICrypto) {
    console.log("Tests:");
    await TestDigests();
    await TestEC();
    await TestRSA();
}

Main()
    .catch((err) => {
        console.error(err);
    });
