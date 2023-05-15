import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors, httpErrorHandler } from 'middy/middlewares'

import { updateBlog } from '../../businessLogic/blogs'
import { UpdateBlogRequest } from '../../requests/UpdateBlogRequest'
import { getUserId } from '../utils'

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const blogId = event.pathParameters.blogId
    const updatedBlog: UpdateBlogRequest = JSON.parse(event.body)
    // Update a BLOG item with the provided id using values in the "updatedBlog" object
    const uid = getUserId(event)
    const blogitem = await updateBlog(updatedBlog, uid, blogId)

    return {
      statusCode: 202,
      body: JSON.stringify({
        blogitem
      })
    }
  }
)

handler
  .use(httpErrorHandler())
  .use(
    cors({
      credentials: true,
      headers: true,
      origin: '*'
    })
  )
