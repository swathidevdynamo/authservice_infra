import KcAdminClient from "@keycloak/keycloak-admin-client";
import { keycloakConfig } from "../config/index.js";
import logger from "../utils/logger.js";

export class RoleService {
  constructor(private kc: KcAdminClient) {}

  // Ensure client roles (not realm roles)
  async ensureRoles(roles: string[]) {
    // Get clientId from config
    const clientId = keycloakConfig.myClient;
    if (!clientId) throw new Error("Client ID not configured");

    // Find the client to get its internal ID
    const clients = await this.kc.clients.find({ clientId });
    const client = clients[0];
    if (!client) throw new Error(`Client '${clientId}' not found`);

    // Get existing client roles
    const existingRoles = await this.kc.clients.listRoles({ id: client.id! });

    for (const roleName of roles) {
      const exists = existingRoles.some(r => r.name === roleName);
      if (!exists) {
        await this.kc.clients.createRole({
          id: client.id!,
          name: roleName,
        });
        logger.info(`✅ Client Role '${roleName}' created`);
      } else {
        logger.info(`ℹ️ Client Role '${roleName}' already exists`);
      }
    }
  }

  // Assign a client role to a group
  async assignRoleToGroup(roleName: string, groupName: string) {
    const clientId = keycloakConfig.myClient;
    if (!clientId) throw new Error("Client ID not configured");

    // Find the client to get its internal ID
    const clients = await this.kc.clients.find({ clientId });
    const client = clients[0];
    if (!client) throw new Error(`Client '${clientId}' not found`);

    // Find the client role
    const role = await this.kc.clients.findRole({
      id: client.id!,
      roleName,
    });

    // Find the group
    const groups = await this.kc.groups.find();
    const group = groups.find(g => g.name === groupName);

    if (!role || !group) throw new Error(`Role '${roleName}' or group '${groupName}' not found`);

    // Assign the client role to the group
    await this.kc.groups.addClientRoleMappings({
      id: group.id!,
      clientUniqueId: client.id!,
      roles: [{ id: role.id!, name: role.name! }],
    });

    logger.info(`✅ Client Role '${roleName}' assigned to group '${groupName}'`);
  }
}
