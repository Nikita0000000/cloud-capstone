import * as AWS from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { createLogger } from '../utils/logger'
import { BlogUpdate } from '../models/BlogUpdate';
import { UpdateBlogRequest } from '../requests/UpdateBlogRequest'
import { BlogItem } from '../models/BlogItem'

const XAWS = AWSXRay.captureAWS(AWS)

const logger = createLogger('BlogsAccess')

// dataLayer logic
export class BlogsAccess {
    constructor(
        private readonly documentClient: DocumentClient = new XAWS.DynamoDB.DocumentClient(),
        private readonly createAtIndex:string = process.env.BLOGS_CREATED_AT_INDEX,
        private readonly blogTable: string = process.env.BLOGS_TABLE
    ){}

    async createBlog(newBlog:BlogItem): Promise<BlogItem> {
        logger.info("Adding new Blog Item to database ...")
        await this.documentClient.put({
            TableName: this.blogTable,
            Item: newBlog
        }).promise()

        return newBlog
    }

    async getBlogsForUser(uId:string): Promise<BlogItem[]>{
        logger.info(`Selecting all Blog Items for user: ${uId}`)
        const query = await this.documentClient.query({
            TableName: this.blogTable,
            IndexName: this.createAtIndex,
            KeyConditionExpression: 'userId = :userId',
            ExpressionAttributeValues: {':userId': uId}

        }).promise()
        return query.Items as BlogItem[]
    }

    async updateBlog(uId: string, tId: string, updateBlog:UpdateBlogRequest): Promise<BlogUpdate>{
        const item = await this.documentClient.update({
            TableName: this.blogTable,
            Key: {'userId': uId, 'blogId': tId},
            ExpressionAttributeNames: {
                '#NAMES': 'name',
                '#SSUMM': 'summary',
                '#DDATE': 'dueDate',
                '#DONE': 'done'
            },
            UpdateExpression: 'SET #NAMES = :name, #SSUMM = :summary, #DDATE = :dueDate, #DONE = :done',
            ExpressionAttributeValues: {
                ':name': updateBlog.name,
                ':summary': updateBlog.summary,
                ':dueDate': updateBlog.dueDate,
                ':done': updateBlog.done
            },
            ReturnValues: 'UPDATED_NEW'
        }).promise()

        return item.Attributes as BlogUpdate
    }

    async deleteBlog(uId:string, tId:string) {
        await this.documentClient.delete({
            TableName: this.blogTable,
            Key: {'userId': uId, 'blogId': tId}
        }).promise()
    }
}
