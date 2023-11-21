import axios from 'axios';
import auth from 'configs/auth';
import { bot } from 'init/client';
import { Card } from "kbotify";
import { ERROR } from 'sqlite3';
const sqlite3 = require('sqlite3').verbose();

const HEADERS = {
  Authorization: `Bot ${auth.khltoken}`
}

export const reactionResponseProcessor = async (msg: any) => {
  // responder 回复表情 接单的
  // poster 发单人


  if (msg.type != 255 || msg.extra?.type != 'added_reaction' || msg.extra?.body?.emoji?.id !== "👍") {
    return;
  }
  const responder_user_id = msg.extra?.body?.user_id;
  if (!responder_user_id) {
    return;
  }
  const responder_user_info = await getUserInfo(responder_user_id);
  const responder_roles = responder_user_info?.roles;
  if (!responder_roles || responder_roles.length == 0) {
    return;
  }

  const poster_message = await getKookMessage(msg.extra?.body?.msg_id);
  if (!poster_message) {
    return;
  }
  const is_ongoing = checkIsOrderOngoing(`${poster_message.content}`);
  if (!is_ongoing) {
    return;
  }

  const wanted_roles = poster_message.mention_roles;
  if (!wanted_roles || wanted_roles.length === 0) {
    return;
  }

  let responder_has_qualified_role = false;

  for (const wanted of wanted_roles) {
    for (const responder_role of responder_roles) {
      if (wanted === responder_role) {
        responder_has_qualified_role = true;
        break;
      }
    }
  }


  // const data = await getKookMessage(order_post_msg_id);


  // 1. check roles, if roles is corrrect
  // 2. Check if the orignal order is still ongoing, call KOOK
  // 3. send placer the corresponding card


  try {
    const beijingTime = poster_message?.quote?.create_at && !isNaN(Number(poster_message.quote.create_at)) ? new Date(poster_message.quote.create_at).toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai', hour12: false }) : '';

    await bot.API.directMessage.create(9, responder_user_id, undefined, `你已经成功抢单\n${poster_message?.quote?.author?.nickname} 于 ${beijingTime} 发的抢单的内容：${getContentAfterRole(poster_message?.quote?.content)}`);
  } catch (err) {
    console.error("API.directMessage.create 你已经成功抢单 error:", err);
  }

  const poster_kook_id = poster_message.quote.author.id;
  await sendResponderCardToPoster(responder_user_id, responder_user_info.nickname, poster_kook_id)

  return;
}

const getContentAfterRole = (content: string) => {
  if (!content) {
    return content;
  }

  const lastIndex = content.lastIndexOf('(rol)');

  return lastIndex === -1 ? content : content.substring(lastIndex + '(rol)'.length);
}

const getKookMessage = async (msg_id: string) => {
  try {
    const res = await axios.get(`https://www.kookapp.cn/api/v3/message/view?msg_id=${msg_id}`, {
      headers: HEADERS
    })
    return res.data?.data ? res.data.data : {};
  } catch (e) {
    console.error("getKookMessage Error: ", e);
    return {};
  }
}

const checkIsOrderOngoing = (content: string): boolean => {
  if (!content) {
    return false;
  }
  if (content.includes("派单中")) {
    return true;
  }
  return false;
}

const getUserInfo = async (userId: string, guildId: string = auth.guildId) => {
  const USER_ROLE_REQUEST = `https://www.kookapp.cn/api/v3/user/view?guild_id=${guildId}&user_id=${userId}`;
  if (userId == "" || userId === undefined || userId.length < 1) {
    return {};
  }

  try {
    const res = await axios.get(USER_ROLE_REQUEST, {
      headers: HEADERS
    })
    return res.data?.data ? res.data.data : {};
  } catch (err) {
    console.error("Error at getUserRoles: ", err);
    return {};
  }
}

const sendResponderCardToPoster = async (responder_kook_id: string, responder_fallback_name: string, poster_kook_id: string) => {
  const peiwan_data = await getPeiwanInfo(responder_kook_id);

  if (!peiwan_data) {
    return await bot.API.directMessage.create(9, poster_kook_id, undefined, `${responder_fallback_name}抢单啦!`);
  }

  const peiwan = peiwan_data[0];
  if (!peiwan_data[0]) {
    return await bot.API.directMessage.create(9, poster_kook_id, undefined, `${responder_fallback_name}抢单啦!`);
  }


  const { name, display_id: displayId, introduction, location, timbre, picture_url: pictureUrl } = peiwan;

  return await bot.API.directMessage.create(10, poster_kook_id, undefined, generateCardToString(name, displayId, introduction, location, timbre, pictureUrl));
}

const getPeiwanInfo = async (kookId: string): Promise<any[]> => {
  if (!kookId) {
    return [];
  }

  const db = await new sqlite3.Database(auth.DBPATH);

  try {
    const rows: any[] = await new Promise((resolve, reject) => {
      db.all(
        `SELECT display_id, name, introduction, location, timbre, picture_url FROM peiwan WHERE kook_id=${kookId};`,
        (err: any, rows: any[]) => {
          if (err) {
            console.error(err);
            reject(err);
          } else {
            resolve(rows);
          }
        }
      );
    });

    return rows;
  } catch (error) {
    console.error(error);
    throw error;
  } finally {
    // Close the database connection in the finally block to ensure it happens
    await db.close();
  }
};
const generateCardToString = (name: string, displayId: string, introduction: string, location: string, timbre: string, pictureUrl: string) => {
  const card = new Card().setColor('#b2e9b0').setSize('lg');
  card.addTitle(`${name} 抢单啦`);
  card.addText(`个人简介: ${introduction ? introduction : '暂无'}`);
  card.addText(`地点: ${location ? location : '暂无'}`);
  card.addText(`音色: ${timbre ? timbre : '暂无'}`);
  if (pictureUrl) {
    card.addImage(pictureUrl);
  };
  return `${card}`;
}