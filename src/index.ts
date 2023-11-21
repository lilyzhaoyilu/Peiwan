import { bot } from 'init/client';
import { echoMenu } from './commands/echo/echo.menu';
import { publicOrder } from './commands/order/public_order'
import { reactionResponseProcessor } from './commands/order/reaction_response_processor';
import { choosePeiwanProcessor } from './commands/order/choose_pw_processor';
bot.messageSource.on('message', (e) => {
    console.log(e);
    const msg = e as any;
    reactionResponseProcessor(e);
    choosePeiwanProcessor(e);
});


bot.addCommands(echoMenu);
bot.addAlias(publicOrder, "点单");
bot.addCommands(publicOrder);

bot.connect();

console.log("bot connect");

bot.logger.debug('system init success');
