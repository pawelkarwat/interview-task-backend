import { Injectable } from '@nestjs/common';
import * as AWS from 'aws-sdk';
import { MemoryStoredFile } from 'nestjs-form-data';

@Injectable()
export class S3Service {
  AWS_S3_BUCKET = process.env.AWS_S3_BUCKET;
  s3 = new AWS.S3({
    accessKeyId: process.env.AWSAccessKeyId,
    secretAccessKey: process.env.AWSSecretKey,
  });

  async uploadFile(file: MemoryStoredFile) {
    const { originalName } = file;

    return await this.s3Upload(
      file.buffer,
      this.AWS_S3_BUCKET,
      originalName,
      file.mimetype,
    );
  }

  private async s3Upload(
    fileBuffer: Buffer,
    bucket: string,
    name: string,
    mimetype,
  ) {
    const params = {
      Bucket: bucket,
      Key: String(name),
      Body: fileBuffer,
      ACL: 'public-read',
      ContentType: mimetype,
      ContentDisposition: 'inline',
    };

    try {
      const s3Response = await this.s3.upload(params).promise();
      return s3Response.Location;
    } catch (err) {
      console.error(err);
    }
  }
}
