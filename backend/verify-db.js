import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

// Force load the Atlas URI manually instead of relying on the possibly reverted .env
const atlasUri = "mongodb+srv://aruldharan94_db_user:nyBBMvi1vqJPV57I@cluster0.07a4mih.mongodb.net/ShopX?retryWrites=true&w=majority";

import fs from 'fs';

async function verify() {
    let output = '';
    const log = (msg) => {
        console.log(msg);
        output += msg + '\n';
    };

    try {
        await mongoose.connect(atlasUri);
        log("Connected to Atlas...");
        
        const db = mongoose.connection.db;
        const productCount = await db.collection('products').countDocuments();
        const userCount = await db.collection('users').countDocuments();
        const categoryCount = await db.collection('categories').countDocuments();

        log(`Products: ${productCount}`);
        log(`Users: ${userCount}`);
        log(`Categories: ${categoryCount}`);

        if (productCount > 0) {
            const firstProduct = await db.collection('products').findOne({});
            log(`Sample Product: ${firstProduct?.name}`);
        }

        fs.writeFileSync('verify_db.log', output);
        process.exit(0);
    } catch (err) {
        fs.writeFileSync('verify_db.log', output + '\n' + err.stack);
        process.exit(1);
    }
}

verify();
