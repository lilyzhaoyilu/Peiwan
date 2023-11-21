import axios from 'axios';
import auth from 'configs/auth';
import { bot } from 'init/client';
import { Card } from "kbotify";
import { ERROR } from 'sqlite3';
import { getUserInfo, getKookMessage } from './kook_functions';
const sqlite3 = require('sqlite3').verbose();

export const choosePeiwanProcessor = async (msg: any) => {
  if (msg.type != 255 || msg.extra?.type != 'message_btn_click') {
    return;
  }

  if (!msg.extra?.body?.value || !msg.extra.body.value.includes("ChoosePW")) {
    return;
  }
  // e.g.
  // {
  //   poster_msg_id: '650dee73-1745-48ad-81fe-de57d9526785',
  //   poster: '384215301',
  //   responder: '384215301',
  //   poster_channel_id: '12323123'
  // }
  const income_button_value = JSON.parse(msg.extra.body.value);
  if (msg.extra?.body?.user_info?.id !== income_button_value.poster) {
    return;
  }

  const responder_info = await getUserInfo(income_button_value.responder);
  const responder_name = responder_info.nickname ? responder_info.nickname : responder_info.username;
  const poster_name = msg.extra?.body?.user_info?.nickname ? msg.extra?.body?.user_info?.nickname : msg.extra?.body?.user_info?.username;
  const diandan_card = generateOrderCardToString(poster_name, responder_name);
  try {
    await bot.API.message.create(10, income_button_value.poster_channel_id, diandan_card, income_button_value.poster_msg_id);
  } catch (err) {
    console.error("choosePeiwanProcessor create error: ", err);
  }
  const poster_message = await getKookMessage(income_button_value.poster_msg_id);
  try {
    await bot.API.message.update(income_button_value.poster_msg_id, updateCardWithSuccessEnding(poster_message.content));
  } catch (err) {
    console.error("choosePeiwanProcessor update error: ", err);
  }
  return;
}

// If this then change checkIsOrderOngoing
const updateCardWithSuccessEnding = (org_card: string) => {
  const cur_card = org_card.slice(1, -1);
  const card = new Card(cur_card);
  card.addText("此单已经结束。已经成功点单。:heavy_check_mark:")
  return `${card}`;
}
// End IFTT

const generateOrderCardToString = (poster_nickname: string, responder_nickname: string) => {
  const card = new Card().setColor('#b2e9b0').setSize('lg');
  card.addTitle(`🎉恭贺🎉`);

  card.addText(`(font)${poster_nickname}(font)[success] 点单 **陪玩${responder_nickname}**`);
  card.addText("游戏愉快哦！");

  return `${card}`;
}