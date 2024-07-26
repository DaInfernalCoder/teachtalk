import AWS from 'aws-sdk';
import { Key } from 'lucide-react';
import fs from 'fs'
import path from 'path'
import os from 'os'

export async function downloadFromS3(fileKey: string) {
    try{
        if (!process.env.NEXT_PUBLIC_S3_ACCESS_KEY_ID ||
            !process.env.NEXT_PUBLIC_S3_SECRET_ACCESS_KEY ||
            !process.env.NEXT_PUBLIC_S3_REGION ||
            !process.env.NEXT_PUBLIC_S3_BUCKET_NAME) {
            throw new Error("Missing necessary environment variables for AWS configuration");
        }
        
        console.log("Environment variables are set correctly");
        
        AWS.config.update({
            accessKeyId: process.env.NEXT_PUBLIC_S3_ACCESS_KEY_ID,
            secretAccessKey: process.env.NEXT_PUBLIC_S3_SECRET_ACCESS_KEY,
            region: process.env.NEXT_PUBLIC_S3_REGION,
        })
        const s3 = new AWS.S3({
            region: process.env.NEXT_PUBLIC_S3_REGION,
            credentials: {accessKeyId: process.env.NEXT_PUBLIC_S3_ACCESS_KEY_ID!,
                secretAccessKey: process.env.NEXT_PUBLIC_S3_SECRET_ACCESS_KEY!}
            
        })
        const params = {
            Bucket: process.env.NEXT_PUBLIC_S3_BUCKET_NAME!,
            Key: fileKey,
        }

        const obj = await s3.getObject(params).promise()

        //create a unique file name and path to store the file
        const downloadsDir = path.join(os.homedir(), 'Downloads');
        const file_name = path.join(downloadsDir, `pdf-${Date.now()}.pdf`);

        //write the file to local storage as binary (buffer)
        fs.writeFileSync(file_name, obj.Body as Buffer)
        return file_name

    } catch(error){
        console.error("Error in s3 server", error)
        return error
    }
}