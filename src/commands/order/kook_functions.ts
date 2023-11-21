import auth from 'configs/auth';
import axios from 'axios';
const HEADERS = {
  Authorization: `Bot ${auth.khltoken}`
}

export const getUserInfo = async (userId: string, guildId: string = auth.guildId) => {
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

export const getKookMessage = async (msg_id: string) => {
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