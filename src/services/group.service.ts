import KcAdminClient from "@keycloak/keycloak-admin-client";
import logger from "../utils/logger.js";

export class GroupService {
  constructor(private kc: KcAdminClient) {}

  async ensureGroups(groups: string[]) {
    const existingGroups = await this.kc.groups.find();

    for (const groupName of groups) {
      const exists = existingGroups.some(g => g.name === groupName);
      if (!exists) {
        await this.kc.groups.create({ name: groupName });
        logger.info(`✅ Group '${groupName}' created`);
      } else {
        logger.info(`ℹ️ Group '${groupName}' already exists`);
      }
    }
  }
}
