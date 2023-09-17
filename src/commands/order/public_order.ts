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
        card.addTitle("派单中");
        card.addText(`${session.user.nickname || session.user.username}发起派单`);
        card.addText(args);
        // get name and content
        // session.args  (rol)25562347(rol)

        // session.user.nickname || session.user.username

        // const message_id = session.msg?.msgId;

        card.addText('尊敬的老板！抢单陪玩的名片将会以私信的方式发送给您。\n各位陪玩请阅读需求，点击下方的 “👍” 开始抢单。')
        // const now = new Date();
        // const end = new Date(now.getTime() + 300 * 1000);
        // card.addCountdown("second", end, now);
        // card.addModule({
        //     type: "section", text: {
        //         "type": "kmarkdown",
        //         "content": `aba abababa`
        //     },
        //     mode: "right",
        //     accessory: {
        //         "type": "button",
        //         "theme": "primary",
        //         "click": "return-val",
        //         "value": `抢单`,
        //         "text": {
        //             "type": "plain-text",
        //             "content": "我要抢单"
        //         }
        //     }
        // });
        const rep_message = await session.replyCard(card);
        if (rep_message?.msgSent?.msgId) {
            const sent_id = rep_message.msgSent.msgId;
            session.client.API.message.addReaction(sent_id, '👍');
        }


        bot.API.directMessage.create(9, session.user.id, undefined, `以下陪玩参与抢单啦，请选择您心仪的陪玩！\n亲爱的老板，如果没有心仪的陪玩抢单，请☛ 点击进入，进行私聊派单，厚米娘会帮你私聊通知陪玩 `);

        //抢单的机器人消息id e.extra.body.msg_id

        // set a sleep...?

        // if a placer picks someone, close & succ
        // if time expires, close
        // if a placer quits, closs
    };
}

export const publicOrder = new PublicOrder();