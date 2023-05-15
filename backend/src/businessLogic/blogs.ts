import { BlogsAccess } from '../helpers/blogsAcess'
import { AttachmentUtils } from '../helpers/attachmentUtils';
import { BlogItem } from '../models/BlogItem'
import { CreateBlogRequest } from '../requests/CreateBlogRequest'
import { UpdateBlogRequest } from '../requests/UpdateBlogRequest'
import { createLogger } from '../utils/logger'
import * as uuid from 'uuid'
import * as createError from 'http-errors'

//  businessLogic for Blog app
const blogAccess = new BlogsAccess()
const logger = createLogger("Blog Business Logic:")
const attUtils = new AttachmentUtils()

export async function createBlog(uid:string, newBlog:CreateBlogRequest): Promise<BlogItem> {
    const tid: uuid = uuid.v4()
    const createdAt: string = Date.now().toString()
    const attachmentUrl: string = `https://${process.env.ATTACHMENT_S3_BUCKET}.s3.amazonaws.com/image-${uid}-${tid}`
    const newBlogItem: BlogItem = {
        userId: uid,
        blogId: tid,
        createdAt: createdAt,
        name: newBlog.name,
        summary: newBlog.summary,
        dueDate: newBlog.dueDate,
        done: false,
        attachmentUrl: attachmentUrl
    }

    try{
        logger.info("Creating new blog item ...")
        return await blogAccess.createBlog(newBlogItem)
    } catch(e){
        logger.error(createError(e.message))
    }
}

export async function getBlogsForUser(uid:string): Promise<BlogItem[]> {
    try {
       logger.info("Selecting Items ...")
       return await blogAccess.getBlogsForUser(uid)
    } catch(e) {
       logger.error(createError(e.message))
    }
}

export async function updateBlog(updatedBlog:UpdateBlogRequest, uid:string, tid: string): Promise<UpdateBlogRequest> {
    try{
        logger.info("Updating blog item ...")
        return blogAccess.updateBlog(uid, tid, updatedBlog)
    }catch(e){
        logger.error(createError(e.message))
    }
}

export async function createAttachmentPresignedUrl(uid:string, tid:string): Promise<string> {
    try{
        logger.info("Generating presigned url ...")
        return await attUtils.generateUploadUrl(uid, tid)
    } catch(e){
        logger.error(createError(e.message))
    }
}

export async function deleteBlog(uid:string, tid:string) {
    try{
        logger.info("Deletion in progress ...")
        await blogAccess.deleteBlog(uid, tid)
    } catch(e){
        logger.error(createError(e.message))
    }
}