import { AppCommand, AppFunc, BaseSession, Card } from 'kbotify';
import { bot } from 'init/client';

class PublicOrder extends AppCommand {
    code = 'order'; // 只是用作标记
    trigger = 'order'; // 用于触发的文字
    help = ''; // 帮助文字
    intro = '';
    func: AppFunc<BaseSession> = async (session) => {
        const args = session.args.join(' ');
        const card = new Card();
        card.addTitle("Fate 陪玩店 点单");
        card.addText(`${session.user.nickname || session.user.username}发起派单`);
        card.addText(args);

        card.addText('尊敬的老板！抢单陪玩的名片将会以私信的方式发送给您。\n各位陪玩请阅读需求，点击下方的 “👍” 开始抢单。');

        const rep_message = await session.replyCard(card);
        if (rep_message?.msgSent?.msgId) {
            const sent_id = rep_message.msgSent.msgId;
            session.client.API.message.addReaction(sent_id, '👍');
        }

        bot.API.directMessage.create(9, session.user.id, undefined, `以下陪玩参与抢单啦，请选择您心仪的陪玩！\n亲爱的老板，如果没有心仪的陪玩抢单，请找客服私聊派单。`);
        return;
    };
}

export const publicOrder = new PublicOrder();