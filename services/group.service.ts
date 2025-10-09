import IdentityProviderAdminClient from "@keycloak/keycloak-admin-client";
import logger from "../utils/logger.js";

export class GroupService {
  constructor(private idpAdminClient: IdentityProviderAdminClient) {}

  async ensureGroups(groups: string[]) {
    const existingGroups = await this.idpAdminClient.groups.find();

    for (const groupName of groups) {
      const exists = existingGroups.some((g: { name: string; }) => g.name === groupName);
      if (!exists) {
        await this.idpAdminClient.groups.create({ name: groupName });
        logger.debug(`✅ Group '${groupName}' created`);
      } else {
        logger.debug(`ℹ️ Group '${groupName}' already exists`);
      }
    }
  }
}
