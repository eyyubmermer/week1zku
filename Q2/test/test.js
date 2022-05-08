const { expect } = require("chai");
const { ethers } = require("hardhat");
const fs = require("fs");
const { groth16, plonk } = require("snarkjs");
const { PLONK } = require("snarkjs");
const { formatBytes32String } = require("ethers/lib/utils");

function unstringifyBigInts(o) {
    if ((typeof (o) == "string") && (/^[0-9]+$/.test(o))) {
        return BigInt(o);
    } else if ((typeof (o) == "string") && (/^0x[0-9a-fA-F]+$/.test(o))) {
        return BigInt(o);
    } else if (Array.isArray(o)) {
        return o.map(unstringifyBigInts);
    } else if (typeof o == "object") {
        if (o === null) return null;
        const res = {};
        const keys = Object.keys(o);
        keys.forEach((k) => {
            res[k] = unstringifyBigInts(o[k]);
        });
        return res;
    } else {
        return o;
    }
}

describe("HelloWorld", function () {
    let Verifier;
    let verifier;

    beforeEach(async function () {
        Verifier = await ethers.getContractFactory("HelloWorldVerifier");
        verifier = await Verifier.deploy();
        await verifier.deployed();
    });

    it("Should return true for correct proof", async function () {
        //[assignment] Add comments to explain what each line is doing
        const { proof, publicSignals } = await groth16.fullProve({ "a": "1", "b": "2" }, "contracts/circuits/HelloWorld/HelloWorld_js/HelloWorld.wasm", "contracts/circuits/HelloWorld/circuit_final.zkey");

        console.log('1x2 =', publicSignals[0]); //The message will be shown to user.

        const editedPublicSignals = unstringifyBigInts(publicSignals);
        const editedProof = unstringifyBigInts(proof); //unstringifyBitInts function is a module of the snarkjs library.
        const calldata = await groth16.exportSolidityCallData(editedProof, editedPublicSignals);

        const argv = calldata.replace(/["[\]\s]/g, "").split(',').map(x => BigInt(x).toString()); //tidying the scattered calldata data.

        const a = [argv[0], argv[1]]; //assigning valid arguments to variables for testing.
        const b = [[argv[2], argv[3]], [argv[4], argv[5]]];
        const c = [argv[6], argv[7]];
        const Input = argv.slice(8);

        expect(await verifier.verifyProof(a, b, c, Input)).to.be.true; // calling the verifyProof method inside the verifier file. The possible outputs of this function are true and false
    });
    it("Should return false for invalid proof", async function () {  //By making incorrect assignments to variables, invalid evidence is created and the accuracy of the proof is tested. At this stage, the program is expected to return false.
        let a = [0, 0];
        let b = [[0, 0], [0, 0]];
        let c = [0, 0];
        let d = [0]
        expect(await verifier.verifyProof(a, b, c, d)).to.be.false; //The line we call the verifyProof method in the verifier file. The input values entered must be compatible with the method's constructor. 
    });
});


describe("Multiplier3 with Groth16", function () {
    let Verifier;
    let verifier;

    beforeEach(async function () {
        Verifier = await ethers.getContractFactory("Multiplier3Verifier");
        verifier = await Verifier.deploy();
        await verifier.deployed();
    });

    it("Should return true for correct proof", async function () {
        //[assignment] Add comments to explain what each line is doing
        const { proof, publicSignals } = await groth16.fullProve({ "a": "1", "b": "2", "c": "5" }, "contracts/circuits/Multiplier3/Multiplier3_js/Multiplier3.wasm", "contracts/circuits/Multiplier3/circuit_final.zkey");

        console.log('1x2x5 =', publicSignals[0]);

        const editedPublicSignals = unstringifyBigInts(publicSignals);
        const editedProof = unstringifyBigInts(proof);
        const calldata = await groth16.exportSolidityCallData(editedProof, editedPublicSignals);

        const argv = calldata.replace(/["[\]\s]/g, "").split(',').map(x => BigInt(x).toString());

        const a = [argv[0], argv[1]];
        const b = [[argv[2], argv[3]], [argv[4], argv[5]]];
        const c = [argv[6], argv[7]];
        const Input = argv.slice(8);

        expect(await verifier.verifyProof(a, b, c, Input)).to.be.true;
    });
    it("Should return false for invalid proof", async function () {
        let a = [0, 0];
        let b = [[0, 0], [0, 0]];
        let c = [0, 0];
        let d = [0]
        expect(await verifier.verifyProof(a, b, c, d)).to.be.false;
    });
});





describe("Multiplier3 with PLONK", function () {
    let Verifier;
    let verifier;

    beforeEach(async function () {
        Verifier = await ethers.getContractFactory("PlonkVerifier");
        verifier = await Verifier.deploy();
        await verifier.deployed();
    });

    it("Should return true for correct proof", async function () {
        //[assignment] Add comments to explain what each line is doing
        const { proof, publicSignals } = await plonk.fullProve({ "a": "1", "b": "2", "c": "5" }, "contracts/circuits/_plonkMultiplier3/Multiplier3_js/Multiplier3.wasm", "contracts/circuits/_plonkMultiplier3/circuit_final.zkey");

        console.log('1x2x5 =', publicSignals[0]);

        const editedPublicSignals = unstringifyBigInts(publicSignals);
        const editedProof = unstringifyBigInts(proof);
        const calldata = await plonk.exportSolidityCallData(editedProof, editedPublicSignals);
        const calldataSplited = calldata.split(",");
        const Input = [BigInt(calldataSplited[1].replace(/["[\]\s]/g, "")).toString()];

        expect(await verifier.verifyProof(calldataSplited[0], Input)).to.be.true;
    });
    it("Should return false for invalid proof", async function () {
        let a = 0x00;
        let d = [0];
        expect(await verifier.verifyProof(a, d)).to.be.false;
    });
});






//describe("Multiplier3 with PLONK", function () {

    //beforeEach(async function () {
        //[assignment] insert your script here
    //});

    //it("Should return true for correct proof", async function () {
        //[assignment] insert your script here
    //});
    //it("Should return false for invalid proof", async function () {
        //[assignment] insert your script here
    //});
//});














