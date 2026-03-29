import { createConsumer } from '@rails/actioncable'

const cable = createConsumer('/cable')
export default cable
