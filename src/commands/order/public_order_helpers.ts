import axios from 'axios';
import auth from 'configs/auth';
import { bot } from 'init/client';

export const buttonResponseProcessor = async (msg: any) => {


  if (msg.type != 255 || msg.extra?.type != 'added_reaction') {
    return;
  }

  const order_post_msg_id = msg.extra?.body?.msg_id;


  // 1. check roles, if roles is corrrect
  // 2. Check if the orignal order is still ongoing, call KOOK
  // 3. send placer the corresponding card

  if (msg.extra?.body?.user_id != '2457371735') {
    // TODO: change this to query all peiwan
    return;
  }

  const data = await getKookMessage(order_post_msg_id);
  const is_ongoing = checkIsOrderOngoing(`${data.data.content}`);
  if (!is_ongoing) {
    return;
  }
  const customer_kook_id = data.data.quote.author.id;
  await bot.API.directMessage.create(9, customer_kook_id, undefined, `${msg.extra.body.user_id}抢单啦!`);

  return;
}

const getKookMessage = async (msg_id: string) => {
  try {
    const res = await axios.get(`https://www.kookapp.cn/api/v3/message/view?msg_id=${msg_id}`, {
      headers: {
        Authorization: `Bot ${auth.khltoken}`
      }
    })
    return res.data;
  } catch (e) {

  }
}

const checkIsOrderOngoing = (content: string): boolean => {
  if (content.includes("派单中")) {
    return true;
  }
  return false;
}