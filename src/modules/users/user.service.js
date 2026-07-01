import * as userRepository from "./user.repository.js";

export const getUsers = async () => {
  return userRepository.listUsers();
};
