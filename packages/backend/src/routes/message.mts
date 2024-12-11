import MessageController from '../controller/message.mjs'
import { router } from './index.mjs'

router.all('/sayhello', MessageController.sayHello)

export { router }
