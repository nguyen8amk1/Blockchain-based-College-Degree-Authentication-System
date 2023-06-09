/*
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const { Contract } = require('fabric-contract-api');

class FabCar extends Contract {

    async initLedger(ctx) {
        const students = [
		{
			id:'1231',
			hash:'1231',
		},
		{
			id:'1232',
			hash:'1232',
		},
		{
			id:'1233',
			hash:'1233',
		}

        ];

        for (let i = 0; i < students.length; i++) {
            // cars[i].docType = 'car';
            await ctx.stub.putState('STUDENT' + i, Buffer.from(JSON.stringify(students[i])));
            console.info('Added <--> ', students[i]);
        }
        console.info('============= END : Initialize Ledger ===========');
    }

    async queryStudent(ctx, studentNum) {
        const studentAsBytes = await ctx.stub.getState(studentNum); // get the student from chaincode state
        if (!studentAsBytes || studentAsBytes.length === 0) {
            throw new Error(`${studentNum} does not exist`);
        }
        console.log(studentAsBytes.toString());
        return studentAsBytes.toString();
    }

    async createStudent(ctx, studentNumber, id, hash) {
        console.info('============= START : Create Student ===========');

        const student = {
            id,
            hash
        };

        await ctx.stub.putState(studentNumber, Buffer.from(JSON.stringify(student)));
        console.info('============= END : Create Student ===========');
    }

    async queryAllStudents(ctx) {
        const startKey = 'CAR0';
        const endKey = 'CAR999';

        const iterator = await ctx.stub.getStateByRange(startKey, endKey);

        const allResults = [];
        while (true) {
            const res = await iterator.next();

            if (res.value && res.value.value.toString()) {
                console.log(res.value.value.toString('utf8'));

                const Key = res.value.key;
                let Record;
                try {
                    Record = JSON.parse(res.value.value.toString('utf8'));
                } catch (err) {
                    console.log(err);
                    Record = res.value.value.toString('utf8');
                }
                allResults.push({ Key, Record });
            }
            if (res.done) {
                console.log('end of data');
                await iterator.close();
                console.info(allResults);
                return JSON.stringify(allResults);
            }
        }
    }

/*
    async changeCarOwner(ctx, carNumber, newOwner) {
        console.info('============= START : changeCarOwner ===========');

        const carAsBytes = await ctx.stub.getState(carNumber); // get the car from chaincode state
        if (!carAsBytes || carAsBytes.length === 0) {
            throw new Error(`${carNumber} does not exist`);
        }
        const car = JSON.parse(carAsBytes.toString());
        car.owner = newOwner;

        await ctx.stub.putState(carNumber, Buffer.from(JSON.stringify(car)));
        console.info('============= END : changeCarOwner ===========');
    }
*/
}

module.exports = FabCar;
