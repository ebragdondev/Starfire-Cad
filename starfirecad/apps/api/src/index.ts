import { env } from './env';
import { createServer } from './server';

const { httpServer } = createServer();

httpServer.listen(Number(env.PORT), () => {
  // eslint-disable-next-line no-console
  console.log(`API listening on http://localhost:${env.PORT}`);
});