import { TodosAccess } from '../helpers/todosAcess'
import { AttachmentUtils } from '../helpers/attachmentUtils';
import { TodoItem } from '../models/TodoItem'
import { CreateTodoRequest } from '../requests/CreateTodoRequest'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'
import { createLogger } from '../utils/logger'
import * as uuid from 'uuid'
import * as createError from 'http-errors'

//  businessLogic for Todo app
const todoAccess = new TodosAccess()
const logger = createLogger("Todo Business Logic:")
const attUtils = new AttachmentUtils()

export async function createTodo(uid:string, newTodo:CreateTodoRequest): Promise<TodoItem> {
    const tid: uuid = uuid.v4()
    const createdAt: string = Date.now().toString()
    const attachmentUrl: string = `https://${process.env.ATTACHMENT_S3_BUCKET}.s3.amazonaws.com/image-${uid}-${tid}`
    const newTodoItem: TodoItem = {
        userId: uid,
        todoId: tid,
        createdAt: createdAt,
        name: newTodo.name,
        dueDate: newTodo.dueDate,
        done: false,
        attachmentUrl: attachmentUrl
    }

    try{
        logger.info("Creating new todo item ...")
        return await todoAccess.createTodo(newTodoItem)
    } catch(e){
        logger.error(createError(e.message))
    }
}

export async function getTodosForUser(uid:string): Promise<TodoItem[]> {
    try {
       logger.info("Selecting Items ...")
       return await todoAccess.getTodosForUser(uid)
    } catch(e) {
       logger.error(createError(e.message))
    }
}

export async function updateTodo(updatedTodo:UpdateTodoRequest, uid:string, tid: string): Promise<UpdateTodoRequest> {
    try{
        logger.info("Updating todo item ...")
        return todoAccess.updateTodo(uid, tid, updatedTodo)
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

export async function deleteTodo(uid:string, tid:string) {
    try{
        logger.info("Deletion in progress ...")
        await todoAccess.deleteTodo(uid, tid)
    } catch(e){
        logger.error(createError(e.message))
    }
}