import * as AWS from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'

const XAWS = AWSXRay.captureAWS(AWS)
const signVersion = new XAWS.S3({signatureVersion: 'v4'})

// FileStogare logic
export class AttachmentUtils {
    constructor(
        private readonly buckerName:string = process.env.ATTACHMENT_S3_BUCKET,
        private readonly expireAt:number = parseInt(process.env.SIGNED_URL_EXPIRATION)
    ){}
        async generateUploadUrl(uid:string, tid:string): Promise<string>{
            const attachmentUrl:string = await signVersion.getSignedUrl(
                'putObject',
                {
                    Bucket: this.buckerName,
                    Key: `image-${uid}-${tid}`,
                    Expires: this.expireAt
                })

            return attachmentUrl
        }
    
}