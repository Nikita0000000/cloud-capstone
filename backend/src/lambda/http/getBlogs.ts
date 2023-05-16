import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'

import { getBlogsForUser as getBlogsForUser } from '../../businessLogic/blogs'
import { getUserId } from '../utils';

// Get all BLOG items for a current user
export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const uid = getUserId(event)
    const blogs = await getBlogsForUser(uid)

    return {
      statusCode: 200,
      body: JSON.stringify({
        items: blogs
      })
    }
  }
)


handler.use(
  cors({
    credentials: true,
    headers: true,
    origin: '*'
  })
)
