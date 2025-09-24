import { ref } from "vue";
import { defineStore } from "pinia";
import { getLoginUserUsingGet } from "@/api/userController";

export const useLoginUserStore = defineStore("loginUser", () => {
  // 从 localStorage 初始化登录状态
  const storedUser = localStorage.getItem("login-user");
  const loginUser = ref<API.LoginUserVO>(
    storedUser ? JSON.parse(storedUser) : { userName: "未登录" }
  );

  // 获取登录用户信息
  async function fetchLoginUser() {
    const res = await getLoginUserUsingGet();
    if (res.data.code == 0 && res.data.data) {
      loginUser.value = res.data.data;
      // 保存到 localStorage
      localStorage.setItem("login-user", JSON.stringify(res.data.data));
    } else {
      // 如果获取失败，重置为未登录状态
      loginUser.value = {
        userName: "未登录",
        userRole: "notLogin",
      };
      // 清除 localStorage
      localStorage.removeItem("login-user");
    }
  }

  // 设置登录用户信息
  function setLoginUser(newLoginUser: API.LoginUserVO) {
    loginUser.value = newLoginUser;
    // 持久化到 localStorage
    localStorage.setItem("login-user", JSON.stringify(newLoginUser));
  }

  return { loginUser, fetchLoginUser, setLoginUser };
});
