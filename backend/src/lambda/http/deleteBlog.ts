import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors, httpErrorHandler } from 'middy/middlewares'

import { deleteBlog } from '../../businessLogic/blogs'
import { getUserId } from '../utils'

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const blogId = event.pathParameters.blogId
    //Remove a BLOG item by id
    const uid = getUserId(event)
    await deleteBlog(uid, blogId)
    
    return {
      statusCode: 200,
      body: 'Deleted'
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
